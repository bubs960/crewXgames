import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { copyWorld } from "@teammultiply/ecosystem-core";
import { createCounterCatFixtureWorld } from "@teammultiply/shelf-pack";
import { ShelfStorage, migrateWorld } from "@teammultiply/save-data";

const dbName = () => "living-shelf-test-" + crypto.randomUUID();

describe("local-first Shelf storage", () => {
  it("restores exact inventory ownership and placement after a save", async () => {
    const storage = new ShelfStorage(dbName());
    const state = createCounterCatFixtureWorld("2026-07-19T12:00:00.000Z");
    state.inventory.push({ objectId: "blue-mug", count: 1 });
    state.placements.push({
      placementId: "placement:blue-mug",
      objectId: "blue-mug",
      surfaceId: "shelf",
      x: 0.37,
      y: 0.54,
      rotation: 270
    });

    await storage.save(state);
    const restored = await storage.load();

    expect(restored?.inventory).toEqual(state.inventory);
    expect(restored?.placements).toEqual(state.placements);
  });

  it("keeps one atomic recovery snapshot of the last stable save", async () => {
    const storage = new ShelfStorage(dbName());
    const first = createCounterCatFixtureWorld("2026-07-19T12:00:00.000Z");
    await storage.save(first);

    const second = copyWorld(first);
    second.updatedAt = "2026-07-19T12:01:00.000Z";
    second.placements.push({
      placementId: "placement:yarn",
      objectId: "yarn-ball",
      surfaceId: "counter",
      x: 0.5,
      y: 0.5,
      rotation: 0
    });
    await storage.save(second);

    expect(await storage.getRecoverySnapshot()).toEqual(first);
    expect(await storage.load()).toEqual(second);
  });

  it("keeps an unfinished placement out of the durable state", async () => {
    const storage = new ShelfStorage(dbName());
    const stable = createCounterCatFixtureWorld("2026-07-19T12:00:00.000Z");
    await storage.save(stable);

    const inProgressOnly = copyWorld(stable);
    inProgressOnly.placements.push({
      placementId: "preview:dented-can",
      objectId: "dented-can",
      surfaceId: "counter",
      x: 0.45,
      y: 0.55,
      rotation: 0
    });

    expect(inProgressOnly.placements).toHaveLength(1);
    expect(await storage.load()).toEqual(stable);
  });

  it("imports a version-one save through the tested migration", async () => {
    const storage = new ShelfStorage(dbName());
    const v1 = {
      schemaVersion: 1,
      worldId: "v1-world",
      worldSeed: 9,
      createdAt: "2026-07-19T12:00:00.000Z",
      updatedAt: "2026-07-19T12:00:00.000Z",
      ownedObjectIds: ["blue-mug", "blue-mug", "yarn-ball"],
      placements: [
        {
          placementId: "placement:blue-mug",
          objectId: "blue-mug",
          surfaceId: "shelf",
          x: 0.2,
          y: 0.3,
          rotation: 90
        }
      ]
    };

    const migrated = migrateWorld(v1);
    expect(migrated.migrated).toBe(true);
    expect(migrated.state.schemaVersion).toBe(2);
    expect(migrated.state.inventory).toContainEqual({ objectId: "blue-mug", count: 2 });

    const imported = await storage.importJson(JSON.stringify(v1));
    expect(imported.schemaVersion).toBe(2);
    expect((await storage.load())?.placements).toEqual(migrated.state.placements);
  });

  it("rejects malformed imports before they can replace a valid world", async () => {
    const storage = new ShelfStorage(dbName());
    const original = createCounterCatFixtureWorld("2026-07-19T12:00:00.000Z");
    await storage.save(original);

    await expect(storage.importJson("{ definitely not JSON")).rejects.toThrow("not valid JSON");
    expect(await storage.load()).toEqual(original);
  });
});
