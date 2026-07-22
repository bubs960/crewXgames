export const CROCHET_PUZZLE_VERSION = 1 as const;

export const YARN_COLORS = ["coral", "teal", "gold", "leaf", "ink"] as const;
export type YarnColor = (typeof YARN_COLORS)[number];

export type NodeKind = "spool" | "stitch" | "pin" | "hook";
export type PortraitId = "kitten" | "puppy" | "bunny";
export type LevelMode = "campaign" | "expert" | "daily";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  color?: YarnColor;
  symbol: string;
  visible?: boolean;
}

export interface Channel {
  id: string;
  from: string;
  to: string;
  oneWay?: boolean;
  maxUses?: number;
  label: string;
}

export interface SpoolDefinition {
  id: string;
  color: YarnColor;
  length: number;
  accessibleLabel: string;
}

export interface StitchObjective {
  id: string;
  label: string;
  color: YarnColor;
  spoolId: string;
  targetId: string;
  maxLength: number;
  requiredVia: string[];
  visible: boolean;
}

export interface SolverMetadata {
  solverVersion: string;
  parMoves: number;
  solutionLength: number;
  branchCount: number;
  mechanicTags: string[];
  difficultyScore: number;
}

export interface CrochetLevel {
  id: string;
  title: string;
  mode: LevelMode;
  chapter: string;
  chapterNumber: number;
  portrait: PortraitId;
  nodes: GraphNode[];
  channels: Channel[];
  spools: SpoolDefinition[];
  objectives: StitchObjective[];
  solutionTrace: string[][];
  solverMetadata: SolverMetadata;
  tutorialBeat?: string;
  generatedFrom?: string;
  generationMethod?: "hand-authored" | "backward-from-solved-state";
  initialState?: PuzzleState;
}

export interface Route {
  id: string;
  objectiveId: string;
  spoolId: string;
  color: YarnColor;
  nodeIds: string[];
  channelIds: string[];
  length: number;
}

export interface PuzzleState {
  version: typeof CROCHET_PUZZLE_VERSION;
  levelId: string;
  spoolRemaining: Record<string, number>;
  routes: Route[];
  currentObjectiveIndex: number;
  moves: number;
  undosUsed: number;
  status: "playing" | "complete";
}

export interface RouteValidation {
  valid: boolean;
  reason?: string;
  route?: Route;
}

export const createInitialPuzzleState = (level: CrochetLevel): PuzzleState =>
  level.initialState
    ? structuredClone(level.initialState)
    : {
        version: CROCHET_PUZZLE_VERSION,
        levelId: level.id,
        spoolRemaining: Object.fromEntries(level.spools.map((spool) => [spool.id, spool.length])),
        routes: [],
        currentObjectiveIndex: 0,
        moves: 0,
        undosUsed: 0,
        status: "playing"
      };

export const getCurrentObjective = (level: CrochetLevel, state: PuzzleState) =>
  level.objectives[state.currentObjectiveIndex] ?? null;

export const getNode = (level: CrochetLevel, nodeId: string) =>
  level.nodes.find((node) => node.id === nodeId);

export const getSpool = (level: CrochetLevel, spoolId: string) =>
  level.spools.find((spool) => spool.id === spoolId);

export const channelAllows = (channel: Channel, from: string, to: string) =>
  channel.from === from && channel.to === to || (!channel.oneWay && channel.from === to && channel.to === from);

export const getChannel = (level: CrochetLevel, from: string, to: string) =>
  level.channels.find((channel) => channelAllows(channel, from, to));

export const distanceBetween = (a: GraphNode, b: GraphNode) => Math.hypot(a.x - b.x, a.y - b.y);

export const usedChannelIds = (state: PuzzleState) =>
  new Set(state.routes.flatMap((route) => route.channelIds));

export const clonePuzzleState = (state: PuzzleState) => structuredClone(state);

export const stablePuzzleSnapshot = (state: PuzzleState) => JSON.stringify(state);
