import { clonePuzzleState, createInitialPuzzleState, type CrochetLevel, type PuzzleState, type Route } from "./model";
import { commitRoute } from "./engine";

export interface RouteCommand {
  type: "route";
  route: Route;
  before: PuzzleState;
  after: PuzzleState;
}

export interface CommandHistory {
  undo: RouteCommand[];
  redo: RouteCommand[];
}

export const createCommandHistory = (): CommandHistory => ({ undo: [], redo: [] });

export const executeRouteCommand = (
  level: CrochetLevel,
  state: PuzzleState,
  history: CommandHistory,
  nodeIds: string[]
) => {
  const result = commitRoute(level, state, nodeIds);
  if (!result.ok) return { ...result, history };
  const command: RouteCommand = {
    type: "route",
    route: result.route,
    before: clonePuzzleState(state),
    after: clonePuzzleState(result.state)
  };
  return {
    ok: true as const,
    state: result.state,
    route: result.route,
    history: { undo: [...history.undo, command], redo: [] }
  };
};

export const undoCommand = (state: PuzzleState, history: CommandHistory) => {
  const command = history.undo.at(-1);
  if (!command) return { state, history, changed: false };
  const restored = clonePuzzleState(command.before);
  return {
    state: restored,
    history: { undo: history.undo.slice(0, -1), redo: [command, ...history.redo] },
    changed: true
  };
};

export const redoCommand = (state: PuzzleState, history: CommandHistory) => {
  const command = history.redo[0];
  if (!command) return { state, history, changed: false };
  return {
    state: clonePuzzleState(command.after),
    history: { undo: [...history.undo, command], redo: history.redo.slice(1) },
    changed: true
  };
};

export const restartPuzzle = (level: CrochetLevel) => ({
  state: createInitialPuzzleState(level),
  history: createCommandHistory()
});
