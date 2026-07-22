import type {
  BehaviorRecipe,
  DiscoveryRecord,
  LivingShelfState,
  ShelfPack
} from "./contracts";
import { isPlacementValid } from "./placement";
import { copyWorld } from "./world";

export interface BehaviorRun {
  behaviorId: string;
  title: string;
  copy: string;
  accessibilityNarration: string;
  changedPlacementId: string;
  discoveryAdded: boolean;
}

export interface BehaviorResolution {
  state: LivingShelfState;
  run: BehaviorRun | null;
  suppressed?: "quiet-mode" | "reduced-motion";
}

interface PackRecipe {
  pack: ShelfPack;
  recipe: BehaviorRecipe;
}

const sortRecipes = (recipes: PackRecipe[], seed: number) =>
  [...recipes].sort((left, right) => {
    if (right.recipe.priority !== left.recipe.priority) {
      return right.recipe.priority - left.recipe.priority;
    }
    return (String(seed) + ":" + left.recipe.id).localeCompare(String(seed) + ":" + right.recipe.id);
  });

const placementsForObject = (state: LivingShelfState, objectId: string) =>
  state.placements
    .filter((placement) => placement.objectId === objectId)
    .sort((left, right) => left.placementId.localeCompare(right.placementId));

const recipeCanRun = (state: LivingShelfState, recipe: BehaviorRecipe, pack: ShelfPack) => {
  const definitions = new Map(pack.collectibles.map((collectible) => [collectible.id, collectible]));
  const requiredPlacements = recipe.requiredCollectibleIds.map((objectId) => placementsForObject(state, objectId)[0]);
  if (requiredPlacements.some((placement) => !placement)) {
    return false;
  }
  if (requiredPlacements.some((placement) => !recipe.requiredSurfaces.includes(placement!.surfaceId))) {
    return false;
  }
  if (
    requiredPlacements.some(
      (placement) =>
        !definitions
          .get(placement!.objectId)
          ?.tags.some((tag) => recipe.requiredObjectTags.includes(tag))
    )
  ) {
    return false;
  }

  const action = recipe.action;
  if (action.type === "redirect-toward-object") {
    const target = requiredPlacements.find((placement) => placement!.objectId === action.targetObjectId);
    const anchor = requiredPlacements.find((placement) => placement!.objectId === action.anchorObjectId);
    return Boolean(target && anchor && target.surfaceId === anchor.surfaceId);
  }
  return true;
};

const addDiscovery = (
  state: LivingShelfState,
  recipe: BehaviorRecipe,
  discoveredAt: string
): { discovery: DiscoveryRecord; added: boolean } => {
  const existing = state.discoveries.find((discovery) => discovery.behaviorId === recipe.id);
  if (existing) {
    return { discovery: existing, added: false };
  }
  const discovery: DiscoveryRecord = {
    discoveryId: "discovery:" + recipe.id,
    behaviorId: recipe.id,
    discoveredAt,
    title: recipe.discovery.title,
    copy: recipe.discovery.copy,
    accessibilityNarration: recipe.discovery.accessibilityNarration
  };
  state.discoveries.push(discovery);
  return { discovery, added: true };
};

export const runPrimaryBehavior = (
  current: LivingShelfState,
  packs: ShelfPack[],
  ranAt = new Date().toISOString()
): BehaviorResolution => {
  if (current.settings.quietMode) {
    return { state: current, run: null, suppressed: "quiet-mode" };
  }
  if (current.settings.reducedMotion) {
    return { state: current, run: null, suppressed: "reduced-motion" };
  }

  const candidates = sortRecipes(
    packs
      .filter((pack) => current.unlockedPacks.includes(pack.packId))
      .flatMap((pack) => pack.behaviors.map((recipe) => ({ pack, recipe }))),
    current.worldSeed
  );

  for (const { pack, recipe } of candidates) {
    if (!recipeCanRun(current, recipe, pack)) {
      continue;
    }
    const next = copyWorld(current);
    const action = recipe.action;
    const target = next.placements.find((placement) => placement.objectId === action.targetObjectId);
    if (!target) {
      continue;
    }

    if (action.type === "move-to-floor") {
      target.surfaceId = "floor";
      target.x = action.destination.x;
      target.y = action.destination.y;
      target.rotation = ((target.rotation + action.destination.rotateBy) % 360 + 360) % 360;
    } else {
      const anchor = next.placements.find((placement) => placement.objectId === action.anchorObjectId);
      if (!anchor || anchor.surfaceId !== target.surfaceId) {
        continue;
      }
      target.x = Math.max(0.1, Math.min(0.9, anchor.x + action.offsetX));
      target.y = Math.max(0.1, Math.min(0.9, anchor.y + action.offsetY));
    }

    if (!isPlacementValid(next, packs, target).valid) {
      continue;
    }

    const discovery = addDiscovery(next, recipe, ranAt);
    next.updatedAt = ranAt;
    return {
      state: next,
      run: {
        behaviorId: recipe.id,
        title: discovery.discovery.title,
        copy: discovery.discovery.copy,
        accessibilityNarration: discovery.discovery.accessibilityNarration,
        changedPlacementId: target.placementId,
        discoveryAdded: discovery.added
      }
    };
  }

  return { state: current, run: null };
};
