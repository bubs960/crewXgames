import type { LegacyStorageSnapshot } from "./legacy";

export interface LegacyStorageReader {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
}

const isRelevantCounterCatStorageKey = (key: string) =>
  key === "kio_done" ||
  key === "kio_level:cat" ||
  key === "whc_level" ||
  key.startsWith("kio_best:cat:") ||
  key.startsWith("whc_best:");

/**
 * Creates a minimal, read-only legacy snapshot. The caller owns origin access;
 * this helper neither opens Counter Cat nor writes to browser storage.
 */
export const snapshotCounterCatLegacyStorage = (
  storage: LegacyStorageReader
): LegacyStorageSnapshot => {
  const snapshot: Record<string, string | null> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isRelevantCounterCatStorageKey(key)) continue;
    snapshot[key] = storage.getItem(key);
  }
  return snapshot;
};
