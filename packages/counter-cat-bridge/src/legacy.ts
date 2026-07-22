import {
  CONTENT_SCHEMA_VERSION,
  type EcosystemEvent
} from "@teammultiply/ecosystem-core";
import {
  CounterCatLegacyCaseByKey,
  type CounterCatLegacyCase
} from "./coverage";

export const COUNTER_CAT_LEGACY_IMPORT_SCHEMA_VERSION = 1 as const;
export const COUNTER_CAT_LEGACY_DONE_KEY = "kio_done";

export type LegacyEvidenceSource = "completion-map" | "best-record";

export type LegacyImportFallbackReason =
  | "malformed-completion-map"
  | "unverified-completion-value"
  | "unrecognized-completion-key"
  | "unrecognized-best-record"
  | "invalid-best-record"
  | "progress-pointer-only"
  | "pre-seed-best-record";

export interface CounterCatLegacyFallback {
  reason: LegacyImportFallbackReason;
  storageKey: string;
  legacyKey?: string;
  title: string;
  message: string;
}

export interface CounterCatLegacyImportedRecord {
  legacyKey: string;
  eventId: string;
  evidence: LegacyEvidenceSource[];
  moves: number;
}

export interface CounterCatLegacyImportReport {
  schemaVersion: typeof COUNTER_CAT_LEGACY_IMPORT_SCHEMA_VERSION;
  events: EcosystemEvent[];
  importedRecords: CounterCatLegacyImportedRecord[];
  fallbacks: CounterCatLegacyFallback[];
}

export interface CounterCatLegacyImportSummary {
  kind: "nothing-to-import" | "imported" | "needs-review" | "partial";
  title: string;
  message: string;
}

export type LegacyStorageSnapshot = Readonly<Record<string, string | null | undefined>>;

interface VerifiedCompletion {
  legacyKey: string;
  legacyCase?: CounterCatLegacyCase;
  dailyDate?: string;
  evidence: Set<LegacyEvidenceSource>;
  moves: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isValidDate = (date: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
};

const dailyKey = /^daily:(\d{4}-\d{2}-\d{2}):(tilt|lane)$/;

const fallback = (
  reason: LegacyImportFallbackReason,
  storageKey: string,
  legacyKey: string | undefined,
  message: string
): CounterCatLegacyFallback => ({
  reason,
  storageKey,
  legacyKey,
  title: "Counter Cat progress needs a check",
  message: message + " No Living Shelf reward was added, and the original game save was left untouched."
});

export const counterCatEventIdFor = (legacyKey: string) =>
  "legacy:counter-cat:v1:" + legacyKey;

/**
 * Converts one source-locked Counter Cat board key into the shared event
 * contract. Both the legacy importer and the live relay use this function so
 * a case can only ever have one stable event id.
 */
export const counterCatEventFromLegacyRecord = (
  legacyKey: string,
  moves: number,
  completedAt: string
): EcosystemEvent | null => {
  const legacyCase = CounterCatLegacyCaseByKey.get(legacyKey);
  const daily = dailyKey.exec(legacyKey);
  const dailyDate = daily?.[1];
  if (!legacyCase && (!dailyDate || !isValidDate(dailyDate))) return null;

  const result = {
    score: 0,
    moves,
    completedAt
  };
  const base = {
    schemaVersion: CONTENT_SCHEMA_VERSION as 1,
    eventId: counterCatEventIdFor(legacyKey),
    gameId: "counter-cat",
    occurredAt: completedAt,
    result
  };

  if (dailyDate) {
    return {
      ...base,
      type: "daily.completed",
      date: dailyDate
    };
  }

  if (legacyCase?.eventType === "game.completed") {
    return {
      ...base,
      type: "game.completed",
      levelId: legacyCase.levelId
    };
  }

  return {
    ...base,
    type: "expert.completed",
    levelId: legacyCase!.levelId
  };
};

const toEvent = (completion: VerifiedCompletion, importedAt: string): EcosystemEvent => {
  const event = counterCatEventFromLegacyRecord(
    completion.legacyKey,
    completion.moves,
    importedAt
  );
  if (!event) {
    throw new Error("A verified Counter Cat completion must identify a case or a daily date.");
  }
  return event;
};

const addVerifiedCompletion = (
  completions: Map<string, VerifiedCompletion>,
  fallbacks: CounterCatLegacyFallback[],
  legacyKey: string,
  storageKey: string,
  evidence: LegacyEvidenceSource,
  moves = 0
) => {
  const legacyCase = CounterCatLegacyCaseByKey.get(legacyKey);
  const daily = dailyKey.exec(legacyKey);
  const dailyDate = daily?.[1];

  if (!legacyCase && (!dailyDate || !isValidDate(dailyDate))) {
    fallbacks.push(
      fallback(
        evidence === "best-record" ? "unrecognized-best-record" : "unrecognized-completion-key",
        storageKey,
        legacyKey,
        "This saved board does not match the verified Counter Cat case map."
      )
    );
    return;
  }

  const current = completions.get(legacyKey);
  if (current) {
    current.evidence.add(evidence);
    current.moves = Math.max(current.moves, moves);
    return;
  }

  completions.set(legacyKey, {
    legacyKey,
    legacyCase,
    dailyDate,
    evidence: new Set([evidence]),
    moves
  });
};

const readCompletionMap = (
  snapshot: LegacyStorageSnapshot,
  completions: Map<string, VerifiedCompletion>,
  fallbacks: CounterCatLegacyFallback[]
) => {
  const raw = snapshot[COUNTER_CAT_LEGACY_DONE_KEY];
  if (raw === undefined || raw === null) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fallbacks.push(
      fallback(
        "malformed-completion-map",
        COUNTER_CAT_LEGACY_DONE_KEY,
        undefined,
        "The saved completion record could not be read."
      )
    );
    return;
  }

