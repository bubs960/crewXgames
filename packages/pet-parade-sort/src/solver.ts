import { applyMove, getLegalMoves, occupiedUnits, validateMove } from "./engine";
import {
  createInitialParadeState,
  stableStateKey,
  type MechanicTag,
  type MoveCommand,
  type ParadeState,
  type PetParadeLevel
} from "./model";

export interface SolverResult {
  solved: boolean;
  solution: MoveCommand[];
  optimal: boolean;
  lowerBound: number;
  upperBound: number | null;
  exploredStates: number;
  branchCount: number;
  reason?: string;
}

export interface DifficultyReport {
  score: number;
  solutionDepth: number;
  branchCount: number;
  spareCapacity: number;
  mechanicInteraction: number;
  band: "guided" | "easygoing" | "thoughtful" | "tricky" | "expert";
}

interface SearchNode {
  state: ParadeState;
  path: MoveCommand[];
}

const remainingCollarsLowerBound = (level: PetParadeLevel, state: ParadeState) =>
  Math.max(0, level.orders.length - state.completedOrderIds.length);

const moveKey = (move: MoveCommand) => `${move.from}>${move.to}:${move.count}`;

const dedupeSymmetricMoves = (level: PetParadeLevel, state: ParadeState, moves: MoveCommand[]) => {
  const seenEmptyDestinations = new Set<string>();
  return moves.filter((move) => {
    const destination = level.posts.find((post) => post.id === move.to)!;
    const destinationStack = state.stacks[move.to] ?? [];
    if (destinationStack.length) return true;
    const signature = [destination.capacity, destination.kind, destination.lockedByOrderId ?? "", (destination.acceptsOwners ?? []).join(",")].join(":");
    const sourceKey = `${move.from}:${move.count}:${signature}`;
    if (seenEmptyDestinations.has(sourceKey)) return false;
    seenEmptyDestinations.add(sourceKey);
    return true;
  });
};

export const replaySolution = (
  level: PetParadeLevel,
  trace: MoveCommand[],
  initialState: ParadeState = createInitialParadeState(level)
) => {
  let state = structuredClone(initialState);
  for (const [index, command] of trace.entries()) {
    const validation = validateMove(level, state, command);
    if (!validation.valid) {
      return { valid: false as const, state, failedAt: index, reason: validation.reason ?? "Illegal move." };
    }
    state = applyMove(level, state, command).state;
  }
  return state.status === "complete"
    ? { valid: true as const, state }
    : { valid: false as const, state, failedAt: trace.length, reason: "Trace ended before every collar was complete." };
};

export const solveParade = (
  level: PetParadeLevel,
  initialState: ParadeState = createInitialParadeState(level),
  maxStates = 50_000
): SolverResult => {
  if (initialState.status === "complete") {
    return { solved: true, solution: [], optimal: true, lowerBound: 0, upperBound: 0, exploredStates: 1, branchCount: 0 };
  }

  const authored = initialState.moves === 0 && initialState.completedOrderIds.length === 0
    ? replaySolution(level, level.solutionTrace, initialState)
    : null;
  const upperBound = authored?.valid ? level.solutionTrace.length : null;
  const queue: SearchNode[] = [{ state: structuredClone(initialState), path: [] }];
  const visited = new Set([stableStateKey(level, initialState)]);
  let cursor = 0;
  let branches = 0;

  while (cursor < queue.length && visited.size <= maxStates) {
    const node = queue[cursor++];
    if (upperBound !== null && node.path.length >= upperBound) continue;
    const legal = dedupeSymmetricMoves(level, node.state, getLegalMoves(level, node.state));
    branches += legal.length;
    for (const move of legal) {
      const next = applyMove(level, node.state, move).state;
      const path = [...node.path, move];
      if (next.status === "complete") {
        return {
          solved: true,
          solution: path,
          optimal: true,
          lowerBound: path.length,
          upperBound: path.length,
          exploredStates: visited.size,
          branchCount: branches
        };
      }
      const key = stableStateKey(level, next);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ state: next, path });
    }
  }

  if (authored?.valid) {
    return {
      solved: true,
      solution: level.solutionTrace,
      optimal: false,
      lowerBound: remainingCollarsLowerBound(level, initialState),
      upperBound: level.solutionTrace.length,
      exploredStates: visited.size,
      branchCount: branches,
      reason: `The authored solution is legal; optimal search was bounded at ${maxStates.toLocaleString()} states.`
    };
  }

  const exhausted = cursor >= queue.length;
  return {
    solved: false,
    solution: [],
    optimal: exhausted,
    lowerBound: remainingCollarsLowerBound(level, initialState),
    upperBound: null,
    exploredStates: visited.size,
    branchCount: branches,
    reason: exhausted ? "The reachable state graph was exhausted without a solution." : `Search reached the ${maxStates.toLocaleString()}-state safety bound.`
  };
};

export const legalHint = (level: PetParadeLevel, state: ParadeState, maxStates = 25_000) => {
  const result = solveParade(level, state, maxStates);
  if (result.solved && result.solution[0]) return { move: result.solution[0], strategic: true, result };
  const legal = getLegalMoves(level, state);
  if (!legal.length) return { move: null, strategic: false, result };
  const ranked = legal
    .map((move) => {
      const next = applyMove(level, state, move).state;
      const destination = next.stacks[move.to] ?? [];
      const completed = next.completedOrderIds.length - state.completedOrderIds.length;
      return { move, value: completed * 100 + move.count * 6 + occupiedUnits(level, destination) - (destination.length === move.count ? 1 : 0) };
    })
    .sort((left, right) => right.value - left.value || moveKey(left.move).localeCompare(moveKey(right.move)));
  return { move: ranked[0].move, strategic: false, result };
};

