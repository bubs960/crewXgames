import type {
  EcosystemEvent,
  LivingShelfState,
  ShelfPack,
  UnlockReceipt
} from "@teammultiply/ecosystem-core";
import { receiveGameEvent } from "@teammultiply/game-bridge";
import type { CounterCatLegacyImportReport } from "./legacy";

export interface CounterCatLegacyImportApplication {
  ok: true;
  state: LivingShelfState;
  acceptedEventIds: string[];
  duplicateEventIds: string[];
  rewardedObjectIds: string[];
  receipts: UnlockReceipt[];
}

export interface CounterCatLegacyImportFailure {
  ok: false;
  error: string;
}

export type CounterCatLegacyImportApplicationResult =
  | CounterCatLegacyImportApplication
  | CounterCatLegacyImportFailure;

/**
 * Applies a reviewed report only through the existing game-event boundary.
 * The caller can persist the returned state once, after every event succeeds.
 */
export const applyCounterCatEventBatch = (
  current: LivingShelfState,
  events: readonly EcosystemEvent[],
  packs: ShelfPack[],
  appliedAt = new Date().toISOString()
): CounterCatLegacyImportApplicationResult => {
  let state = current;
  const acceptedEventIds: string[] = [];
  const duplicateEventIds: string[] = [];
  const rewardedObjectIds: string[] = [];
  const receipts: UnlockReceipt[] = [];

  for (const event of events) {
    const received = receiveGameEvent(state, event, packs, appliedAt);
    if (!received.ok) {
      return {
        ok: false,
        error: received.error
      };
    }

    state = received.application.state;
    if (received.application.duplicate) {
      duplicateEventIds.push(event.eventId);
      continue;
    }

    acceptedEventIds.push(event.eventId);
    rewardedObjectIds.push(...received.application.rewardedObjectIds);
    receipts.push(...received.application.receipts);
  }

  return {
    ok: true,
    state,
    acceptedEventIds,
    duplicateEventIds,
    rewardedObjectIds,
    receipts
  };
};

export const applyCounterCatLegacyImport = (
  current: LivingShelfState,
  report: CounterCatLegacyImportReport,
  packs: ShelfPack[],
  appliedAt = new Date().toISOString()
): CounterCatLegacyImportApplicationResult =>
  applyCounterCatEventBatch(current, report.events, packs, appliedAt);
