import { applyMove } from "./engine";
import { cloneParadeState, type MoveCommand, type ParadeState, type PetParadeLevel } from "./model";

export interface ParadeCommandRecord {
  command: MoveCommand;
  before: ParadeState;
  after: ParadeState;
}

export interface ParadeCommandHistory {
  undo: ParadeCommandRecord[];
  redo: ParadeCommandRecord[];
}

export const createParadeHistory = (): ParadeCommandHistory => ({ undo: [], redo: [] });

export const executeParadeCommand = (
  level: PetParadeLevel,
  state: ParadeState,
  history: ParadeCommandHistory,
  command: MoveCommand
) => {
  const transition = applyMove(level, state, command);
  const record: ParadeCommandRecord = {
    command,
    before: cloneParadeState(state),
    after: cloneParadeState(transition.state)
  };
  return {
    state: transition.state,
    history: { undo: [...history.undo, record], redo: [] },
    transition
  };
};

export const undoParadeCommand = (state: ParadeState, history: ParadeCommandHistory) => {
  const record = history.undo.at(-1);
  if (!record) return { state, history, changed: false };
  return {
    state: cloneParadeState(record.before),
    history: { undo: history.undo.slice(0, -1), redo: [...history.redo, record] },
    changed: true
  };
};

export const redoParadeCommand = (state: ParadeState, history: ParadeCommandHistory) => {
  const record = history.redo.at(-1);
  if (!record) return { state, history, changed: false };
  return {
    state: cloneParadeState(record.after),
    history: { undo: [...history.undo, record], redo: history.redo.slice(0, -1) },
    changed: true
  };
};
