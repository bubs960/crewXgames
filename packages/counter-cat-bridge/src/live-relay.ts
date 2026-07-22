import type { EcosystemEvent } from "@teammultiply/ecosystem-core";
import { counterCatEventFromLegacyRecord, counterCatEventIdFor } from "./legacy";

export const COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION = 1 as const;
export const COUNTER_CAT_LIVE_RELAY_STORAGE_KEY = "teammultiply:counter-cat:relay:v1";

export interface CounterCatLiveRelayRecord {
  schemaVersion: typeof COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION;
  eventId: string;
  legacyKey: string;
  completedAt: string;
  moves: number;
}

export interface CounterCatLiveRelayEnvelope {
  schemaVersion: typeof COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION;
  events: CounterCatLiveRelayRecord[];
}

export interface CounterCatLiveRelayStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type CounterCatLiveRelayFallbackReason =
  | "malformed-relay"
  | "unsupported-relay-version"
  | "invalid-relay-record"
  | "unrecognized-relay-case"
  | "mismatched-relay-event-id"
  | "duplicate-relay-event";

export interface CounterCatLiveRelayFallback {
  reason: CounterCatLiveRelayFallbackReason;
  message: string;
}

export interface CounterCatLiveRelayReport {
  records: CounterCatLiveRelayRecord[];
  events: EcosystemEvent[];
  fallbacks: CounterCatLiveRelayFallback[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isIsoInstant = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
};

const fallback = (
  reason: CounterCatLiveRelayFallbackReason,
  message: string
): CounterCatLiveRelayFallback => ({ reason, message });

const reportFromRaw = (raw: string | null): CounterCatLiveRelayReport => {
  if (raw === null) return { records: [], events: [], fallbacks: [] };

  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch {
    return {
      records: [],
      events: [],
      fallbacks: [
        fallback(
          "malformed-relay",
          "The Counter Cat handoff could not be read. It remains untouched and no Shelf reward was added."
        )
      ]
    };
  }

  if (!isRecord(envelope) || !Array.isArray(envelope.events)) {
    return {
      records: [],
      events: [],
      fallbacks: [
        fallback(
          "malformed-relay",
          "The Counter Cat handoff has an unsupported shape. It remains untouched and no Shelf reward was added."
        )
      ]
    };
  }

  if (envelope.schemaVersion !== COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION) {
    return {
      records: [],
      events: [],
      fallbacks: [
        fallback(
          "unsupported-relay-version",
          "The Counter Cat handoff uses an unsupported version. It remains untouched and no Shelf reward was added."
        )
      ]
    };
  }

  const records: CounterCatLiveRelayRecord[] = [];
  const events: EcosystemEvent[] = [];
  const fallbacks: CounterCatLiveRelayFallback[] = [];
  const seenEventIds = new Set<string>();

  for (const candidate of envelope.events) {
    if (
      !isRecord(candidate) ||
      candidate.schemaVersion !== COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION ||
      typeof candidate.eventId !== "string" ||
      typeof candidate.legacyKey !== "string" ||
      typeof candidate.completedAt !== "string" ||
      !isIsoInstant(candidate.completedAt) ||
      typeof candidate.moves !== "number" ||
      !Number.isSafeInteger(candidate.moves) ||
      candidate.moves < 0
    ) {
      fallbacks.push(
        fallback(
          "invalid-relay-record",
          "One Counter Cat handoff record is incomplete or invalid. It remains untouched and no Shelf reward was added for it."
        )
      );
      continue;
    }

    const event = counterCatEventFromLegacyRecord(
      candidate.legacyKey,
      candidate.moves,
      candidate.completedAt
    );
    if (!event) {
      fallbacks.push(
        fallback(
          "unrecognized-relay-case",
          "One Counter Cat handoff record does not match the verified case map. It remains untouched and no Shelf reward was added for it."
        )
      );
      continue;
    }
    if (candidate.eventId !== counterCatEventIdFor(candidate.legacyKey)) {
      fallbacks.push(
        fallback(
          "mismatched-relay-event-id",
          "One Counter Cat handoff record has an unexpected event identity. It remains untouched and no Shelf reward was added for it."
        )
      );
      continue;
    }
    if (seenEventIds.has(candidate.eventId)) {
      fallbacks.push(
        fallback(
          "duplicate-relay-event",
          "The same Counter Cat handoff case appeared more than once. The extra record remains untouched and no duplicate reward was added."
        )
      );
      continue;
    }

    seenEventIds.add(candidate.eventId);
    records.push({
      schemaVersion: COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION,
      eventId: candidate.eventId,
      legacyKey: candidate.legacyKey,
      completedAt: candidate.completedAt,
      moves: candidate.moves
    });
    events.push(event);
  }

  return { records, events, fallbacks };
};

/** Reads the queued handoff without changing Counter Cat or its save. */
export const readCounterCatLiveRelay = (
  storage: Pick<CounterCatLiveRelayStorage, "getItem">
): CounterCatLiveRelayReport => reportFromRaw(storage.getItem(COUNTER_CAT_LIVE_RELAY_STORAGE_KEY));

/**
 * Removes only successfully processed relay event ids. Malformed records are
 * intentionally retained so the Shelf never silently discards unclear proof.
 */
export const acknowledgeCounterCatLiveRelay = (
  storage: CounterCatLiveRelayStorage,
  eventIds: readonly string[]
) => {
  if (eventIds.length === 0) return true;
  let raw: string | null;
  try {
    raw = storage.getItem(COUNTER_CAT_LIVE_RELAY_STORAGE_KEY);
  } catch {
    return false;
  }
  if (raw === null) return true;

  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch {
    return false;
  }
  if (
    !isRecord(envelope) ||
    envelope.schemaVersion !== COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION ||
    !Array.isArray(envelope.events)
  ) {
    return false;
  }

  const consumed = new Set(eventIds);
  const remaining = envelope.events.filter(
    (candidate) => !isRecord(candidate) || typeof candidate.eventId !== "string" || !consumed.has(candidate.eventId)
  );
  if (remaining.length === envelope.events.length) return true;

  try {
    if (remaining.length === 0) {
      storage.removeItem(COUNTER_CAT_LIVE_RELAY_STORAGE_KEY);
    } else {
      const next: CounterCatLiveRelayEnvelope = {
        schemaVersion: COUNTER_CAT_LIVE_RELAY_SCHEMA_VERSION,
        events: remaining as CounterCatLiveRelayRecord[]
      };
      storage.setItem(COUNTER_CAT_LIVE_RELAY_STORAGE_KEY, JSON.stringify(next));
    }
    return true;
  } catch {
    return false;
  }
};
