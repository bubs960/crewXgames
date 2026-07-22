import type { LivingShelfState, PlacementState, ShelfPack } from "./contracts";
import { availableInventoryCount } from "./world";

export interface PlacementValidation {
  valid: boolean;
  reason?: string;
}

const overlaps = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) =>
  Math.abs(a.x - b.x) * 2 < a.width + b.width && Math.abs(a.y - b.y) * 2 < a.height + b.height;

export const normalizeRotation = (rotation: number) => ((rotation % 360) + 360) % 360;

export const isPlacementValid = (
  state: LivingShelfState,
  packInput: ShelfPack | ShelfPack[],
  candidate: PlacementState
): PlacementValidation => {
  const packs = Array.isArray(packInput) ? packInput : [packInput];
  const definitions = packs.flatMap((pack) => pack.collectibles.map((collectible) => ({ pack, collectible })));
  const matched = definitions.find(({ collectible }) => collectible.id === candidate.objectId);
  if (!matched) {
    return { valid: false, reason: 'Unknown object "' + candidate.objectId + '".' };
  }
  const { definition, pack } = { definition: matched.collectible, pack: matched.pack };
  if (!state.unlockedPacks.includes(pack.packId)) {
    return { valid: false, reason: definition.displayName + " belongs to a Shelf Pack that is not unlocked yet." };
  }
  if (!definition.validSurfaces.includes(candidate.surfaceId)) {
    return { valid: false, reason: definition.displayName + " cannot sit on the " + candidate.surfaceId + "." };
  }

  const exists = state.placements.some((placement) => placement.placementId === candidate.placementId);
  if (!exists && availableInventoryCount(state, candidate.objectId) < 1) {
    return { valid: false, reason: definition.displayName + " is not available in the inventory." };
  }

  const footprint = definition.footprint;
  if (
    candidate.x - footprint.width / 2 < 0 ||
    candidate.x + footprint.width / 2 > 1 ||
    candidate.y - footprint.height / 2 < 0 ||
    candidate.y + footprint.height / 2 > 1
  ) {
    return { valid: false, reason: "Keep the whole object on its surface." };
  }

  const collision = state.placements.some((placement) => {
    if (placement.placementId === candidate.placementId || placement.surfaceId !== candidate.surfaceId) {
      return false;
    }
    const other = definitions.find(({ collectible }) => collectible.id === placement.objectId)?.collectible;
    if (!other) {
      return false;
    }
    return overlaps(
      { x: candidate.x, y: candidate.y, width: footprint.width, height: footprint.height },
      { x: placement.x, y: placement.y, width: other.footprint.width, height: other.footprint.height }
    );
  });

  if (collision) {
    return { valid: false, reason: "That surface already has an object there." };
  }

  return { valid: true };
};
