import { describe, expect, it } from "vitest";
import {
  applyEcosystemEvent,
  isPlacementValid
} from "@teammultiply/ecosystem-core";
import {
  CounterCatShelfPack,
  CozyCrochetCrittersShelfPack,
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

describe("placement validation", () => {
  it("requires owned inventory before a new placement can commit", () => {
    const state = createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z");
    const result = isPlacementValid(state, CounterCatShelfPack, {
      placementId: "placement:blue-mug",
      objectId: "blue-mug",
      surfaceId: "counter",
      x: 0.5,
      y: 0.5,
      rotation: 0
    });

    expect(result).toMatchObject({
      valid: false,
      reason: "Blue Mug is not available in the inventory."
    });
  });

  it("prevents object collisions and out-of-surface placements", () => {
    const state = applyEcosystemEvent(
      createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z"),
      completionEvent,
      [CounterCatShelfPack]
    ).state;
    state.placements.push({
      placementId: "placement:yarn",
      objectId: "yarn-ball",
      surfaceId: "counter",
      x: 0.5,
      y: 0.5,
      rotation: 0
    });

    const collision = isPlacementValid(state, CounterCatShelfPack, {
      placementId: "placement:blue-mug",
      objectId: "blue-mug",
      surfaceId: "counter",
      x: 0.5,
      y: 0.5,
      rotation: 0
    });
    expect(collision.valid).toBe(false);
    expect(collision.reason).toContain("already has an object");

    const boundary = isPlacementValid(state, CounterCatShelfPack, {
      placementId: "placement:blue-mug",
      objectId: "blue-mug",
      surfaceId: "shelf",
      x: 0.02,
      y: 0.5,
      rotation: 0
    });
    expect(boundary.valid).toBe(false);
    expect(boundary.reason).toContain("whole object");
  });

  it("does not place an inventory record from a Shelf Pack that is still locked", () => {
    const state = createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z");
    state.inventory.push({ objectId: "crochet-yarn-basket", count: 1 });

    const result = isPlacementValid(state, [CounterCatShelfPack, CozyCrochetCrittersShelfPack], {
      placementId: "placement:crochet-basket",
      objectId: "crochet-yarn-basket",
      surfaceId: "counter",
      x: 0.5,
      y: 0.5,
      rotation: 0
    });

    expect(result).toMatchObject({ valid: false, reason: expect.stringContaining("not unlocked") });
  });
});
