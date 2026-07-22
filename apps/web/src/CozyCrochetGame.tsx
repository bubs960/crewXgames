import { useEffect, useMemo, useRef, useState } from "react";
import type { EcosystemEvent } from "@teammultiply/ecosystem-core";
import { GameSessionStorage } from "@teammultiply/save-data";
import {
  CAMPAIGN_LEVELS,
  CrochetSessionSchema,
  EXPERT_LEVELS,
  createCommandHistory,
  createCompletionEvents,
  createCrochetSession,
  createInitialPuzzleState,
  dailySeedFromDate,
  executeRouteCommand,
  generateDailyCandidate,
  getAuthoredLevel,
  getCurrentObjective,
  getNode,
  mergeCrochetMedals,
  redoCommand,
  undoCommand,
  validateRoute,
  type CrochetMedal,
  type CrochetCompletionRecord,
  type CrochetLevel,
  type CrochetSession,
  type StitchObjective
} from "@teammultiply/crochet-critters";
import { CrochetStage } from "./CrochetStage";

export interface CozyCrochetGameProps {
  onBackToShelf: () => void;
  onGameEvents: (events: EcosystemEvent[]) => Promise<boolean>;
}

const localToday = () => {
  const date = new Date();
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
};

const resolveLevel = (levelId: string): CrochetLevel | undefined => {
  const authored = getAuthoredLevel(levelId);
  if (authored) return authored;
  const match = /^ccc-daily-(\d+)$/.exec(levelId);
  return match ? generateDailyCandidate(Number(match[1])) : undefined;
};

const portraitAsset = (portrait: CrochetLevel["portrait"]) => "/assets/crochet/" + portrait + "-wakes.png";

const previewLength = (level: CrochetLevel, nodeIds: string[]) => nodeIds.slice(1).reduce((total, id, index) => {
  const from = getNode(level, nodeIds[index]);
  const to = getNode(level, id);
  return from && to ? total + Math.hypot(from.x - to.x, from.y - to.y) : total;
}, 0);

const scoreFor = (level: CrochetLevel, moves: number, usedUndo: boolean) =>
  Math.max(100, 1000 + level.solverMetadata.difficultyScore * 20 - Math.max(0, moves - level.solverMetadata.parMoves) * 70 - (usedUndo ? 75 : 0));

const portraitComplete = (session: CrochetSession, portrait: CrochetLevel["portrait"]) => {
  const finalId: Record<CrochetLevel["portrait"], string> = {
    kitten: "ccc-kitten-08",
    puppy: "ccc-puppy-08",
    bunny: "ccc-bunny-08"
  };
  return session.completedLevelIds.includes(finalId[portrait]);
};

const medalSummary = (medals: CrochetMedal[] | undefined) =>
  medals?.length ? medals.length + "/3 medals · " + medals.join(" · ") : "0/3 medals · not yet completed";

type EarlyLesson = {
  lesson: number;
  label: string;
  title: string;
  story: string;
  intro: string;
};

type TutorialGuide = {
  kind: "node" | "stitch";
  nodeId?: string;
  step: number;
  totalSteps: number;
  instruction: string;
  explanation: string;
  actionLabel: string;
};

const earlyLessons: Record<string, EarlyLesson> = {
  "ccc-kitten-01": {
    lesson: 1,
    label: "Lesson 1 of 3 · One safe stitch",
    title: "Mallow's loose ear",
    story: "Mallow is nearly awake, but one coral ear has slipped loose. We will repair it together. This is practice: a missed tap changes nothing.",
    intro: "Meet Mallow. We will make one guided coral stitch together—first the spool, then the pin, then the ear."
  },
  "ccc-kitten-02": {
    lesson: 2,
    label: "Lesson 2 of 3 · Change yarn",
    title: "Two soft corners",
    story: "Mallow has one ear and one paw to secure. Each stitch begins at the spool with its own color. You will repeat the rhythm with a new yarn.",
    intro: "Mallow needs two small repairs. Follow the highlighted yarn for each stitch; every new route starts at its matching spool."
  },
  "ccc-kitten-03": {
    lesson: 3,
    label: "Lesson 3 of 3 · Learn a hook",
    title: "A nose needs a bend",
    story: "The last practice stitch uses a hook instead of a pin. Hardware is a guide for the yarn, not decoration. After this, you will know the whole first pattern language.",
    intro: "One last practice: guide coral through the hook to Mallow's nose, then make the teal paw stitch."
  }
};

