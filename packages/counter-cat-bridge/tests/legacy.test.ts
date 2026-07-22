import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { inventoryCount } from "@teammultiply/ecosystem-core";
import { receiveGameEvent } from "@teammultiply/game-bridge";
import {
  CounterCatShelfPack,
  createCounterCatFixtureWorld
} from "@teammultiply/shelf-pack";
import {
  COUNTER_CAT_LEGACY_CASES,
  COUNTER_CAT_LEGACY_SOURCE_SHA256,
  importCounterCatLegacyProgress,
  summarizeCounterCatLegacyImport
} from "../src";

const importedAt = "2026-07-19T15:00:00.000Z";
const firstNormalCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "case-01"
);
const secondNormalCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "case-02"
);
const firstExpertCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "expert-case-01"
);

if (!firstNormalCase || !secondNormalCase || !firstExpertCase) {
  throw new Error("Counter Cat bridge fixture is missing its baseline cases.");
}

const sourceLadder = (source: string, name: string) => {
  const marker = "const " + name + " = /*" + name.replaceAll("_", "-") + "-JSON*/";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("Missing " + name + " in Counter Cat source.");
  const jsonStart = start + marker.length;
  const jsonEnd = source.indexOf(";", jsonStart);
  return JSON.parse(source.slice(jsonStart, jsonEnd)) as Array<{ seed: number }>;
};

describe("Counter Cat legacy bridge", () => {
  it("covers every seed-locked Counter Cat completion key in the source-locked static game", () => {
    const sourcePath = fileURLToPath(new URL("../../../waddle-home/index.html", import.meta.url));
    const source = readFileSync(sourcePath, "utf8");
    const normal = sourceLadder(source, "CAT_LEVELS");
    const expert = sourceLadder(source, "CAT_EXPERT_LEVELS");
    const expectedKeys = [
      ...normal.map((level, index) => "cat:" + index + ":" + level.seed + ":tilt"),
      ...expert.map((level, index) => "cat:" + index + ":" + level.seed + ":lane")
    ];

    expect(COUNTER_CAT_LEGACY_CASES.map((legacyCase) => legacyCase.sourceKey)).toEqual(expectedKeys);
    expect(COUNTER_CAT_LEGACY_CASES).toHaveLength(88);
    expect(createHash("sha256").update(source).digest("hex")).toBe(
      COUNTER_CAT_LEGACY_SOURCE_SHA256
    );
    expect(source).toContain("function queueCounterCatShelfRelay(legacyKey, moveCount)");
    expect(source).toContain("queueCounterCatShelfRelay(key, moves);");
    expect(source).toContain('id="btnShelf"');
    expect(source).toContain('id="starterGuide"');
    expect(source).toContain("Start Case 01");
    expect(source).toContain("function renderStarterGuide()");
    expect(source).toContain("const shouldShowStarterBriefing =");
  });

  it("turns an exact saved normal completion into a stable versioned event", () => {
    const first = importCounterCatLegacyProgress(
      { kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }) },
      importedAt
    );
    const later = importCounterCatLegacyProgress(
      { kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }) },
      "2026-07-20T15:00:00.000Z"
    );

    expect(first.events).toEqual([
      {
        schemaVersion: 1,
        eventId: "legacy:counter-cat:v1:" + firstNormalCase.sourceKey,
        type: "game.completed",
        gameId: "counter-cat",
        levelId: "case-01",
        occurredAt: importedAt,
        result: { score: 0, moves: 0, completedAt: importedAt }
      }
    ]);
    expect(later.events[0]?.eventId).toBe(first.events[0]?.eventId);
    expect(first.fallbacks).toEqual([]);
  });

  it("merges matching done and best records without emitting a duplicate event", () => {
    const report = importCounterCatLegacyProgress(
      {
        kio_done: JSON.stringify({ [secondNormalCase.sourceKey]: 1 }),
        ["kio_best:" + secondNormalCase.sourceKey]: "7"
      },
      importedAt
    );

    expect(report.events).toHaveLength(1);
    expect(report.events[0]).toMatchObject({
      type: "game.completed",
      levelId: "case-02",
      result: { moves: 7 }
    });
    expect(report.importedRecords[0]?.evidence).toEqual(["best-record", "completion-map"]);
  });

  it("preserves the expert and daily event shapes without pretending they are normal cases", () => {
    const report = importCounterCatLegacyProgress(
      {
        kio_done: JSON.stringify({
          [firstExpertCase.sourceKey]: 1,
          "daily:2026-07-19:lane": 1
        })
      },
      importedAt
    );

    expect(report.events).toContainEqual(
      expect.objectContaining({
        type: "expert.completed",
        levelId: "expert-case-01"
      })
    );
    expect(report.events).toContainEqual(
      expect.objectContaining({
        type: "daily.completed",
        date: "2026-07-19"
      })
    );
  });

  it("keeps ambiguous or malformed legacy progress out of rewards and gives UI-ready fallback copy", () => {
    const report = importCounterCatLegacyProgress(
      {
        kio_done: JSON.stringify({
          [firstNormalCase.sourceKey]: true,
          "cat:99:999:tilt": 1
        }),
        "kio_level:cat": "4",
        "whc_best:4": "8"
      },
      importedAt
    );

    expect(report.events).toEqual([]);
    expect(report.fallbacks.map((item) => item.reason)).toEqual(
      expect.arrayContaining([
        "unverified-completion-value",
        "unrecognized-completion-key",
        "progress-pointer-only",
        "pre-seed-best-record"
      ])
    );
    expect(report.fallbacks.every((item) => item.message.includes("No Living Shelf reward was added"))).toBe(
      true
    );
    expect(summarizeCounterCatLegacyImport(report)).toEqual({
      kind: "needs-review",
      title: "Counter Cat progress needs a check",
      message:
        "We found saved progress, but it does not prove an exact completed case. No Living Shelf reward was added."
    });
  });

  it("does not turn a harmless last-level pointer into a warning when exact completion evidence exists", () => {
    const report = importCounterCatLegacyProgress(
      {
        kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }),
        "kio_level:cat": "4"
      },
      importedAt
    );

    expect(report.events).toHaveLength(1);
    expect(report.fallbacks).toEqual([]);
    expect(summarizeCounterCatLegacyImport(report).kind).toBe("imported");
  });

  it("passes a verified legacy event through the existing bridge and rewards Case 01 only once", () => {
    const report = importCounterCatLegacyProgress(
      { kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }) },
      importedAt
    );
    const initial = createCounterCatFixtureWorld("2026-07-19T14:00:00.000Z");
    const first = receiveGameEvent(initial, report.events[0], [CounterCatShelfPack], importedAt);
    if (!first.ok) throw new Error(first.error);

    expect(first.application.rewardedObjectIds).toEqual(["blue-mug"]);
    expect(inventoryCount(first.application.state, "blue-mug")).toBe(1);

    const replay = receiveGameEvent(
      first.application.state,
      report.events[0],
      [CounterCatShelfPack],
      "2026-07-19T15:00:01.000Z"
    );
    if (!replay.ok) throw new Error(replay.error);

    expect(replay.application.duplicate).toBe(true);
    expect(inventoryCount(replay.application.state, "blue-mug")).toBe(1);
  });
});
