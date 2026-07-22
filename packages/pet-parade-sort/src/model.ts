export const PET_PARADE_STATE_VERSION = 1 as const;

export const TAG_OWNERS = ["cat", "dog", "rabbit", "fox", "hamster", "parrot"] as const;
export type TagOwner = (typeof TAG_OWNERS)[number];

export const OWNER_PRESENTATION: Record<TagOwner, {
  label: string;
  color: number;
  css: string;
  symbol: string;
  edge: "scallop" | "round" | "diamond" | "hex" | "gear" | "shield";
  reaction: string;
}> = {
  cat: { label: "Cats", color: 0xd85f5f, css: "#d85f5f", symbol: "△", edge: "scallop", reaction: "Cats do not line up. They permit arrangements." },
  dog: { label: "Dogs", color: 0x2f8c98, css: "#2f8c98", symbol: "◆", edge: "round", reaction: "Dogs are already ready." },
  rabbit: { label: "Rabbits", color: 0xd89a2b, css: "#d89a2b", symbol: "✦", edge: "diamond", reaction: "The rabbit has notes." },
  fox: { label: "Foxes", color: 0x9a5a92, css: "#9a5a92", symbol: "⬡", edge: "hex", reaction: "The fox approved the lighting." },
  hamster: { label: "Hamsters", color: 0x6d9954, css: "#6d9954", symbol: "◎", edge: "gear", reaction: "The hamster brought one tiny clipboard." },
  parrot: { label: "Parrots", color: 0x496ca7, css: "#496ca7", symbol: "◇", edge: "shield", reaction: "The parrot has repeated the call time." }
};

export type TagMaterial = "enamel" | "brass" | "steel" | "bell";
export type PostKind = "standard" | "buckle" | "foster";
export type LevelMode = "tutorial" | "campaign" | "expert" | "daily" | "challenge";

export type MechanicTag =
  | "top-tag"
  | "runs"
  | "variable-capacity"
  | "locked-buckle"
  | "double-sided"
  | "linked-pair"
  | "pattern-collar"
  | "priority-card"
  | "oversized-bell"
  | "foster-hook"
  | "cat-inspection";

export interface TagDefinition {
  id: string;
  owner: TagOwner;
  variant: string;
  reverseVariant?: string;
  size: 1 | 2;
  material: TagMaterial;
  doubleSided?: boolean;
  linkedGroup?: string;
  symbol: string;
  edge: (typeof OWNER_PRESENTATION)[TagOwner]["edge"];
}

export interface PostDefinition {
  id: string;
  label: string;
  capacity: number;
  kind: PostKind;
  lockedByOrderId?: string;
  acceptsOwners?: TagOwner[];
}

export interface CollarOrder {
  id: string;
  owner: TagOwner;
  petName: string;
  label: string;
  tagIds: string[];
  pattern?: string[];
  priority?: number;
  collarStyle: string;
}

export interface InspectionEvent {
  afterMove: number;
  postId: string;
  duration: number;
}

export interface MoveCommand {
  from: string;
  to: string;
  count: number;
}

export interface PetParadeLevel {
  id: string;
  title: string;
  mode: LevelMode;
  chapter: string;
  chapterNumber: number;
  setting: string;
  intro: string;
  mechanics: MechanicTag[];
  posts: PostDefinition[];
  tags: TagDefinition[];
  orders: CollarOrder[];
  initialStacks: Record<string, string[]>;
  initialOrientations?: Record<string, boolean>;
  inspectionSchedule: InspectionEvent[];
  solutionTrace: MoveCommand[];
  parMoves: number;
  medalThresholds: [number, number, number];
  curationNote: string;
  tutorialBeat?: string;
  generatedFrom?: string;
}

export interface ActiveInspection {
  postId: string;
  remainingMoves: number;
  startedAfterMove: number;
}

export interface ParadeState {
  version: typeof PET_PARADE_STATE_VERSION;
  levelId: string;
  stacks: Record<string, string[]>;
  orientations: Record<string, boolean>;
  completedOrderIds: string[];
  arrivedPetIds: string[];
  moves: number;
  status: "playing" | "complete";
  activeInspection?: ActiveInspection;
  nextInspectionIndex: number;
}

export interface MoveValidation {
  valid: boolean;
  reason?: string;
  command?: MoveCommand;
}

export interface MoveTransition {
  state: ParadeState;
  command: MoveCommand;
  movedTagIds: string[];
  completedOrderIds: string[];
  unlockedPostIds: string[];
  inspectionStarted?: ActiveInspection;
  inspectionEnded: boolean;
}

export const cloneParadeState = (state: ParadeState): ParadeState => structuredClone(state);

export const createInitialParadeState = (level: PetParadeLevel): ParadeState => ({
  version: PET_PARADE_STATE_VERSION,
  levelId: level.id,
  stacks: Object.fromEntries(level.posts.map((post) => [post.id, [...(level.initialStacks[post.id] ?? [])]])),
  orientations: Object.fromEntries(level.tags.map((tag) => [tag.id, Boolean(level.initialOrientations?.[tag.id])])),
  completedOrderIds: [],
  arrivedPetIds: [],
  moves: 0,
  status: "playing",
  nextInspectionIndex: 0
});

export const tagById = (level: PetParadeLevel, tagId: string) => level.tags.find((tag) => tag.id === tagId);
export const postById = (level: PetParadeLevel, postId: string) => level.posts.find((post) => post.id === postId);
export const orderById = (level: PetParadeLevel, orderId: string) => level.orders.find((order) => order.id === orderId);

export const visibleVariant = (level: PetParadeLevel, state: ParadeState, tagId: string) => {
  const tag = tagById(level, tagId);
  if (!tag) return "unknown";
  return tag.doubleSided && state.orientations[tagId] ? (tag.reverseVariant ?? tag.variant) : tag.variant;
};

export const stableStateKey = (level: PetParadeLevel, state: ParadeState) => {
  const lastScheduledMove = level.inspectionSchedule.at(-1)?.afterMove ?? -1;
  const relevantMove = state.moves <= lastScheduledMove ? state.moves : lastScheduledMove + 1;
  return [
    level.posts.map((post) => state.stacks[post.id]?.join(",") ?? "").join("|"),
    level.tags.filter((tag) => tag.doubleSided).map((tag) => state.orientations[tag.id] ? "1" : "0").join(""),
    [...state.completedOrderIds].sort().join(","),
    state.activeInspection ? `${state.activeInspection.postId}:${state.activeInspection.remainingMoves}` : "-",
    state.nextInspectionIndex,
    relevantMove
  ].join(";");
};

export const stableParadeSnapshot = (state: ParadeState) => JSON.stringify(state);