export const detectDeadState = (level: PetParadeLevel, state: ParadeState, maxStates = 30_000) => {
  if (state.status === "complete") return { dead: false as const, certain: true, reason: "Board complete." };
  if (getLegalMoves(level, state).length === 0) return { dead: true as const, certain: true, reason: "No legal moves remain." };
  const result = solveParade(level, state, maxStates);
  if (result.solved) return { dead: false as const, certain: true, reason: "A legal completion path remains." };
  return result.optimal
    ? { dead: true as const, certain: true, reason: result.reason ?? "No completion path remains." }
    : { dead: false as const, certain: false, reason: result.reason ?? "The search bound was reached." };
};

const interactionWeight: Record<MechanicTag, number> = {
  "top-tag": 1,
  runs: 1,
  "variable-capacity": 2,
  "locked-buckle": 3,
  "double-sided": 2,
  "linked-pair": 3,
  "pattern-collar": 4,
  "priority-card": 4,
  "oversized-bell": 3,
  "foster-hook": 3,
  "cat-inspection": 4
};

export const analyzeDifficulty = (level: PetParadeLevel, solver?: SolverResult): DifficultyReport => {
  const result = solver ?? solveParade(level, createInitialParadeState(level), 12_000);
  const initial = createInitialParadeState(level);
  const totalCapacity = level.posts.reduce((sum, post) => sum + post.capacity, 0);
  const usedCapacity = level.posts.reduce((sum, post) => sum + occupiedUnits(level, initial.stacks[post.id] ?? []), 0);
  const spareCapacity = totalCapacity - usedCapacity;
  const solutionDepth = result.upperBound ?? level.solutionTrace.length;
  const averageBranch = result.exploredStates ? result.branchCount / result.exploredStates : 0;
  const mechanicInteraction = level.mechanics.reduce((sum, mechanic) => sum + interactionWeight[mechanic], 0);
  const score = Math.max(1, Math.round(solutionDepth * 1.7 + averageBranch * 3.5 + mechanicInteraction * 2.2 - spareCapacity * 0.65));
  const band = score < 16 ? "guided" : score < 28 ? "easygoing" : score < 45 ? "thoughtful" : score < 65 ? "tricky" : "expert";
  return { score, solutionDepth, branchCount: result.branchCount, spareCapacity, mechanicInteraction, band };
};

export interface LevelValidationReport {
  valid: boolean;
  errors: string[];
  solver: SolverResult;
  difficulty: DifficultyReport;
}

export const validateLevel = (level: PetParadeLevel, maxStates = 20_000): LevelValidationReport => {
  const errors: string[] = [];
  const postIds = new Set(level.posts.map((post) => post.id));
  const tagIds = new Set(level.tags.map((tag) => tag.id));
  const orderIds = new Set(level.orders.map((order) => order.id));
  if (postIds.size !== level.posts.length) errors.push("Post ids must be unique.");
  if (tagIds.size !== level.tags.length) errors.push("Tag ids must be unique.");
  if (orderIds.size !== level.orders.length) errors.push("Order ids must be unique.");
  const stackedIds = level.posts.flatMap((post) => level.initialStacks[post.id] ?? []);
  if (stackedIds.length !== level.tags.length || new Set(stackedIds).size !== level.tags.length) errors.push("Every tag must appear in exactly one initial stack.");
  if (stackedIds.some((tagId) => !tagIds.has(tagId))) errors.push("An initial stack references an unknown tag.");
  for (const post of level.posts) {
    if (occupiedUnits(level, level.initialStacks[post.id] ?? []) > post.capacity) errors.push(`${post.id} exceeds its visible capacity.`);
    if (post.lockedByOrderId && !orderIds.has(post.lockedByOrderId)) errors.push(`${post.id} references an unknown buckle unlock order.`);
  }
  const orderedTags = level.orders.flatMap((order) => order.tagIds);
  if (orderedTags.length !== level.tags.length || new Set(orderedTags).size !== level.tags.length) errors.push("Every tag must belong to exactly one rescue order.");
  for (const order of level.orders) {
    if (order.tagIds.some((id) => !tagIds.has(id))) errors.push(`${order.id} references an unknown tag.`);
    if (order.pattern && order.pattern.length !== order.tagIds.length) errors.push(`${order.id} has a pattern length mismatch.`);
  }
  for (const event of level.inspectionSchedule) {
    if (!postIds.has(event.postId) || event.afterMove < 1 || event.duration < 1) errors.push("Cat inspection schedules must reference a real post and positive move counts.");
  }
  const minimumDepth = level.id === "pps-tutorial-01" ? 1 : level.mode === "tutorial" ? 2 : level.mode === "campaign" ? 6 : 8;
  if (level.solutionTrace.length < minimumDepth) errors.push(`Solution trace is degenerate for ${level.mode} content.`);
  const replay = replaySolution(level, level.solutionTrace);
  if (!replay.valid) errors.push(`Authored solution failed at move ${replay.failedAt}: ${replay.reason}`);
  const solver = solveParade(level, createInitialParadeState(level), maxStates);
  if (!solver.solved) errors.push(solver.reason ?? "Solver could not confirm a solution.");
  const difficulty = analyzeDifficulty(level, solver);
  return { valid: errors.length === 0, errors, solver, difficulty };
};
