import type { EcosystemEvent, LivingShelfState, ShelfPack } from "@teammultiply/ecosystem-core";
import {
  applyCounterCatEventBatch,
  type CounterCatLegacyImportApplication,
  type CounterCatLegacyImportReport
} from "@teammultiply/counter-cat-bridge";

export interface CounterCatLegacyImportStore {
  save(state: LivingShelfState): Promise<unknown>;
}

export type CounterCatLegacyImportCommitResult =
  | {
      ok: true;
      application: CounterCatLegacyImportApplication;
    }
  | {
      ok: false;
      error: string;
    };

export interface CounterCatEventBatch {
  events: readonly EcosystemEvent[];
}

/**
 * The import remains all-or-nothing from the Shelf's point of view: events are
 * applied in memory first, then one accepted state is handed to local storage.
 */
export const commitCounterCatEventBatch = async (
  storage: CounterCatLegacyImportStore,
  current: LivingShelfState,
  batch: CounterCatEventBatch,
  packs: ShelfPack[],
  appliedAt = new Date().toISOString()
): Promise<CounterCatLegacyImportCommitResult> => {
  const application = applyCounterCatEventBatch(current, batch.events, packs, appliedAt);
  if (!application.ok) {
    return application;
  }

  if (application.acceptedEventIds.length === 0) {
    return { ok: true, application };
  }

  try {
    await storage.save(application.state);
    return { ok: true, application };
  } catch (error) {
    return {
      ok: false,
      error:
        "Verified Counter Cat progress could not be saved locally: " +
        (error instanceof Error ? error.message : "Unknown error")
    };
  }
};

export const commitCounterCatLegacyImport = async (
  storage: CounterCatLegacyImportStore,
  current: LivingShelfState,
  report: CounterCatLegacyImportReport,
  packs: ShelfPack[],
  appliedAt = new Date().toISOString()
): Promise<CounterCatLegacyImportCommitResult> =>
  commitCounterCatEventBatch(storage, current, report, packs, appliedAt);
