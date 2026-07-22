import { describe, expect, it } from "vitest";
import {
  applyEcosystemEvent,
  copyWorld,
  isPlacementValid,
  runPrimaryBehavior
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

const worldWithBlueMug = () => {
  const applied = applyEcosystemEvent(
    createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z"),
    completionEvent,
    [CounterCatShelfPack]
  ).state;
  applied.placements.push({
    placementId: "placement:blue-mug",
    objectId: "blue-mug",
    surfaceId: "counter",
    x: 0.45,
    y: 0.48,
    rotation: 0
  });
  return applied;
};

describe("deterministic Counter Cat behavior", () => {
  it("moves a rolling object to the floor and records the discovery", () => {
    const world = worldWithBlueMug();
    const result = runPrimaryBehavior(world, [CounterCatShelfPack], "2026-07-19T12:01:00.000Z");

    expect(result.run?.behaviorId).toBe("counter-cat-bats-rolling-object");
    expect(result.state.placements[0]).toMatchObject({
      surfaceId: "floor",
      x: 0.62,
      y: 0.3,
      rotation: 90
    });
    expect(result.state.discoveries).toHaveLength(1);
  });

  it("reproduces the same primary behavior for the same seed and arrangement", () => {
    const first = worldWithBlueMug();
    const second = copyWorld(first);
    const firstRun = runPrimaryBehavior(first, [CounterCatShelfPack], "2026-07-19T12:01:00.000Z");
    const secondRun = runPrimaryBehavior(second, [CounterCatShelfPack], "2026-07-19T12:01:00.000Z");

    expect(secondRun.run).toEqual(firstRun.run);
    expect(secondRun.state.placements).toEqual(firstRun.state.placements);
  });

  it("protects yarn before batting when both objects share a surface", () => {
    const world = worldWithBlueMug();
    world.placements.push({
      placementId: "placement:yarn",
      objectId: "yarn-ball",
      surfaceId: "counter",
      x: 0.75,
      y: 0.5,
      rotation: 0
    });
    const result = runPrimaryBehavior(world, [CounterCatShelfPack], "2026-07-19T12:01:00.000Z");

    expect(result.run?.behaviorId).toBe("counter-cat-protects-yarn");
    expect(result.state.placements[0]).toMatchObject({
      surfaceId: "counter",
      x: 0.55,
      y: 0.62
    });
  });

  it("does not move objects in Quiet mode or reduced motion", () => {
    const quiet = worldWithBlueMug();
    quiet.settings.quietMode = true;
    const quietResult = runPrimaryBehavior(quiet, [CounterCatShelfPack]);
    expect(quietResult.suppressed).toBe("quiet-mode");
    expect(quietResult.state.placements[0].surfaceId).toBe("counter");

    const reduced = worldWithBlueMug();
    reduced.settings.reducedMotion = true;
    const reducedResult = runPrimaryBehavior(reduced, [CounterCatShelfPack]);
    expect(reducedResult.suppressed).toBe("reduced-motion");
    expect(reducedResult.state.placements[0].surfaceId).toBe("counter");
  });

  it("runs an unlocked Cozy Crochet behavior through the shared resident runner", () => {
    const world = createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z");
    world.unlockedPacks.push(CozyCrochetCrittersShelfPack.packId);
    world.inventory.push({ objectId: "crochet-yarn-basket", count: 1 }, { objectId: "crochet-handmade-fox", count: 1 });
    world.placements.push(
      { placementId: "placement:crochet-basket", objectId: "crochet-yarn-basket", surfaceId: "counter", x: 0.5, y: 0.5, rotation: 0 },
      { placementId: "placement:crochet-fox", objectId: "crochet-handmade-fox", surfaceId: "counter", x: 0.72, y: 0.62, rotation: 0 }
    );

    const result = runPrimaryBehavior(world, [CounterCatShelfPack, CozyCrochetCrittersShelfPack], "2026-07-19T12:01:00.000Z");

    expect(result.run?.behaviorId).toBe("mallow-guards-yarn-basket");
    expect(result.state.placements.find((placement) => placement.objectId === "crochet-handmade-fox")).toMatchObject({
      x: 0.76,
      y: 0.54
    });
    const fox = result.state.placements.find((placement) => placement.objectId === "crochet-handmade-fox");
    expect(fox && isPlacementValid(result.state, [CounterCatShelfPack, CozyCrochetCrittersShelfPack], fox).valid).toBe(true);
  });

  it("does not resolve a behavior from a pack that has not been unlocked", () => {
    const world = worldWithBlueMug();
    world.unlockedPacks = [];
    expect(runPrimaryBehavior(world, [CounterCatShelfPack]).run).toBeNull();
  });
});
