import type {
  CollectibleDefinition,
  EcosystemEvent,
  LivingShelfState,
  ShelfPack,
  UnlockReceipt
} from "./contracts";
import { copyWorld } from "./world";

export interface EventApplication {
  state: LivingShelfState;
  duplicate: boolean;
  rewardedObjectIds: string[];
  receipts: UnlockReceipt[];
}

const eventMatchesUnlock = (event: EcosystemEvent, collectible: CollectibleDefinition) => {
  const rule = collectible.unlock;
  if (rule.eventType !== event.type || rule.gameId !== event.gameId) {
    return false;
  }
  if (rule.levelId && (!("levelId" in event) || event.levelId !== rule.levelId)) {
    return false;
  }
  if (event.type === "discovery.triggered" && rule.discoveryId !== event.discoveryId) {
    return false;
  }
  if (event.type === "story.completed" && rule.beatId !== event.beatId) {
    return false;
  }
  return true;
};

const incrementInventory = (state: LivingShelfState, objectId: string) => {
  const entry = state.inventory.find((candidate) => candidate.objectId === objectId);
  if (entry) {
    entry.count += 1;
    return;
  }
  state.inventory.push({ objectId, count: 1 });
};

export const applyEcosystemEvent = (
  current: LivingShelfState,
  event: EcosystemEvent,
  packs: ShelfPack[],
  appliedAt = new Date().toISOString()
): EventApplication => {
  if (current.appliedEventIds.includes(event.eventId)) {
    return {
      state: current,
      duplicate: true,
      rewardedObjectIds: [],
      receipts: current.receipts.filter((receipt) => receipt.eventId === event.eventId)
    };
  }

  const next = copyWorld(current);
  const matches = packs.flatMap((pack) =>
    pack.collectibles
      .filter((collectible) => eventMatchesUnlock(event, collectible))
      .map((collectible) => ({ pack, collectible }))
  );
  const rewardedObjectIds: string[] = [];
  const receipts: UnlockReceipt[] = [];

  for (const { pack } of matches) {
    if (!next.unlockedPacks.includes(pack.packId)) next.unlockedPacks.push(pack.packId);
  }

  for (const { pack, collectible } of matches) {
    const alreadyOwned = next.inventory.some(
      (entry) => entry.objectId === collectible.id && entry.count > 0
    );
    if (collectible.unique && alreadyOwned) {
      continue;
    }

    incrementInventory(next, collectible.id);
    const receipt: UnlockReceipt = {
      receiptId: "receipt:" + event.eventId + ":" + collectible.id,
      eventId: event.eventId,
      objectId: collectible.id,
      packId: pack.packId,
      receivedAt: appliedAt,
      classification: collectible.unlock.classification,
      provenance: collectible.provenanceCopy
    };
    next.receipts.push(receipt);
    receipts.push(receipt);
    rewardedObjectIds.push(collectible.id);
  }

  next.appliedEventIds.push(event.eventId);
  next.eventLog.push({
    eventId: event.eventId,
    type: event.type,
    appliedAt,
    rewardedObjectIds
  });
  next.updatedAt = appliedAt;

  return {
    state: next,
    duplicate: false,
    rewardedObjectIds,
    receipts
  };
};
