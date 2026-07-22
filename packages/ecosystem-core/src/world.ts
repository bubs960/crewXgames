import type {
  InventoryEntry,
  LivingShelfState,
  PlacementState,
  UnlockReceipt
} from "./contracts";
import { WORLD_SCHEMA_VERSION } from "./contracts";

export interface InitialWorldOptions {
  worldId?: string;
  worldSeed?: number;
  now?: string;
  inventory?: InventoryEntry[];
  receipts?: UnlockReceipt[];
}

export const createInitialLivingShelfState = (options: InitialWorldOptions = {}): LivingShelfState => {
  const now = options.now ?? new Date().toISOString();
  return {
    schemaVersion: WORLD_SCHEMA_VERSION,
    worldId: options.worldId ?? "living-shelf-local-world",
    worldSeed: options.worldSeed ?? 170719,
    createdAt: now,
    updatedAt: now,
    unlockedPacks: ["counter-cat.test-pack"],
    inventory: options.inventory ?? [],
    placements: [],
    receipts: options.receipts ?? [],
    discoveries: [],
    eventLog: [],
    appliedEventIds: [],
    settings: {
      quietMode: false,
      reducedMotion: false
    }
  };
};

export const copyWorld = (state: LivingShelfState): LivingShelfState => structuredClone(state);

export const countPlacedObjects = (state: LivingShelfState, objectId: string) =>
  state.placements.filter((placement) => placement.objectId === objectId).length;

export const inventoryCount = (state: LivingShelfState, objectId: string) =>
  state.inventory.find((entry) => entry.objectId === objectId)?.count ?? 0;

export const availableInventoryCount = (state: LivingShelfState, objectId: string) =>
  Math.max(0, inventoryCount(state, objectId) - countPlacedObjects(state, objectId));

export const withUpdatedPlacement = (
  state: LivingShelfState,
  placement: PlacementState,
  updatedAt = new Date().toISOString()
): LivingShelfState => {
  const next = copyWorld(state);
  const index = next.placements.findIndex((candidate) => candidate.placementId === placement.placementId);
  if (index >= 0) {
    next.placements[index] = placement;
  } else {
    next.placements.push(placement);
  }
  next.updatedAt = updatedAt;
  return next;
};