const tutorialOpening = (level: CrochetLevel) =>
  earlyLessons[level.id]?.intro ?? level.tutorialBeat ?? level.title + " is set on the craft table. Read the next stitch and plan the clean route.";

const getTutorialGuide = (
  level: CrochetLevel,
  objective: StitchObjective | null,
  draftRoute: string[],
  previewValid: boolean | null
): TutorialGuide | null => {
  if (!earlyLessons[level.id] || !objective) return null;
  const steps = [objective.spoolId, ...objective.requiredVia, objective.targetId];
  if (draftRoute.length < steps.length) {
    const nodeId = steps[draftRoute.length];
    const node = getNode(level, nodeId);
    if (!node) return null;
    if (node.kind === "spool") {
      return {
        kind: "node",
        nodeId,
        step: 1,
        totalSteps: steps.length + 1,
        instruction: "Pick up the glowing " + node.color + " spool. Yarn always begins at a spool.",
        explanation: "The color tells you which yarn belongs to this stitch. Nothing is spent while you are only previewing a route.",
        actionLabel: "Pick up " + node.color + " yarn"
      };
    }
    if (nodeId === objective.targetId) {
      return {
        kind: "node",
        nodeId,
        step: steps.length,
        totalSteps: steps.length + 1,
        instruction: "Finish at the glowing " + node.label + ". The board will check the whole visible path before it lets you tighten it.",
        explanation: "A stitch is the end of a route. The preview is safe to inspect or clear before it becomes permanent.",
        actionLabel: "Finish at " + node.label
      };
    }
    return {
      kind: "node",
      nodeId,
      step: draftRoute.length + 1,
      totalSteps: steps.length + 1,
      instruction: "Guide the yarn through the glowing " + node.label + ". Pins and hooks tell yarn how to travel.",
      explanation: "Guide hardware is part of the rule. It changes the route without spending yarn or punishing an experiment.",
      actionLabel: "Guide through " + node.label
    };
  }
  if (previewValid) {
    return {
      kind: "stitch",
      step: steps.length + 1,
      totalSteps: steps.length + 1,
      instruction: "The preview is clean and within the tension cap. Tighten it to make this stitch permanent.",
      explanation: "Tightening is the only moment that saves the route and uses yarn. Undo can restore a completed stitch exactly.",
      actionLabel: "Tighten this clean stitch"
    };
  }
  return null;
};

