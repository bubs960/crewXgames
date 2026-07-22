import { commitRoute, replayTrace, validateRoute } from "./engine";
import {
  createInitialPuzzleState,
  getCurrentObjective,
  getNode,
  type CrochetLevel,
  type PuzzleState
} from "./model";

export interface SolverResult {
  solvable: boolean;
  trace: string[][];
  solutionLength: number;
  branchCount: number;
  exploredStates: number;
  reason?: string;
}

const nodeOrder = (level: CrochetLevel, nodeId: string) => {
  const node = getNode(level, nodeId);
  return node ? node.x * 1000 + node.y : 0;
};

export const enumerateLegalRoutes = (level: CrochetLevel, state: PuzzleState, cap = 80) => {
  const objective = getCurrentObjective(level, state);
  if (!objective) return [];
  const found: string[][] = [];
  const visit = (path: string[]) => {
    if (found.length >= cap) return;
    const last = path.at(-1)!;
    if (last === objective.targetId) {
      if (validateRoute(level, state, path).valid) found.push(path);
      return;
    }
    const nextIds = level.channels
      .filter((channel) => channel.from === last || (!channel.oneWay && channel.to === last))
      .map((channel) => channel.from === last ? channel.to : channel.from)
      .filter((nodeId) => !path.includes(nodeId))
      .sort((a, b) => nodeOrder(level, a) - nodeOrder(level, b));
    for (const nodeId of nextIds) {
      const node = getNode(level, nodeId);
      if (!node || (node.kind === "stitch" && node.id !== objective.targetId)) continue;
      visit([...path, nodeId]);
    }
  };
  visit([objective.spoolId]);
  return found;
};

export const solveSmallBoard = (level: CrochetLevel, startingState = createInitialPuzzleState(level)): SolverResult => {
  let branchCount = 0;
  let exploredStates = 0;
  const seen = new Set<string>();

  const search = (state: PuzzleState): string[][] | null => {
    exploredStates += 1;
    if (state.status === "complete") return [];
    const key = JSON.stringify({
      index: state.currentObjectiveIndex,
      remaining: state.spoolRemaining,
      routes: state.routes.map((route) => route.channelIds)
    });
    if (seen.has(key)) return null;
    seen.add(key);
    const candidates = enumerateLegalRoutes(level, state);
    branchCount += Math.max(0, candidates.length - 1);
    for (const candidate of candidates) {
      const result = commitRoute(level, state, candidate);
      if (!result.ok) continue;
      const remainder = search(result.state);
      if (remainder) return [candidate, ...remainder];
    }
    return null;
  };

  const trace = search(startingState);
  if (!trace) {
    return { solvable: false, trace: [], solutionLength: 0, branchCount, exploredStates, reason: "No legal route sequence completes this board." };
  }
  return {
    solvable: true,
    trace,
    solutionLength: trace.reduce((total, route) => total + route.length - 1, 0),
    branchCount,
    exploredStates
  };
};

export interface LevelVerification {
  valid: boolean;
  errors: string[];
  solver: SolverResult;
}

export const verifyAuthoredLevel = (level: CrochetLevel): LevelVerification => {
  const errors: string[] = [];
  if (!level.objectives.length) errors.push("A level needs at least one visible stitch objective.");
  if (level.generationMethod && level.generationMethod !== "hand-authored") {
    errors.push("Authored campaign and expert boards cannot use an unstable generation mode.");
  }
  for (const objective of level.objectives) {
    const spool = level.spools.find((candidate) => candidate.id === objective.spoolId);
    const target = getNode(level, objective.targetId);
    if (!objective.visible || !spool || spool.color !== objective.color || !target || target.visible === false) {
      errors.push("Objective " + objective.id + " has inaccessible required color or hidden information.");
    }
    if (!objective.requiredVia.every((nodeId) => getNode(level, nodeId)?.visible !== false)) {
      errors.push("Objective " + objective.id + " depends on an invisible routing constraint.");
    }
  }
  const stored = replayTrace(level, level.solutionTrace);
  if (!stored.ok) errors.push("Stored solution trace failed: " + (stored.reason ?? "unknown route error") + ".");
  const solver = solveSmallBoard(level);
  if (!solver.solvable) errors.push(solver.reason ?? "The solver rejected the board.");
  if (level.solverMetadata.parMoves !== level.objectives.length) errors.push("Recorded par moves does not match the authored objective count.");
  const storedSolutionLength = level.solutionTrace.reduce((total, route) => total + route.length - 1, 0);
  if (level.solverMetadata.solutionLength !== storedSolutionLength) {
    errors.push("Recorded solution length does not match the stored trace.");
  }
  if (solver.solvable && level.solverMetadata.branchCount !== solver.branchCount) {
    errors.push("Recorded branch count does not match the deterministic solver result.");
  }
  if (level.solverMetadata.mechanicTags.includes("booster")) errors.push("Booster-dependent routes are not allowed.");
  return { valid: errors.length === 0, errors, solver };
};
