import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { inventoryCount } from "@teammultiply/ecosystem-core";
import {
  COUNTER_CAT_LEGACY_CASES,
  importCounterCatLegacyProgress
} from "@teammultiply/counter-cat-bridge";
import { ShelfStorage } from "@teammultiply/save-data";
import { CounterCatShelfPack, createCounterCatFixtureWorld } from "@teammultiply/shelf-pack";
import { commitCounterCatLegacyImport } from "../src/counterCatLegacyImport";

const firstNormalCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "case-01"
);

if (!firstNormalCase) {
  throw new Error("Counter Cat bridge fixture is missing Case 01.");
}

describe("Living Shelf Counter Cat import commit", () => {
  it("persists one reviewed local import and keeps a replay from duplicating the reward", async () => {
    const storage = new ShelfStorage("living-shelf-counter-cat-import-" + crypto.randomUUID());
    const initial = createCounterCatFixtureWorld("2026-07-20T13:00:00.000Z");
    await storage.save(initial);
    const report = importCounterCatLegacyProgress(
      { kio_done: JSON.stringify({ [firstNormalCase.sourceKey]: 1 }) },
      "2026-07-20T14:00:00.000Z"
    );

    const first = await commitCounterCatLegacyImport(
      storage,
      initial,
      report,
      [CounterCatShelfPack],
      "2026-07-20T14:00:01.000Z"
    );
    if (!first.ok) throw new Error(first.error);

    expect(first.application.acceptedEventIds).toHaveLength(1);
    expect(inventoryCount(first.application.state, "blue-mug")).toBe(1);
    expect(inventoryCount((await storage.load())!, "blue-mug")).toBe(1);

    const replay = await commitCounterCatLegacyImport(
      storage,
      first.application.state,
      report,
      [CounterCatShelfPack],
      "2026-07-20T14:00:02.000Z"
    );
    if (!replay.ok) throw new Error(replay.error);

    expect(replay.application.acceptedEventIds).toEqual([]);
    expect(replay.application.duplicateEventIds).toHaveLength(1);
    expect(inventoryCount((await storage.load())!, "blue-mug")).toBe(1);
  });
});
