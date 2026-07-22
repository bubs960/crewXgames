import { legalHint } from "./solver";
import { validateMove } from "./engine";
import {
  OWNER_PRESENTATION,
  postById,
  tagById,
  type MoveCommand,
  type ParadeState,
  type PetParadeLevel
} from "./model";

export interface TutorialLesson {
  levelId: string;
  number: 1 | 2 | 3;
  eyebrow: string;
  title: string;
  objective: string;
  learned: string;
  completionTitle: string;
}

export const TUTORIAL_LESSONS: TutorialLesson[] = [
  {
    levelId: "pps-tutorial-01",
    number: 1,
    eyebrow: "First collar",
    title: "Match one pet family",
    objective: "Only the exposed top tag can move. Put it on an empty post or the same color and symbol.",
    learned: "Top tags move onto empty or matching posts. A finished collar leaves automatically.",
    completionTitle: "You matched your first collar."
  },
  {
    levelId: "pps-tutorial-02",
    number: 2,
    eyebrow: "Matching run",
    title: "Move matching tags together",
    objective: "A connected run of matching top tags travels as one move when the destination has room.",
    learned: "Matching top tags can move together as one run.",
    completionTitle: "You moved a matching run."
  },
  {
    levelId: "pps-tutorial-03",
    number: 3,
    eyebrow: "Capacity check",
    title: "Read the post before moving",
    objective: "Capacity ticks show how many tag spaces fit. Never cover more ticks than the post provides.",
    learned: "Capacity ticks tell you whether a tag or matching run will fit.",
    completionTitle: "Practice complete. The Intake Desk is open."
  }
];

export const tutorialLessonFor = (levelId: string) =>
  TUTORIAL_LESSONS.find((lesson) => lesson.levelId === levelId);

export type TutorialCoachPhase = "source" | "destination" | "reset";

export interface TutorialCoachPrompt {
  phase: TutorialCoachPhase;
  title: string;
  copy: string;
  targetId: string;
  targetLabel: string;
  move: MoveCommand;
}

export const tutorialCoachFor = (
  level: PetParadeLevel,
  state: ParadeState,
  selectedPostId: string | null,
  maxStates = 10_000
): TutorialCoachPrompt | null => {
  if (level.mode !== "tutorial" || state.status === "complete") return null;
  const hint = legalHint(level, state, maxStates);
  const authoredOpening = state.moves === 0 ? level.solutionTrace[0] : undefined;
  const move = authoredOpening && validateMove(level, state, authoredOpening).valid ? authoredOpening : hint.move;
  if (!move) return null;

  const source = postById(level, move.from);
  const destination = postById(level, move.to);
  const topTagId = state.stacks[move.from]?.at(-1);
  const topTag = topTagId ? tagById(level, topTagId) : undefined;
  const owner = topTag ? OWNER_PRESENTATION[topTag.owner] : undefined;
  const ownerLabel = owner?.label ?? "Matching";
  const ownerSingular = ownerLabel.endsWith("s") ? ownerLabel.slice(0, -1).toLowerCase() : ownerLabel.toLowerCase();
  const movingLabel = move.count > 1 ? `${move.count} matching ${ownerSingular} tags` : `the ${ownerSingular} tag`;
  const lesson = tutorialLessonFor(level.id);
  const freesRun = lesson?.number === 2 && move.count === 1;
  const capacityReminder = lesson?.number === 3 ? " Check the destination’s capacity ticks before placing it." : "";

  if (selectedPostId && selectedPostId !== move.from) {
    const selected = postById(level, selectedPostId);
    return {
      phase: "reset",
      title: "Clear that selection",
      copy: `Tap ${selected?.label ?? "the selected post"} again. Then the guided step starts on ${source?.label ?? "the highlighted source"}.`,
      targetId: selectedPostId,
      targetLabel: "Reset",
      move
    };
  }

  if (selectedPostId === move.from) {
    const destinationIsEmpty = (state.stacks[move.to]?.length ?? 0) === 0;
    return {
      phase: "destination",
      title: freesRun ? `Place the blocking ${ownerSingular} tag` : `Now place ${movingLabel}`,
      copy: `${destination?.label ?? "The highlighted post"} is ${destinationIsEmpty ? "empty" : `already showing ${ownerSingular} tags`}, so this move is legal.${freesRun ? " This exposes the matching run underneath." : capacityReminder}`,
      targetId: move.to,
      targetLabel: "2 · Place",
      move
    };
  }

  return {
    phase: "source",
    title: freesRun ? "First, free the matching run" : `Pick up ${movingLabel}`,
    copy: freesRun
      ? `${source?.label ?? "The highlighted post"} has one ${ownerSingular} tag above the matching run. Tap it first.`
      : `${source?.label ?? "The highlighted post"} has the next movable tag on top. Tap that post once.${capacityReminder}`,
    targetId: move.from,
    targetLabel: "1 · Pick",
    move
  };
};