  if (!isRecord(parsed)) {
    fallbacks.push(
      fallback(
        "malformed-completion-map",
        COUNTER_CAT_LEGACY_DONE_KEY,
        undefined,
        "The saved completion record has an unsupported shape."
      )
    );
    return;
  }

  for (const [legacyKey, value] of Object.entries(parsed).sort(([a], [b]) => a.localeCompare(b))) {
    if (value !== 1) {
      fallbacks.push(
        fallback(
          "unverified-completion-value",
          COUNTER_CAT_LEGACY_DONE_KEY,
          legacyKey,
          "This completion marker is not the exact value written by Counter Cat."
        )
      );
      continue;
    }
    addVerifiedCompletion(completions, fallbacks, legacyKey, COUNTER_CAT_LEGACY_DONE_KEY, "completion-map");
  }
};

const readBestRecords = (
  snapshot: LegacyStorageSnapshot,
  completions: Map<string, VerifiedCompletion>,
  fallbacks: CounterCatLegacyFallback[]
) => {
  for (const [storageKey, raw] of Object.entries(snapshot).sort(([a], [b]) => a.localeCompare(b))) {
    if (!storageKey.startsWith("kio_best:cat:") || raw === undefined || raw === null) continue;

    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
      fallbacks.push(
        fallback(
          "invalid-best-record",
          storageKey,
          storageKey.slice("kio_best:".length),
          "This Counter Cat best-record value is not a valid move count."
        )
      );
      continue;
    }

    addVerifiedCompletion(
      completions,
      fallbacks,
      storageKey.slice("kio_best:".length),
      storageKey,
      "best-record",
      Number(raw)
    );
  }
};

const readAmbiguousPointers = (
  snapshot: LegacyStorageSnapshot,
  fallbacks: CounterCatLegacyFallback[],
  hasVerifiedCompletion: boolean
) => {
  if (!hasVerifiedCompletion) {
    for (const storageKey of ["kio_level:cat", "whc_level"] as const) {
      if (snapshot[storageKey] === undefined || snapshot[storageKey] === null) continue;
      fallbacks.push(
        fallback(
          "progress-pointer-only",
          storageKey,
          undefined,
          "A saved level pointer identifies where the player last navigated, not an exact completed case."
        )
      );
    }
  }

  for (const storageKey of Object.keys(snapshot).sort()) {
    if (!storageKey.startsWith("whc_best:")) continue;
    fallbacks.push(
      fallback(
        "pre-seed-best-record",
        storageKey,
        undefined,
        "An older prototype best score has no immutable board seed, so it cannot be matched safely."
      )
    );
  }
};

export const importCounterCatLegacyProgress = (
  snapshot: LegacyStorageSnapshot,
  importedAt = new Date().toISOString()
): CounterCatLegacyImportReport => {
  const completions = new Map<string, VerifiedCompletion>();
  const fallbacks: CounterCatLegacyFallback[] = [];

  readCompletionMap(snapshot, completions, fallbacks);
  readBestRecords(snapshot, completions, fallbacks);
  readAmbiguousPointers(snapshot, fallbacks, completions.size > 0);

  const verified = [...completions.values()].sort((a, b) => a.legacyKey.localeCompare(b.legacyKey));
  return {
    schemaVersion: COUNTER_CAT_LEGACY_IMPORT_SCHEMA_VERSION,
    events: verified.map((completion) => toEvent(completion, importedAt)),
    importedRecords: verified.map((completion) => ({
      legacyKey: completion.legacyKey,
      eventId: counterCatEventIdFor(completion.legacyKey),
      evidence: [...completion.evidence].sort(),
      moves: completion.moves
    })),
    fallbacks
  };
};

export const summarizeCounterCatLegacyImport = (
  report: CounterCatLegacyImportReport
): CounterCatLegacyImportSummary => {
  const imported = report.events.length;
  const ambiguous = report.fallbacks.length;

  if (imported > 0 && ambiguous > 0) {
    return {
      kind: "partial",
      title: "Some Counter Cat progress was imported",
      message:
        imported +
        " verified completion" +
        (imported === 1 ? " was" : "s were") +
        " imported. " +
        ambiguous +
        " saved record" +
        (ambiguous === 1 ? " needs" : "s need") +
        " a check before any reward can be added."
    };
  }
  if (imported > 0) {
    return {
      kind: "imported",
      title: "Counter Cat progress imported",
      message:
        imported +
        " verified completion" +
        (imported === 1 ? " was" : "s were") +
        " imported with its original case identity."
    };
  }
  if (ambiguous > 0) {
    return {
      kind: "needs-review",
      title: "Counter Cat progress needs a check",
      message:
        "We found saved progress, but it does not prove an exact completed case. No Living Shelf reward was added."
    };
  }
  return {
    kind: "nothing-to-import",
    title: "No Counter Cat completion record found",
    message: "No legacy completion data was found to import."
  };
};
