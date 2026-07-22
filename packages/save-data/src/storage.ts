import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { z } from "zod";
import {
  LivingShelfStateSchema,
  WORLD_SCHEMA_VERSION,
  formatZodIssues,
  type LivingShelfState,
  type PlacementState
} from "@teammultiply/ecosystem-core";

interface StoredWorld {
  id: "current" | "recovery";
  payload: unknown;
  savedAt: string;
}

interface LivingShelfDatabase extends DBSchema {
  world: {
    key: "current";
    value: StoredWorld;
  };
  snapshot: {
    key: "recovery";
    value: StoredWorld;
  };
}

const LegacyPlacementSchema = z.object({
  placementId: z.string().min(1),
  objectId: z.string().min(1),
  surfaceId: z.enum(["shelf", "counter", "floor"]),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  rotation: z.number().min(0).max(359)
});

const LegacyV1WorldSchema = z.object({
  schemaVersion: z.literal(1),
  worldId: z.string().min(1),
  worldSeed: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  ownedObjectIds: z.array(z.string().min(1)),
  placements: z.array(LegacyPlacementSchema),
  settings: z
    .object({
      quietMode: z.boolean().optional(),
      reducedMotion: z.boolean().optional()
    })
    .optional()
});

export interface MigrationResult {
  state: LivingShelfState;
  migrated: boolean;
}

export const migrateWorld = (input: unknown): MigrationResult => {
  const current = LivingShelfStateSchema.safeParse(input);
  if (current.success) {
    return { state: current.data, migrated: false };
  }

  const legacy = LegacyV1WorldSchema.safeParse(input);
  if (!legacy.success) {
    throw new Error("Save validation failed. " + formatZodIssues(current.error.issues));
  }

  const counts = new Map<string, number>();
  for (const objectId of legacy.data.ownedObjectIds) {
    counts.set(objectId, (counts.get(objectId) ?? 0) + 1);
  }
  const placements: PlacementState[] = legacy.data.placements.map((placement) => ({ ...placement }));
  const state: LivingShelfState = {
    schemaVersion: WORLD_SCHEMA_VERSION,
    worldId: legacy.data.worldId,
    worldSeed: legacy.data.worldSeed ?? 170719,
    createdAt: legacy.data.createdAt,
    updatedAt: legacy.data.updatedAt,
    unlockedPacks: ["counter-cat.test-pack"],
    inventory: [...counts.entries()].map(([objectId, count]) => ({ objectId, count })),
    placements,
    receipts: [],
    discoveries: [],
    eventLog: [],
    appliedEventIds: [],
    settings: {
      quietMode: legacy.data.settings?.quietMode ?? false,
      reducedMotion: legacy.data.settings?.reducedMotion ?? false
    }
  };
  return {
    state: LivingShelfStateSchema.parse(state),
    migrated: true
  };
};

export const serializeWorld = (state: LivingShelfState) =>
  JSON.stringify(LivingShelfStateSchema.parse(state), null, 2);

export class ShelfStorage {
  private database?: Promise<IDBPDatabase<LivingShelfDatabase>>;
  private writeChain: Promise<void> = Promise.resolve();

  public constructor(private readonly dbName = "teammultiply-living-shelf") {}

  private getDatabase() {
    if (!this.database) {
      this.database = openDB<LivingShelfDatabase>(this.dbName, 1, {
        upgrade(database) {
          if (!database.objectStoreNames.contains("world")) {
            database.createObjectStore("world", { keyPath: "id" });
          }
          if (!database.objectStoreNames.contains("snapshot")) {
            database.createObjectStore("snapshot", { keyPath: "id" });
          }
        }
      });
    }
    return this.database;
  }

  private queueWrite(operation: () => Promise<void>) {
    const next = this.writeChain.then(operation, operation);
    this.writeChain = next.catch(() => undefined);
    return next;
  }

  public async save(state: LivingShelfState) {
    const validated = LivingShelfStateSchema.parse(structuredClone(state));
    return this.queueWrite(async () => {
      const database = await this.getDatabase();
      const transaction = database.transaction(["world", "snapshot"], "readwrite");
      const worldStore = transaction.objectStore("world");
      const snapshotStore = transaction.objectStore("snapshot");
      const current = await worldStore.get("current");

      if (current) {
        await snapshotStore.put({
          id: "recovery",
          payload: current.payload,
          savedAt: current.savedAt
        });
      }
      await worldStore.put({
        id: "current",
        payload: validated,
        savedAt: validated.updatedAt
      });
      await transaction.done;
    });
  }

  private async replaceCurrent(state: LivingShelfState) {
    const database = await this.getDatabase();
    const transaction = database.transaction("world", "readwrite");
    await transaction.objectStore("world").put({
      id: "current",
      payload: state,
      savedAt: state.updatedAt
    });
    await transaction.done;
  }

  public async load(): Promise<LivingShelfState | null> {
    const database = await this.getDatabase();
    const current = await database.get("world", "current");
    if (!current) {
      return null;
    }

    try {
      const result = migrateWorld(current.payload);
      if (result.migrated) {
        await this.save(result.state);
      }
      return result.state;
    } catch (error) {
      const snapshot = await database.get("snapshot", "recovery");
      if (!snapshot) {
        throw error;
      }
      const recovered = migrateWorld(snapshot.payload).state;
      await this.replaceCurrent(recovered);
      return recovered;
    }
  }

  public async loadOrCreate(createState: () => LivingShelfState) {
    const loaded = await this.load();
    if (loaded) {
      return loaded;
    }
    const fresh = LivingShelfStateSchema.parse(createState());
    await this.save(fresh);
    return fresh;
  }

  public async getRecoverySnapshot(): Promise<LivingShelfState | null> {
    const database = await this.getDatabase();
    const snapshot = await database.get("snapshot", "recovery");
    return snapshot ? migrateWorld(snapshot.payload).state : null;
  }

  public async importJson(serialized: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(serialized);
    } catch {
      throw new Error("Import failed: the file is not valid JSON.");
    }
    const result = migrateWorld(parsed);
    await this.save(result.state);
    return result.state;
  }

  public async clear() {
    return this.queueWrite(async () => {
      const database = await this.getDatabase();
      const transaction = database.transaction(["world", "snapshot"], "readwrite");
      await transaction.objectStore("world").clear();
      await transaction.objectStore("snapshot").clear();
      await transaction.done;
    });
  }
}
