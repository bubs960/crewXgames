import { describe, expect, it } from "vitest";
import { inventoryCount } from "@teammultiply/ecosystem-core";
import { CounterCatShelfPack, createCounterCatFixtureWorld } from "@teammultiply/shelf-pack";
import {
  COUNTER_CAT_LEGACY_CASES,
  applyCounterCatLegacyImport,
  importCounterCatLegacyProgress,
  snapshotCounterCatLegacyStorage,
  type LegacyStorageReader
} from "../src";

const firstNormalCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "case-01"
);

if (!firstNormalCase) {
  throw new Error("Counter Cat bridge fixture is missing Case 01.");
}

const storageReader = (entries: Record<string, string>): LegacyStorageReader => {
  const keys = Object.keys(entries);
  return {
    length: keys.length,
    key: (index) => keys[index] ?? null,
    getItem: (key) => entries[key] ?? null
  };
};

describe("Counter Cat legacy import workflow", () => {
  it("reads only Counter Cat proof keys from browser storage", () => {
    const snapshot = snapshotCounterCatLegacyStorage(
      storageReader({
        kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }),
        ["kio_best:" + firstNormalCase.sourceKey]: "6",
        "kio_level:cat": "2",
        whc_level: "9",
        "whc_best:3": "7",
        unrelated_preference: "do-not-copy"
      })
    );

    expect(snapshot).toEqual({
      kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }),
      ["kio_best:" + firstNormalCase.sourceKey]: "6",
      "kio_level:cat": "2",
      whc_level: "9",
      "whc_best:3": "7"
    });
  });

  it("applies a reviewed report in memory, then preserves replay safety", () => {
    const report = importCounterCatLegacyProgress(
      { kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }) },
      "2026-07-20T14:00:00.000Z"
    );
    const initial = createCounterCatFixtureWorld("2026-07-20T13:00:00.000Z");
    const first = applyCounterCatLegacyImport(
      initial,
      report,
      [CounterCatShelfPack],
      "2026-07-20T14:00:01.000Z"
    );
    if (!first.ok) throw new Error(first.error);

    expect(first.acceptedEventIds).toEqual(report.events.map((event) => event.eventId));
    expect(first.rewardedObjectIds).toEqual(["blue-mug"]);
    expect(inventoryCount(first.state, "blue-mug")).toBe(1);

    const replay = applyCounterCatLegacyImport(
      first.state,
      report,
      [CounterCatShelfPack],
      "2026-07-20T14:00:02.000Z"
    );
    if (!replay.ok) throw new Error(replay.error);

    expect(replay.acceptedEventIds).toEqual([]);
    expect(replay.duplicateEventIds).toEqual(report.events.map((event) => event.eventId));
    expect(inventoryCount(replay.state, "blue-mug")).toBe(1);
  });

  it("leaves a world untouched when a reviewed report contains no provable event", () => {
    const report = importCounterCatLegacyProgress(
      { kio_done: JSON.stringify({ "cat:99:999:tilt": 1 }) },
      "2026-07-20T14:00:00.000Z"
    );
    const initial = createCounterCatFixtureWorld("2026-07-20T13:00:00.000Z");
    const result = applyCounterCatLegacyImport(
      initial,
      report,
      [CounterCatShelfPack],
      "2026-07-20T14:00:01.000Z"
    );
    if (!result.ok) throw new Error(result.error);

    expect(result.acceptedEventIds).toEqual([]);
    expect(result.state).toBe(initial);
    expect(result.rewardedObjectIds).toEqual([]);
  });
});
