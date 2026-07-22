import { z } from "zod";
import { createCommandHistory } from "./commands";
import { createInitialPuzzleState, type CrochetLevel } from "./model";

const ColorSchema = z.enum(["coral", "teal", "gold", "leaf", "ink"]);
export const CrochetMedalSchema = z.enum(["clean", "par", "tension"]);
export type CrochetMedal = z.infer<typeof CrochetMedalSchema>;

export const CrochetCompletionRecordSchema = z.object({
  completedAt: z.string().min(1),
  moves: z.number().int().nonnegative(),
  score: z.number().finite().nonnegative(),
  usedUndo: z.boolean()
});
export type CrochetCompletionRecord = z.infer<typeof CrochetCompletionRecordSchema>;

const RouteSchema = z.object({
  id: z.string().min(1),
  objectiveId: z.string().min(1),
  spoolId: z.string().min(1),
  color: ColorSchema,
  nodeIds: z.array(z.string().min(1)).min(2),
  channelIds: z.array(z.string().min(1)).min(1),
  length: z.number().finite().nonnegative()
});

export const PuzzleStateSchema = z.object({
  version: z.literal(1),
  levelId: z.string().min(1),
  spoolRemaining: z.record(z.string().min(1), z.number().finite().nonnegative()),
  routes: z.array(RouteSchema),
  currentObjectiveIndex: z.number().int().nonnegative(),
  moves: z.number().int().nonnegative(),
  undosUsed: z.number().int().nonnegative(),
  status: z.enum(["playing", "complete"])
});

const RouteCommandSchema = z.object({
  type: z.literal("route"),
  route: RouteSchema,
  before: PuzzleStateSchema,
  after: PuzzleStateSchema
});

export const CrochetSessionSchema = z.object({
  schemaVersion: z.literal(1),
  activeLevelId: z.string().min(1),
  activeMode: z.enum(["campaign", "expert", "daily"]),
  state: PuzzleStateSchema,
  history: z.object({ undo: z.array(RouteCommandSchema), redo: z.array(RouteCommandSchema) }),
  completedLevelIds: z.array(z.string().min(1)),
  medals: z.record(z.string().min(1), z.array(CrochetMedalSchema)),
  completionRecords: z.record(z.string().min(1), CrochetCompletionRecordSchema).default({}),
  usedUndo: z.boolean(),
  settings: z.object({ sound: z.boolean(), reducedMotion: z.boolean(), highContrast: z.boolean() })
});

export type CrochetSession = z.infer<typeof CrochetSessionSchema>;

export const mergeCrochetMedals = (
  existing: CrochetMedal[] = [],
  earned: CrochetMedal[] = []
): CrochetMedal[] => [...new Set([...existing, ...earned])];

export const createCrochetSession = (level: CrochetLevel): CrochetSession => ({
  schemaVersion: 1,
  activeLevelId: level.id,
  activeMode: level.mode,
  state: createInitialPuzzleState(level),
  history: createCommandHistory(),
  completedLevelIds: [],
  medals: {},
  completionRecords: {},
  usedUndo: false,
  settings: { sound: true, reducedMotion: false, highContrast: false }
});
