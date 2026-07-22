import { EcosystemEventSchema, type EcosystemEvent } from "@teammultiply/ecosystem-core";
import { z } from "zod";
import { createParadeHistory, type ParadeCommandHistory } from "./commands";
import { createInitialParadeState, type PetParadeLevel } from "./model";

const MoveSchema = z.object({ from: z.string().min(1), to: z.string().min(1), count: z.number().int().positive() });
const InspectionSchema = z.object({ postId: z.string().min(1), remainingMoves: z.number().int().positive(), startedAfterMove: z.number().int().nonnegative() });
export const ParadeStateSchema = z.object({
  version: z.literal(1),
  levelId: z.string().min(1),
  stacks: z.record(z.string().min(1), z.array(z.string().min(1))),
  orientations: z.record(z.string().min(1), z.boolean()),
  completedOrderIds: z.array(z.string().min(1)),
  arrivedPetIds: z.array(z.string().min(1)),
  moves: z.number().int().nonnegative(),
  status: z.enum(["playing", "complete"]),
  activeInspection: InspectionSchema.optional(),
  nextInspectionIndex: z.number().int().nonnegative()
});
const CommandRecordSchema = z.object({ command: MoveSchema, before: ParadeStateSchema, after: ParadeStateSchema });

export const ParadeCompletionRecordSchema = z.object({
  completedAt: z.string().min(1),
  moves: z.number().int().nonnegative(),
  score: z.number().finite().nonnegative(),
  medals: z.array(z.enum(["Park Pass", "Ribbon Collar", "Golden Tag"])),
  hintsUsed: z.number().int().nonnegative(),
  usedUndo: z.boolean()
});
export type ParadeCompletionRecord = z.infer<typeof ParadeCompletionRecordSchema>;

export const PetParadeSessionSchema = z.object({
  schemaVersion: z.literal(1),
  activeLevelId: z.string().min(1),
  activeMode: z.enum(["tutorial", "campaign", "expert", "daily", "challenge"]),
  activeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  selectedLevelId: z.string().min(1),
  state: ParadeStateSchema,
  history: z.object({ undo: z.array(CommandRecordSchema), redo: z.array(CommandRecordSchema) }),
  completionRecords: z.record(z.string().min(1), ParadeCompletionRecordSchema),
  unlockedLevelIds: z.array(z.string().min(1)),
  dailyLedger: z.record(z.string().min(1), z.object({ completedAt: z.string().min(1), moves: z.number().int().nonnegative() })),
  album: z.object({
    helpedPetIds: z.array(z.string().min(1)),
    reactions: z.array(z.string().min(1)),
    favoriteReactionId: z.string().min(1).optional()
  }),
  settings: z.object({
    soundMuted: z.boolean(),
    reducedMotion: z.boolean(),
    reducedEffects: z.boolean(),
    highContrast: z.boolean()
  }),
  hintsUsed: z.number().int().nonnegative(),
  usedUndo: z.boolean(),
  pendingEvents: z.array(EcosystemEventSchema)
});

export type PetParadeSession = z.infer<typeof PetParadeSessionSchema>;

export const createPetParadeSession = (level: PetParadeLevel): PetParadeSession => ({
  schemaVersion: 1,
  activeLevelId: level.id,
  activeMode: level.mode,
  activeDate: level.mode === "daily" ? level.id.match(/(\d{4})(\d{2})(\d{2})$/)?.slice(1).join("-") : undefined,
  selectedLevelId: level.id,
  state: createInitialParadeState(level),
  history: createParadeHistory(),
  completionRecords: {},
  unlockedLevelIds: ["pps-tutorial-01"],
  dailyLedger: {},
  album: { helpedPetIds: [], reactions: [] },
  settings: { soundMuted: true, reducedMotion: false, reducedEffects: false, highContrast: false },
  hintsUsed: 0,
  usedUndo: false,
  pendingEvents: []
});

export const mergeBestCompletion = (
  existing: ParadeCompletionRecord | undefined,
  incoming: ParadeCompletionRecord
): ParadeCompletionRecord => {
  if (!existing) return incoming;
  return {
    ...((incoming.moves < existing.moves || incoming.score > existing.score) ? incoming : existing),
    medals: [...new Set([...existing.medals, ...incoming.medals])]
  };
};

export const migrateLegacyPetParadeBests = (
  session: PetParadeSession,
  legacyBestMoves: Array<number | null>,
  migratedAt = new Date().toISOString()
): PetParadeSession => {
  const next = structuredClone(session);
  legacyBestMoves.forEach((moves, index) => {
    if (!moves || moves < 1) return;
    const levelId = `pps-legacy-${index + 1}`;
    next.completionRecords[levelId] = {
      completedAt: migratedAt,
      moves,
      score: 0,
      medals: [],
      hintsUsed: 0,
      usedUndo: false
    };
  });
  return PetParadeSessionSchema.parse(next);
};

export const withPendingEvents = (session: PetParadeSession, events: EcosystemEvent[]) => ({
  ...structuredClone(session),
  pendingEvents: [...session.pendingEvents, ...events.filter((event) => !session.pendingEvents.some((pending) => pending.eventId === event.eventId))]
});

export const clearPendingEvents = (session: PetParadeSession, eventIds: string[]) => ({
  ...structuredClone(session),
  pendingEvents: session.pendingEvents.filter((event) => !eventIds.includes(event.eventId))
});

export const historyAsSession = (history: ParadeCommandHistory) => structuredClone(history);
