import { describe, expect, it } from "vitest";
import {
  COUNTER_CAT_LEGACY_CASES,
  COUNTER_CAT_LIVE_RELAY_STORAGE_KEY,
  acknowledgeCounterCatLiveRelay,
  counterCatEventIdFor,
  readCounterCatLiveRelay,
  type CounterCatLiveRelayStorage
} from "../src";

const firstNormalCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "case-01"
);
const secondNormalCase = COUNTER_CAT_LEGACY_CASES.find(
  (legacyCase) => legacyCase.levelId === "case-02"
);

if (!firstNormalCase || !secondNormalCase) {
  throw new Error("Counter Cat relay fixtures require the first two normal cases.");
}

const storageWith = (value: string | null): CounterCatLiveRelayStorage => {
  const values = new Map<string, string>();
  if (value !== null) values.set(COUNTER_CAT_LIVE_RELAY_STORAGE_KEY, value);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, next) => values.set(key, next),
    removeItem: (key) => values.delete(key)
  };
};

const relayRecord = (legacyKey: string, moves: number, completedAt = "2026-07-21T14:00:00.000Z") => ({
  schemaVersion: 1,
  eventId: counterCatEventIdFor(legacyKey),
  legacyKey,
  completedAt,
  moves
});

describe("Counter Cat live relay", () => {
  it("turns one source-locked relay record into the same stable event as the legacy import", () => {
    const record = relayRecord(firstNormalCase.sourceKey, 5);
    const report = readCounterCatLiveRelay(
      storageWith(JSON.stringify({ schemaVersion: 1, events: [record] }))
    );

    expect(report.records).toEqual([record]);
    expect(report.fallbacks).toEqual([]);
    expect(report.events).toEqual([
      {
        schemaVersion: 1,
        eventId: record.eventId,
        type: "game.completed",
        gameId: "counter-cat",
        levelId: "case-01",
        occurredAt: record.completedAt,
        result: { score: 0, moves: 5, completedAt: record.completedAt }
      }
    ]);
  });

  it("keeps malformed or unrecognized handoff records out of rewards", () => {
    const report = readCounterCatLiveRelay(
      storageWith(
        JSON.stringify({
          schemaVersion: 1,
          events: [
            relayRecord("cat:99:999:tilt", 2),
            {
              schemaVersion: 1,
              eventId: counterCatEventIdFor(firstNormalCase.sourceKey),
              legacyKey: firstNormalCase.sourceKey,
              completedAt: "not-a-date",
              moves: 3
            },
            {
              ...relayRecord(secondNormalCase.sourceKey, 4),
              eventId: "unexpected-event-id"
            }
          ]
        })
      )
    );

    expect(report.events).toEqual([]);
    expect(report.records).toEqual([]);
    expect(report.fallbacks.map((item) => item.reason)).toEqual([
      "unrecognized-relay-case",
      "invalid-relay-record",
      "mismatched-relay-event-id"
    ]);
  });

  it("acknowledges only processed event ids and leaves another queued case intact", () => {
    const first = relayRecord(firstNormalCase.sourceKey, 3);
    const second = relayRecord(secondNormalCase.sourceKey, 4, "2026-07-21T14:01:00.000Z");
    const storage = storageWith(JSON.stringify({ schemaVersion: 1, events: [first, second] }));

    expect(acknowledgeCounterCatLiveRelay(storage, [first.eventId])).toBe(true);
    const afterFirstAck = readCounterCatLiveRelay(storage);
    expect(afterFirstAck.records).toEqual([second]);

    expect(acknowledgeCounterCatLiveRelay(storage, [second.eventId])).toBe(true);
    expect(storage.getItem(COUNTER_CAT_LIVE_RELAY_STORAGE_KEY)).toBeNull();
  });
});