export const CozyCrochetGame = ({ onBackToShelf, onGameEvents }: CozyCrochetGameProps) => {
  const storage = useMemo(() => new GameSessionStorage("cozy-crochet-critters", CrochetSessionSchema), []);
  const [session, setSession] = useState<CrochetSession | null>(null);
  const [draftRoute, setDraftRoute] = useState<string[]>([]);
  const [notice, setNotice] = useState("Opening the Pattern Book and restoring your exact puzzle state…");
  const [paused, setPaused] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [animationToken, setAnimationToken] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const boardRef = useRef<HTMLElement>(null);
  const boardControlsRef = useRef<HTMLDivElement>(null);
  const onGameEventsRef = useRef(onGameEvents);
  const dispatchedCompletionKeys = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    void storage.load().then((saved) => {
      if (!active) return;
      const savedLevel = saved ? resolveLevel(saved.activeLevelId) : undefined;
      if (saved && savedLevel && saved.state.levelId === savedLevel.id) {
        setSession({ ...saved, completionRecords: saved.completionRecords ?? {} });
        setNotice(saved.state.status === "complete" ? "Your completed critter is waiting in the Pattern Book." : "Exact in-progress puzzle restored from local storage.");
      } else {
        setSession(createCrochetSession(CAMPAIGN_LEVELS[0]));
        setNotice(tutorialOpening(CAMPAIGN_LEVELS[0]));
      }
    }).catch((error: unknown) => {
      if (!active) return;
      setSession(createCrochetSession(CAMPAIGN_LEVELS[0]));
      setNotice("A prior game save could not be read, so a clean Kitten Square was prepared: " + (error instanceof Error ? error.message : "Unknown save error"));
    });
    return () => { active = false; };
  }, [storage]);

  useEffect(() => {
    onGameEventsRef.current = onGameEvents;
  }, [onGameEvents]);

  useEffect(() => {
    if (!session) return;
    let disposed = false;
    void storage.save(session).then(async () => {
      for (const [levelId, facts] of Object.entries(session.completionRecords)) {
        const completedLevel = resolveLevel(levelId);
        const key = levelId + ":" + facts.completedAt;
        if (!completedLevel || dispatchedCompletionKeys.current.has(key)) continue;
        dispatchedCompletionKeys.current.add(key);
        try {
          const delivered = await onGameEventsRef.current(createCompletionEvents(completedLevel, facts));
          if (!delivered) {
            dispatchedCompletionKeys.current.delete(key);
            if (!disposed) setNotice("Your completed pattern is safely saved. Shelf sync will retry the next time this game opens.");
          }
        } catch {
          dispatchedCompletionKeys.current.delete(key);
          if (!disposed) setNotice("Your completed pattern is safely saved. Shelf sync will retry the next time this game opens.");
        }
      }
    }).catch((error: unknown) => {
      if (!disposed) {
        setNotice("The current puzzle is still open, but local saving failed: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    });
    return () => { disposed = true; };
  }, [session, storage]);

  const level = session ? resolveLevel(session.activeLevelId) ?? CAMPAIGN_LEVELS[0] : CAMPAIGN_LEVELS[0];
  const objective = session ? getCurrentObjective(level, session.state) : null;
  const preview = session && draftRoute.length > 1 ? validateRoute(level, session.state, draftRoute) : null;
  const tension = previewLength(level, draftRoute);

  const feedback = (kind: "stitch" | "error" | "wake") => {
    if (!session?.settings.sound || typeof window === "undefined") return;
    const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    const context = audioRef.current ?? new Context();
    audioRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "error" ? "sawtooth" : "sine";
    oscillator.frequency.value = kind === "wake" ? 640 : kind === "error" ? 150 : 380;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (kind === "wake" ? 0.32 : 0.13));
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + (kind === "wake" ? 0.34 : 0.15));
  };

  const updateSession = (next: CrochetSession) => {
    setSession(next);
    setDraftRoute([]);
  };

  const loadLevel = (nextLevel: CrochetLevel) => {
    if (!session) return;
    updateSession({
      ...createCrochetSession(nextLevel),
      completedLevelIds: session.completedLevelIds,
      medals: session.medals,
      completionRecords: session.completionRecords,
      settings: session.settings
    });
    setResultOpen(false);
    setPaused(false);
    setNotice(tutorialOpening(nextLevel));
  };

  const chooseNode = (nodeId: string) => {
    if (!session || paused || session.state.status === "complete" || !objective) return;
    const guide = getTutorialGuide(level, objective, draftRoute, preview?.valid ?? null);
    if (guide?.kind === "stitch") {
      setNotice("The route is ready. " + guide.instruction);
      return;
    }
    if (guide?.kind === "node" && nodeId !== guide.nodeId) {
      setNotice("Lesson mode keeps this gentle. " + guide.instruction);
      return;
    }
    const target = getNode(level, nodeId);
    if (!target) return;
    if (!draftRoute.length) {
      if (nodeId !== objective.spoolId) {
        setNotice("Start this stitch at the " + objective.color + " spool. Its color, symbol, and remaining length are visible above the board.");
        feedback("error");
        return;
      }
      setDraftRoute([nodeId]);
      setNotice("" + target.label + " selected. Route through visible pins or hooks, then release at " + objective.label + ".");
      return;
    }
    if (nodeId === objective.spoolId) {
      setDraftRoute([nodeId]);
      setNotice("Fresh route started at the " + objective.color + " spool.");
      return;
    }
    if (nodeId === draftRoute.at(-1)) return;
    if (target.kind === "spool") {
      setNotice("Only the required spool can start this stitch.");
      feedback("error");
      return;
    }
    setDraftRoute((route) => [...route, nodeId]);
    setNotice(nodeId === objective.targetId ? "Route preview ready. Check tension, then tighten the stitch." : target.label + " added to the preview route.");
  };

  const startCurrentSpool = () => {
    if (!objective) return;
    chooseNode(objective.spoolId);
  };

  const stitchRoute = () => {
    if (!session || !objective || paused) return;
    const command = executeRouteCommand(level, session.state, session.history, draftRoute);
    if (!command.ok) {
      setNotice(command.reason + " The loose preview returned cleanly to the spool; no puzzle state changed.");
      setDraftRoute([]);
      feedback("error");
      return;
    }
    const completed = command.state.status === "complete";
    const earnedMedals: CrochetMedal[] = completed
      ? [
          ...(command.state.moves <= level.solverMetadata.parMoves ? ["par" as const] : []),
          ...(!session.usedUndo ? ["clean" as const] : []),
          ...(Object.values(command.state.spoolRemaining).every((remaining) => remaining <= 0.09) ? ["tension" as const] : [])
        ]
      : [];
    const facts: CrochetCompletionRecord | undefined = completed
      ? {
          completedAt: new Date().toISOString(),
          moves: command.state.moves,
          score: scoreFor(level, command.state.moves, session.usedUndo),
          usedUndo: session.usedUndo
        }
      : undefined;
    const completionFacts = facts ? session.completionRecords[level.id] ?? facts : undefined;
    const nextSession: CrochetSession = {
      ...session,
      state: command.state,
      history: command.history,
      completedLevelIds: completed && !session.completedLevelIds.includes(level.id)
        ? [...session.completedLevelIds, level.id]
        : session.completedLevelIds,
      medals: completed
        ? {
            ...session.medals,
            [level.id]: mergeCrochetMedals(session.medals[level.id], earnedMedals)
          }
        : session.medals,
      completionRecords: completionFacts
        ? { ...session.completionRecords, [level.id]: completionFacts }
        : session.completionRecords
    };
    updateSession(nextSession);
    setAnimationToken((token) => token + 1);
    feedback(completed ? "wake" : "stitch");
    if (!completed) {
      const next = getCurrentObjective(level, command.state);
      setNotice("Stitch tightened. Next: " + next?.label + " in " + next?.color + ".");
      return;
    }
    setNotice(level.portrait[0].toUpperCase() + level.portrait.slice(1) + " wakes up. Its provenance-backed Shelf event is saved locally and syncing now; duplicate events remain harmless.");
    setResultOpen(true);
  };

  const revealTutorialStep = () => {
    const guide = getTutorialGuide(level, objective, draftRoute, preview?.valid ?? null);
    if (!guide) {
      return;
    }
    if (guide.kind === "stitch") {
      boardControlsRef.current?.scrollIntoView({
        behavior: session?.settings.reducedMotion ? "auto" : "smooth",
        block: "center"
      });
      setNotice("Your clean route is ready. The highlighted Tighten stitch button below the board is the only step that makes yarn permanent.");
      return;
    }
    const target = getNode(level, guide.nodeId!);
    boardRef.current?.scrollIntoView({
      behavior: session?.settings.reducedMotion ? "auto" : "smooth",
      block: "start"
    });
    setNotice(target ? "The board is ready. Tap the glowing " + target.label + "." : guide.instruction);
  };

  const undo = () => {
    if (!session || paused) return;
    const result = undoCommand(session.state, session.history);
    if (!result.changed) {
      setNotice("There is no completed stitch to undo.");
      return;
    }
    updateSession({ ...session, state: result.state, history: result.history, usedUndo: true });
    setNotice("The last stitch returned to the spool exactly; its prior tension and channels are restored.");
  };

  const redo = () => {
    if (!session || paused) return;
    const result = redoCommand(session.state, session.history);
    if (!result.changed) {
      setNotice("There is no undone stitch to redo.");
      return;
    }
    updateSession({ ...session, state: result.state, history: result.history });
    setNotice("The exact route was stitched again.");
  };

  const restart = () => {
    if (!session) return;
    updateSession({ ...session, state: createInitialPuzzleState(level), history: createCommandHistory(), usedUndo: false });
    setResultOpen(false);
    setNotice(earlyLessons[level.id] ? tutorialOpening(level) : "Fresh yarn, same deterministic board. Nothing hidden changed.");
  };

  const hint = () => {
    if (!objective) return;
    const constraints = objective.requiredVia.map((id) => getNode(level, id)?.label).filter(Boolean);
    setNotice(constraints.length
      ? "Constraint hint: " + objective.label + " must use " + constraints.join(" and ") + ". The visible hardware is part of the route, not decoration."
      : "Constraint hint: keep the " + objective.color + " strand clean and finish at " + objective.label + ". Check the tension preview before release.");
  };

  const share = async () => {
    const text = "I woke a " + level.portrait + " in Cozy Crochet Critters — " + level.title + ".";
    try {
      if (navigator.share) await navigator.share({ title: "Cozy Crochet Critters", text });
      else await navigator.clipboard.writeText(text);
      setNotice("Share text is ready. The completed critter remains on the craft table while you return to the Pattern Book.");
    } catch {
      setNotice("Share was cancelled; the completed critter remains safely saved in your Pattern Book.");
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        restart();
      } else if (event.key === "Escape") {
        setPaused((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!session) return <main className="crochet-loading"><p>Winding yarn and opening the craft table…</p></main>;

  const currentSpool = objective ? level.spools.find((spool) => spool.id === objective.spoolId) : undefined;
  const allLevels = [...CAMPAIGN_LEVELS, ...EXPERT_LEVELS];
  const currentCampaignIndex = CAMPAIGN_LEVELS.findIndex((candidate) => candidate.id === level.id);
  const nextCampaignLevel = level.mode === "campaign" && currentCampaignIndex >= 0
    ? CAMPAIGN_LEVELS.slice(currentCampaignIndex + 1).find((candidate) => !session.completedLevelIds.includes(candidate.id))
    : undefined;
  const earlyLesson = earlyLessons[level.id];
  const tutorialGuide = getTutorialGuide(level, objective, draftRoute, preview?.valid ?? null);
  const tutorialActive = Boolean(earlyLesson && objective && session.state.status !== "complete" && tutorialGuide);
  const tutorialTarget = tutorialGuide?.kind === "node" ? getNode(level, tutorialGuide.nodeId!) : undefined;
  const tutorialActionLabel = tutorialGuide?.kind === "stitch"
    ? "Show Tighten stitch"
    : tutorialTarget
      ? "Show the glowing " + tutorialTarget.label
      : "Show next move";
  const stageClass = "crochet-app" + (session.settings.reducedMotion ? " reduce-motion" : "") + (session.settings.highContrast ? " high-contrast" : "");

  return (
    <main className={stageClass}>
      <header className={"crochet-header" + (tutorialActive ? " crochet-header-lesson" : "")}>
        <img className="crochet-header-atmosphere" src="/assets/crochet/mallow-hero-atmosphere-v1.png" alt="" aria-hidden="true" />
        <div className="crochet-header-copy">
          <p className="crochet-eyebrow">CrewMultiply Play · Living Shelf Pack 01</p>
          <h1>Cozy Crochet Critters</h1>
          <p>Route yarn, tighten the final stitch, and wake a handmade resident.</p>
        </div>
        <div className="crochet-header-actions">
          <button type="button" onClick={() => setShowBook(true)}>Pattern Book</button>
          <button type="button" onClick={onBackToShelf}>Living Shelf</button>
        </div>
      </header>

      {tutorialActive && earlyLesson && tutorialGuide && (
        <section className="crochet-coach" aria-labelledby="tutorial-coach-title" aria-live="polite">
          <div>
            <p className="crochet-kicker">{earlyLesson.label}</p>
            <h2 id="tutorial-coach-title">{earlyLesson.title}</h2>
            <p>{earlyLesson.story}</p>
          </div>
          <div className="crochet-coach-next">
            <div className="crochet-coach-task">
              <span aria-hidden="true">{tutorialGuide.step}</span>
              <div>
                <strong>Step {tutorialGuide.step} of {tutorialGuide.totalSteps}</strong>
                <p>{tutorialGuide.instruction}</p>
              </div>
            </div>
            <button className="crochet-coach-action" type="button" onClick={revealTutorialStep} disabled={paused}>{tutorialActionLabel}</button>
          </div>
          <ol className="crochet-learning-path" aria-label="How one stitch works">
            {["Pick yarn", "Guide it", "Place stitch", "Tighten"].map((label, index) => (
              <li className={tutorialGuide.step === index + 1 ? "current" : tutorialGuide.step > index + 1 ? "done" : ""} aria-current={tutorialGuide.step === index + 1 ? "step" : undefined} key={label}>
                <span aria-hidden="true">{tutorialGuide.step > index + 1 ? "✓" : index + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          <p className="crochet-coach-reassurance">Practice mode: only the glowing next move advances this lesson. A missed tap does not spend yarn or damage the pattern.</p>
        </section>
      )}

      <section className={"crochet-mode-row" + (tutorialActive ? " crochet-mode-row-tutorial" : "")} aria-label="Game mode and settings">
        {tutorialActive ? (
          <>
            <div className="crochet-lesson-focus">
              <p className="crochet-kicker">Practice path</p>
              <strong>One safe stitch at a time</strong>
              <span>Follow the glow. The board will not punish a missed tap.</span>
            </div>
            <details className="crochet-lesson-options">
              <summary>Lesson options</summary>
              <div className="crochet-lesson-options-content">
                <div className="crochet-mode-buttons" role="group" aria-label="Level sets">
                  <button type="button" className={level.mode === "campaign" ? "active" : ""} onClick={() => loadLevel(CAMPAIGN_LEVELS.find((candidate) => !session.completedLevelIds.includes(candidate.id)) ?? CAMPAIGN_LEVELS[0])}>Campaign · 24</button>
                  <button type="button" className={level.mode === "expert" ? "active" : ""} onClick={() => loadLevel(EXPERT_LEVELS.find((candidate) => !session.completedLevelIds.includes(candidate.id)) ?? EXPERT_LEVELS[0])}>Expert · 6</button>
                  <button type="button" className={level.mode === "daily" ? "active" : ""} onClick={() => loadLevel(generateDailyCandidate(dailySeedFromDate(localToday())))}>Daily Hoop</button>
                </div>
                <div className="crochet-lesson-toggles">
                  <label className="crochet-toggle"><input type="checkbox" checked={session.settings.sound} onChange={(event) => setSession({ ...session, settings: { ...session.settings, sound: event.target.checked } })} /> Sound</label>
                  <label className="crochet-toggle"><input type="checkbox" checked={session.settings.reducedMotion} onChange={(event) => setSession({ ...session, settings: { ...session.settings, reducedMotion: event.target.checked } })} /> Reduced motion</label>
                  <label className="crochet-toggle"><input type="checkbox" checked={session.settings.highContrast} onChange={(event) => setSession({ ...session, settings: { ...session.settings, highContrast: event.target.checked } })} /> High contrast</label>
                </div>
              </div>
            </details>
          </>
        ) : (
          <>
            <div className="crochet-mode-buttons" role="group" aria-label="Level sets">
              <button type="button" className={level.mode === "campaign" ? "active" : ""} onClick={() => loadLevel(CAMPAIGN_LEVELS.find((candidate) => !session.completedLevelIds.includes(candidate.id)) ?? CAMPAIGN_LEVELS[0])}>Campaign · 24</button>
              <button type="button" className={level.mode === "expert" ? "active" : ""} onClick={() => loadLevel(EXPERT_LEVELS.find((candidate) => !session.completedLevelIds.includes(candidate.id)) ?? EXPERT_LEVELS[0])}>Expert · 6</button>
              <button type="button" className={level.mode === "daily" ? "active" : ""} onClick={() => loadLevel(generateDailyCandidate(dailySeedFromDate(localToday())))}>Daily Hoop</button>
            </div>
            <label className="crochet-toggle"><input type="checkbox" checked={session.settings.sound} onChange={(event) => setSession({ ...session, settings: { ...session.settings, sound: event.target.checked } })} /> Sound</label>
            <label className="crochet-toggle"><input type="checkbox" checked={session.settings.reducedMotion} onChange={(event) => setSession({ ...session, settings: { ...session.settings, reducedMotion: event.target.checked } })} /> Reduced motion</label>
            <label className="crochet-toggle"><input type="checkbox" checked={session.settings.highContrast} onChange={(event) => setSession({ ...session, settings: { ...session.settings, highContrast: event.target.checked } })} /> High contrast</label>
          </>
        )}
      </section>

      <section className={"crochet-layout" + (tutorialActive ? " crochet-layout-tutorial" : "")}>
        <aside className="crochet-panel crochet-objective-panel" aria-label="Current stitch objective">
          <p className="crochet-kicker">{level.chapter}</p>
          <h2>{level.title}</h2>
          <p className="crochet-tutorial">{level.tutorialBeat ?? "Visible information only: color, order, channels, pins, hooks, length, and crossings."}</p>
          <div className="stitch-order" aria-label="Stitch order">
            {level.objectives.map((item, index) => (
              <div key={item.id} className={index === session.state.currentObjectiveIndex ? "next" : index < session.state.currentObjectiveIndex ? "done" : ""}>
                <span aria-hidden="true">{index < session.state.currentObjectiveIndex ? "✓" : index + 1}</span>
                <strong>{item.label}</strong>
                <small>{item.color} · ≤ {item.maxLength.toFixed(2)}</small>
              </div>
            ))}
          </div>
          <button className={"crochet-primary" + (tutorialGuide ? " tutorial-cta" : "")} type="button" onClick={tutorialGuide ? revealTutorialStep : startCurrentSpool} disabled={!objective || paused || session.state.status === "complete"} aria-describedby={tutorialGuide ? "tutorial-coach-title" : undefined}>{tutorialGuide ? tutorialActionLabel : "Start " + (objective?.color ?? "next") + " yarn"}</button>
          <button type="button" onClick={() => tutorialGuide ? setNotice(tutorialGuide.explanation) : hint()} disabled={!objective || paused}>{tutorialGuide ? "Why this step?" : "Constraint hint"}</button>
        </aside>

        <section ref={boardRef} className="crochet-board-panel" aria-label="Crochet puzzle board" tabIndex={-1}>
          <div className="crochet-board-heading">
            <div>
              <p className="crochet-kicker">{level.mode === "daily" ? "Deterministic Daily Hoop" : level.mode === "expert" ? "Expert remix" : "Handcrafted pattern"}</p>
              <h2>{objective ? "Next stitch: " + objective.label : "Every stitch is complete"}</h2>
            </div>
            <button type="button" onClick={() => setPaused(true)}>Pause</button>
          </div>
          <CrochetStage
            level={level}
            state={session.state}
            draftRoute={draftRoute}
            previewValid={preview ? preview.valid : null}
            reducedMotion={session.settings.reducedMotion}
            highContrast={session.settings.highContrast}
            animationToken={animationToken}
            guidedNodeId={tutorialGuide?.kind === "node" ? tutorialGuide.nodeId : undefined}
            onNodeSelect={chooseNode}
          />
          <div className={"route-preview" + (preview && !preview.valid ? " invalid" : "")}>
            <div><strong>Route preview</strong><span>{draftRoute.length ? draftRoute.map((id) => getNode(level, id)?.label ?? id).join(" → ") : "Choose the visible spool to begin."}</span></div>
            <div><strong>Tension</strong><span>{tension.toFixed(2)} / {objective?.maxLength.toFixed(2) ?? "—"}</span></div>
            <div><strong>Legality</strong><span>{preview ? preview.valid ? "Clean route" : preview.reason : "Awaiting a route"}</span></div>
          </div>
          <div ref={boardControlsRef} className="crochet-board-controls" tabIndex={-1}>
            <button type="button" onClick={() => { setDraftRoute([]); setNotice("Loose preview returned to its spool. The puzzle state did not change."); }} disabled={!draftRoute.length || paused}>Clear preview</button>
            <button className={"crochet-primary" + (tutorialGuide?.kind === "stitch" ? " tutorial-cta" : "")} type="button" onClick={stitchRoute} disabled={draftRoute.length < 2 || !preview?.valid || paused || session.state.status === "complete"}>{tutorialGuide?.kind === "stitch" ? "Tighten stitch · make it permanent" : "Tighten stitch"}</button>
            <button type="button" onClick={undo} disabled={!session.history.undo.length || paused}>Undo</button>
            <button type="button" onClick={redo} disabled={!session.history.redo.length || paused}>Redo</button>
            <button type="button" onClick={restart} disabled={paused}>Restart</button>
          </div>
          <p className="crochet-key-help">Mouse/touch: tap a large magnetic target. Keyboard: Tab to every target, Enter/Space to route · Ctrl/Cmd+Z undo · R restart · Esc pause.</p>
        </section>

        <aside className="crochet-panel crochet-spool-panel" aria-label="Spool and Pattern Book status">
          <p className="crochet-kicker">Visible yarn inventory</p>
          <h2>Spools & tension</h2>
          <div className="spool-list">
            {level.spools.map((spool) => (
              <div
                className={"spool-readout " + spool.color + (currentSpool?.id === spool.id ? " active" : "")}
                key={spool.id}
                role="group"
                aria-label={spool.accessibleLabel + " " + (session.state.spoolRemaining[spool.id] ?? 0).toFixed(2) + " of " + spool.length.toFixed(2) + " remains."}
              >
                <span aria-hidden="true">{spool.color.slice(0, 1).toUpperCase()}</span>
                <div><strong>{spool.color}</strong><small>{(session.state.spoolRemaining[spool.id] ?? 0).toFixed(2)} of {spool.length.toFixed(2)} left</small></div>
              </div>
            ))}
          </div>
          <div className="medal-summary">
            <p className="crochet-kicker">Medals</p>
            <strong>{session.medals[level.id]?.length ?? 0} / 3</strong>
            <p>Clean finish · par moves · close tension</p>
          </div>
          <div className="portrait-card">
            <img src={portraitAsset(level.portrait)} alt={level.portrait + " crochet portrait on the craft table"} />
            <div><strong>{portraitComplete(session, level.portrait) ? "Awake in Pattern Book" : "Portrait forming"}</strong><span>{session.state.routes.length} of {level.objectives.length} stitch groups tightened</span></div>
          </div>
        </aside>
      </section>

      <p className="crochet-notice" role="status" aria-live="polite">{notice}</p>

      {paused && (
        <div className="crochet-modal-backdrop" role="presentation">
          <section className="crochet-modal" role="dialog" aria-modal="true" aria-labelledby="pause-title">
            <p className="crochet-kicker">Pause</p><h2 id="pause-title">Yarn held exactly where it is.</h2>
            <p>The simulation, fiber movement, and sound are paused. Your exact local puzzle state is safe.</p>
            <button className="crochet-primary" type="button" onClick={() => setPaused(false)}>Resume stitch work</button>
          </section>
        </div>
      )}

      {showBook && (
        <div className="crochet-modal-backdrop" role="presentation">
          <section className="crochet-modal crochet-book-modal" role="dialog" aria-modal="true" aria-labelledby="book-title">
            <div className="modal-header"><div><p className="crochet-kicker">Pattern Book</p><h2 id="book-title">Handmade residents</h2></div><button type="button" onClick={() => setShowBook(false)}>Close</button></div>
            <div className="pattern-book-grid">
              {(["kitten", "puppy", "bunny"] as const).map((portrait) => (
                <article className={portraitComplete(session, portrait) ? "unlocked" : ""} key={portrait}>
                  <img src={portraitAsset(portrait)} alt={portrait + " crochet portrait"} />
                  <strong>{portrait[0].toUpperCase() + portrait.slice(1)}</strong>
                  <span>{portraitComplete(session, portrait) ? "Awake and recorded" : "Complete the chapter finale to wake"}</span>
                </article>
              ))}
            </div>
            <details className="level-library"><summary>All 30 solver-verified patterns and medals</summary><div>{allLevels.map((candidate) => <button key={candidate.id} className={session.completedLevelIds.includes(candidate.id) ? "completed" : ""} type="button" aria-label={candidate.title + ", " + medalSummary(session.medals[candidate.id])} onClick={() => { loadLevel(candidate); setShowBook(false); }}><span>{candidate.mode === "expert" ? "Expert · " : ""}{candidate.title}</span><small>{medalSummary(session.medals[candidate.id])}</small></button>)}</div></details>
          </section>
        </div>
      )}

      {resultOpen && session.state.status === "complete" && (
        <div className="crochet-modal-backdrop" role="presentation">
          <section className="crochet-modal crochet-result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
            <img className={session.settings.reducedMotion ? "" : "critter-wakes"} src={portraitAsset(level.portrait)} alt={level.portrait + " wakes after the final stitch"} />
            <p className="crochet-kicker">Completed</p><h2 id="result-title">{level.portrait[0].toUpperCase() + level.portrait.slice(1)} wakes up</h2>
            <p>{level.title} · {session.state.moves} moves · {scoreFor(level, session.state.moves, session.usedUndo)} score · {session.medals[level.id]?.join(" · ") || "first finish"}</p>
            <p className="shelf-receipt">Campaign, expert, daily, discovery, and story results are sent as versioned events. The game did not edit Shelf inventory directly.</p>
            <div className="result-actions">{nextCampaignLevel && <button className="crochet-primary" type="button" onClick={() => loadLevel(nextCampaignLevel)}>{earlyLessons[nextCampaignLevel.id] ? "Continue Lesson " + earlyLessons[nextCampaignLevel.id].lesson : "Continue campaign"}</button>}<button type="button" onClick={() => { setResultOpen(false); setShowBook(true); }}>Open Pattern Book</button><button type="button" onClick={share}>Share wake-up</button><button type="button" onClick={onBackToShelf}>Place rewards on Shelf</button></div>
          </section>
        </div>
      )}
    </main>
  );
};
