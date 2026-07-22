import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { inventoryCount } from "@teammultiply/ecosystem-core";
import {
  COUNTER_CAT_LEGACY_CASES,
  COUNTER_CAT_LIVE_RELAY_STORAGE_KEY,
  acknowledgeCounterCatLiveRelay,
  counterCatEventIdFor,
  readCounterCatLiveRelay,
  type CounterCatLiveRelayStorage
} from "@teammultiply/counter-cat-bridge";
import { ShelfStorage } from "@teammultiply/save-data";
import { CounterCatShelfPack, createCounterCatFixtureWorld } from "@teammultiply/shelf-pack";
import { commitCounterCatEventBatch } from "../src/counterCatLegacyImport";

const firstNormalCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "case-01"
);

if (!firstNormalCase) {
  throw new Error("Counter Cat relay fixture is missing Case 01.");
}

const relayStorage = (value: string): CounterCatLiveRelayStorage => {
  const values = new Map([[COUNTER_CAT_LIVE_RELAY_STORAGE_KEY, value]]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, next) => values.set(key, next),
    removeItem: (key) => values.delete(key)
  };
};

const relayValue = () =>
  JSON.stringify({
    schemaVersion: 1,
    events: [
      {
        schemaVersion: 1,
        eventId: counterCatEventIdFor(firstNormalCase.sourceKey),
        legacyKey: firstNormalCase.sourceKey,
        completedAt: "2026-07-21T15:00:00.000Z",
        moves: 3
      }
    ]
  });

describe("Living Shelf Counter Cat live relay commit", () => {
  it("persists a relayed case, acknowledges it after save, and keeps a replay harmless", async () => {
    const storage = new ShelfStorage("living-shelf-counter-cat-relay-" + crypto.randomUUID());
    const initial = createCounterCatFixtureWorld("2026-07-21T14:00:00.000Z");
    await storage.save(initial);

    const outbox = relayStorage(relayValue());
    const report = readCounterCatLiveRelay(outbox);
    const first = await commitCounterCatEventBatch(
      storage,
      initial,
      report,
      [CounterCatShelfPack],
      "2026-07-21T15:00:01.000Z"
    );
    if (!first.ok) throw new Error(first.error);

    expect(first.application.acceptedEventIds).toEqual(report.events.map((event) => event.eventId));
    expect(inventoryCount(first.application.state, "blue-mug")).toBe(1);
    expect(inventoryCount((await storage.load())!, "blue-mug")).toBe(1);
    expect(acknowledgeCounterCatLiveRelay(outbox, first.application.acceptedEventIds)).toBe(true);
    expect(outbox.getItem(COUNTER_CAT_LIVE_RELAY_STORAGE_KEY)).toBeNull();

    const replayReport = readCounterCatLiveRelay(relayStorage(relayValue()));
    const replay = await commitCounterCatEventBatch(
      storage,
      first.application.state,
      replayReport,
      [CounterCatShelfPack],
      "2026-07-21T15:00:02.000Z"
    );
    if (!replay.ok) throw new Error(replay.error);

    expect(replay.application.acceptedEventIds).toEqual([]);
    expect(replay.application.duplicateEventIds).toEqual(replayReport.events.map((event) => event.eventId));
    expect(inventoryCount((await storage.load())!, "blue-mug")).toBe(1);
  });
});
