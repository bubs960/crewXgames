import { describe, expect, it } from "vitest";
import {
  applyEcosystemEvent,
  inventoryCount
} from "@teammultiply/ecosystem-core";
import {
  CounterCatShelfPack,
  createCounterCatFixtureWorld
} from "@teammultiply/shelf-pack";

const completionEvent = {
  schemaVersion: 1 as const,
  eventId: "counter-cat:case-01:complete",
  type: "game.completed" as const,
  gameId: "counter-cat",
  levelId: "case-01",
  occurredAt: "2026-07-19T12:00:00.000Z",
  result: {
    score: 1200,
    moves: 8,
    completedAt: "2026-07-19T12:00:00.000Z"
  }
};

describe("idempotent ecosystem rewards", () => {
  it("unlocks the Blue Mug once and attaches provenance", () => {
    const initial = createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z");
    const first = applyEcosystemEvent(
      initial,
      completionEvent,
      [CounterCatShelfPack],
      "2026-07-19T12:00:01.000Z"
    );

    expect(first.duplicate).toBe(false);
    expect(first.rewardedObjectIds).toEqual(["blue-mug"]);
    expect(inventoryCount(first.state, "blue-mug")).toBe(1);
    expect(first.receipts[0]?.provenance).toContain("Counter Cat Case 01");

    const duplicate = applyEcosystemEvent(
      first.state,
      completionEvent,
      [CounterCatShelfPack],
      "2026-07-19T12:00:02.000Z"
    );
    expect(duplicate.duplicate).toBe(true);
    expect(inventoryCount(duplicate.state, "blue-mug")).toBe(1);
  });

  it("does not duplicate a unique object for another matching completion", () => {
    const initial = createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z");
    const first = applyEcosystemEvent(initial, completionEvent, [CounterCatShelfPack]);
    const replayWithAnotherEventId = applyEcosystemEvent(
      first.state,
      { ...completionEvent, eventId: "counter-cat:case-01:replayed" },
      [CounterCatShelfPack]
    );

    expect(replayWithAnotherEventId.duplicate).toBe(false);
    expect(replayWithAnotherEventId.rewardedObjectIds).toEqual([]);
    expect(inventoryCount(replayWithAnotherEventId.state, "blue-mug")).toBe(1);
  });
});
