import { describe, expect, it } from "vitest";
import { applyEcosystemEvent, createInitialLivingShelfState } from "@teammultiply/ecosystem-core";
import { PetParadeSortShelfPack, validateShelfPack } from "@teammultiply/shelf-pack";

describe("Pet Parade Sort Shelf Pack", () => {
  it("contains a complete entryway pack with deterministic rewards and five behaviors", () => {
    expect(validateShelfPack(PetParadeSortShelfPack).success).toBe(true);
    expect(PetParadeSortShelfPack.collectibles).toHaveLength(7);
    expect(PetParadeSortShelfPack.behaviors).toHaveLength(5);
    expect(PetParadeSortShelfPack.environmentLayers.map((layer) => layer.id)).toContain("pet-parade-entryway-layer");
  });

  it("applies and retries a completion event without duplicating its unique reward", () => {
    const world = createInitialLivingShelfState({ now: "2026-07-20T12:00:00.000Z" });
    const event = {
      schemaVersion: 1 as const,
      eventId: "pet-parade-sort:game:pps-tutorial-01",
      type: "game.completed" as const,
      gameId: "pet-parade-sort",
      levelId: "pps-tutorial-01",
      occurredAt: "2026-07-20T12:00:00.000Z",
      result: { score: 1200, moves: 3, completedAt: "2026-07-20T12:00:00.000Z" }
    };
    const first = applyEcosystemEvent(world, event, [PetParadeSortShelfPack], event.occurredAt);
    const retry = applyEcosystemEvent(first.state, event, [PetParadeSortShelfPack], event.occurredAt);
    expect(first.rewardedObjectIds).toEqual(["parade-entryway-bench"]);
    expect(first.state.unlockedPacks).toContain(PetParadeSortShelfPack.packId);
    expect(retry.duplicate).toBe(true);
    expect(retry.state.inventory.find((entry) => entry.objectId === "parade-entryway-bench")?.count).toBe(1);
  });
});
