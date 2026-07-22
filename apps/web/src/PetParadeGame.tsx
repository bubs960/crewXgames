import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EcosystemEvent } from "@teammultiply/ecosystem-core";
import { GameSessionStorage } from "@teammultiply/save-data";
import {
  OWNER_PRESENTATION,
  PetParadeSessionSchema,
  campaignChapters,
  campaignLevels,
  clearPendingEvents,
  createChapterChallenge,
  createDailyParade,
  createInitialParadeState,
  createParadeHistory,
  createParadeCompletionEvents,
  createPetParadeSession,
  describeBoard,
  detectDeadState,
  executeParadeCommand,
  expertLevels,
  legalHint,
  levelById,
  mergeBestCompletion,
  migrateLegacyPetParadeBests,
  nextInspectionPreview,
  postById,
  preferredMove,
  redoParadeCommand,
  scoreCompletion,
  shippedLevels,
  tagById,
  TUTORIAL_LESSONS,
  tutorialCoachFor,
  tutorialLessonFor,
  tutorialLevels,
  undoParadeCommand,
  validateMove,
  withPendingEvents,
  type MoveCommand,
  type PetParadeLevel,
  type PetParadeSession,
  type TagOwner
} from "@teammultiply/pet-parade-sort";
import { PetParadeStage } from "./PetParadeStage";
import "./PetParadeGame.css";

export interface PetParadeGameProps {
  onBackToShelf: () => void;
  onGameEvents: (events: EcosystemEvent[]) => Promise<boolean>;
}

const todayLocal = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const resolveSessionLevel = (session: PetParadeSession): PetParadeLevel => {
  const staticLevel = levelById(session.activeLevelId);
  if (staticLevel) return staticLevel;
  if (session.activeMode === "daily") return createDailyParade(session.activeDate ?? todayLocal());
  if (session.activeMode === "challenge") {
    const chapter = Number(session.activeLevelId.match(/pps-challenge-(\d+)/)?.[1] ?? 1);
    return createChapterChallenge(chapter);
  }
  return tutorialLevels[0];
};

const readLegacyBests = () => {
  try {
    return Array.from({ length: 5 }, (_, index) => {
      const value = Number.parseInt(localStorage.getItem(`pps_best_l${index}`) ?? "", 10);
      return Number.isFinite(value) && value > 0 ? value : null;
    });
  } catch {
    return Array<number | null>(5).fill(null);
  }
};

const cueFrequencies = {
  enamel: [720, 930],
  brass: [510, 790],
  steel: [430, 650],
  bell: [610, 1040],
  buckle: [180, 380],
  arrival: [440, 660, 880],
  invalid: [180, 150]
} as const;

const reactionFor = (owner: TagOwner) => OWNER_PRESENTATION[owner].reaction;

export const PetParadeGame = ({ onBackToShelf, onGameEvents }: PetParadeGameProps) => {
  const storage = useMemo(() => new GameSessionStorage<PetParadeSession>("pet-parade-sort", PetParadeSessionSchema), []);
  const [session, setSession] = useState<PetParadeSession | null>(null);
  const [level, setLevel] = useState<PetParadeLevel>(tutorialLevels[0]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [hintMove, setHintMove] = useState<MoveCommand | null>(null);
  const [notice, setNotice] = useState("Opening the Collar Club record…");
  const [paused, setPaused] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [coachDismissed, setCoachDismissed] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [animationToken, setAnimationToken] = useState(0);
  const [arrivalOwner, setArrivalOwner] = useState<TagOwner | null>(null);
  const [saveStatus, setSaveStatus] = useState("Opening local save");
  const audioRef = useRef<AudioContext | null>(null);
  const completingRef = useRef(false);
  const howToStartRef = useRef<HTMLButtonElement | null>(null);
  const resultPrimaryRef = useRef<HTMLButtonElement | null>(null);
  const onGameEventsRef = useRef(onGameEvents);

  const tutorialLesson = useMemo(() => tutorialLessonFor(level.id), [level.id]);
  const tutorialCoach = useMemo(
    () => session && !coachDismissed ? tutorialCoachFor(level, session.state, selectedPostId) : null,
    [coachDismissed, level, selectedPostId, session]
  );

  useEffect(() => {
    onGameEventsRef.current = onGameEvents;
  }, [onGameEvents]);

  const persist = useCallback(async (next: PetParadeSession) => {
    setSaveStatus("Saving…");
    try {
      await storage.save(next);
      setSaveStatus("Saved locally");
      return true;
    } catch (error) {
      setSaveStatus("Save failed");
      setNotice(`The current board remains open, but its local save failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  }, [storage]);

  const syncPendingEvents = useCallback(async (current: PetParadeSession) => {
    if (!current.pendingEvents.length) return current;
    const eventIds = current.pendingEvents.map((event) => event.eventId);
    const synced = await onGameEventsRef.current(current.pendingEvents);
    if (!synced) return current;
    const cleared = PetParadeSessionSchema.parse(clearPendingEvents(current, eventIds));
    await storage.save(cleared);
    setSession(cleared);
    return cleared;
  }, [storage]);

  useEffect(() => {
    let active = true;
    storage.load().then(async (saved) => {
      if (!active) return;
      let restored = saved ?? createPetParadeSession(tutorialLevels[0]);
      if (!saved) restored = migrateLegacyPetParadeBests(restored, readLegacyBests());
      let restoredLevel = resolveSessionLevel(restored);
      if (restored.state.levelId !== restoredLevel.id) {
        restoredLevel = tutorialLevels[0];
        restored = { ...createPetParadeSession(restoredLevel), completionRecords: restored.completionRecords, album: restored.album, dailyLedger: restored.dailyLedger, settings: restored.settings };
      }
      setLevel(restoredLevel);
      setSession(restored);
      if (!saved) setShowHowToPlay(true);
      setNotice(saved ? "Exact collar board restored. No tag was guessed." : "First shift ready. Choose a visible top tag.");
      setSaveStatus("Saved locally");
      if (!saved) await storage.save(restored);
      if (restored.pendingEvents.length) await syncPendingEvents(restored);
    }).catch((error: unknown) => {
      if (!active) return;
      const fallback = createPetParadeSession(tutorialLevels[0]);
      setLevel(tutorialLevels[0]);
      setSession(fallback);
      setSaveStatus("Save unavailable");
      setNotice(`The local Collar Club record could not open: ${error instanceof Error ? error.message : "Unknown error"}`);
    });
    return () => { active = false; };
  }, [storage, syncPendingEvents]);

  useEffect(() => {
    if (!showHowToPlay) return;
    const frame = window.requestAnimationFrame(() => howToStartRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [showHowToPlay]);

  useEffect(() => {
    if (showHowToPlay || !tutorialCoach?.targetId) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLButtonElement>('.parade-post-targets button[aria-current="step"]');
      target?.focus({ preventScroll: true });
      if (target && window.matchMedia("(max-width: 680px)").matches) {
        document.querySelector<HTMLElement>(".parade-coach-card")?.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showHowToPlay, tutorialCoach?.targetId]);

  useEffect(() => {
    if (!resultOpen) return;
    const frame = window.requestAnimationFrame(() => resultPrimaryRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [resultOpen]);

  const ensureAudio = () => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
    return audioRef.current;
  };

  const playCue = useCallback((cue: keyof typeof cueFrequencies) => {
    if (!session || session.settings.soundMuted) return;
    const audio = ensureAudio();
    const start = audio.currentTime;
    cueFrequencies[cue].forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = cue === "invalid" ? "sine" : cue === "bell" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start + index * 0.055);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.82), start + index * 0.055 + 0.12);
      gain.gain.setValueAtTime(0.0001, start + index * 0.055);
      gain.gain.exponentialRampToValueAtTime(cue === "arrival" ? 0.085 : 0.055, start + index * 0.055 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.055 + (cue === "bell" ? 0.32 : 0.16));
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start + index * 0.055);
      oscillator.stop(start + index * 0.055 + (cue === "bell" ? 0.34 : 0.18));
    });
  }, [session]);

  const finishLevel = useCallback(async (base: PetParadeSession, completedLevel: PetParadeLevel) => {
    if (completingRef.current) return;
    completingRef.current = true;
    const completedAt = new Date().toISOString();
    const scored = scoreCompletion(completedLevel, base.state.moves, base.hintsUsed);
    const record = {
      completedAt,
      moves: base.state.moves,
      score: scored.score,
      medals: scored.medals,
      hintsUsed: base.hintsUsed,
      usedUndo: base.usedUndo
    };
    const next = structuredClone(base);
    next.completionRecords[completedLevel.id] = mergeBestCompletion(next.completionRecords[completedLevel.id], record);
    next.album.helpedPetIds = [...new Set([...next.album.helpedPetIds, ...completedLevel.orders.map((order) => order.owner)])];
    next.album.reactions = [...new Set([...next.album.reactions, ...completedLevel.orders.map((order) => reactionFor(order.owner))])];
    if (completedLevel.mode === "daily") {
      const date = next.activeDate ?? todayLocal();
      next.dailyLedger[date] = { completedAt, moves: base.state.moves };
    }
    const staticIndex = shippedLevels.findIndex((candidate) => candidate.id === completedLevel.id);
    if (staticIndex >= 0 && shippedLevels[staticIndex + 1] && !next.unlockedLevelIds.includes(shippedLevels[staticIndex + 1].id)) {
      next.unlockedLevelIds.push(shippedLevels[staticIndex + 1].id);
    }
    const events = createParadeCompletionEvents(completedLevel, {
      completedAt,
      moves: base.state.moves,
      score: scored.score,
      hintsUsed: base.hintsUsed,
      usedUndo: base.usedUndo,
      date: next.activeDate
    });
    const pending = PetParadeSessionSchema.parse(withPendingEvents(next, events));
    setSession(pending);
    setResultOpen(true);
    setNotice("Collar complete. Cooperation remains unconfirmed.");
    playCue("arrival");
    const saved = await persist(pending);
    if (saved) await syncPendingEvents(pending);
    completingRef.current = false;
  }, [persist, playCue, syncPendingEvents]);

  const commitSession = useCallback((next: PetParadeSession) => {
    setSession(next);
    void persist(next);
  }, [persist]);

  const makeMove = useCallback((from: string, to: string) => {
    if (!session || paused || session.state.status === "complete") return;
    const command = preferredMove(level, session.state, from, to);
    if (!command) {
      const attempted = { from, to, count: 1 };
      const reason = validateMove(level, session.state, attempted).reason ?? "That tag cannot move there.";
      setNotice(reason);
      playCue("invalid");
      setSelectedPostId(from);
      setAnimationToken((token) => token + 1);
      return;
    }
    const executed = executeParadeCommand(level, session.state, session.history, command);
    const next = { ...structuredClone(session), state: executed.state, history: executed.history };
    setSelectedPostId(null);
    setHintMove(null);
    setAnimationToken((token) => token + 1);
    const firstTag = tagById(level, executed.transition.movedTagIds[0]);
    playCue(firstTag?.material ?? "enamel");
    if (executed.transition.completedOrderIds.length) {
      const completedOrder = level.orders.find((order) => order.id === executed.transition.completedOrderIds.at(-1));
      if (completedOrder) {
        setArrivalOwner(completedOrder.owner);
        setNotice(`${completedOrder.petName} claimed the ${completedOrder.collarStyle} collar. ${reactionFor(completedOrder.owner)}`);
        window.setTimeout(() => setArrivalOwner(null), next.settings.reducedMotion ? 10 : 1600);
      }
      playCue("buckle");
    } else if (executed.transition.inspectionStarted) {
      const post = postById(level, executed.transition.inspectionStarted.postId);
      setNotice(`Cat inspection started at ${post?.label ?? "one post"} for ${executed.transition.inspectionStarted.remainingMoves} move${executed.transition.inspectionStarted.remainingMoves === 1 ? "" : "s"}.`);
    } else {
      setNotice(`${executed.transition.movedTagIds.length} tag${executed.transition.movedTagIds.length === 1 ? "" : "s"} settled with a clean clink.`);
    }
    commitSession(next);
    if (next.state.status === "complete") void finishLevel(next, level);
    else {
      const dead = detectDeadState(level, next.state, 2_000);
      if (dead.dead && dead.certain) setNotice("No legal completion path remains from here. Undo is unlimited.");
    }
  }, [commitSession, finishLevel, level, paused, playCue, session]);

  const activatePost = useCallback((postId: string) => {
    if (!session || paused) return;
    if (!selectedPostId) {
      if (!session.state.stacks[postId]?.length) {
        setNotice("That post is empty. Choose a visible top tag first.");
        return;
      }
      setSelectedPostId(postId);
      setHintMove(null);
      setNotice(`${postById(level, postId)?.label ?? "Post"} selected. Choose an empty or matching destination.`);
      return;
    }
    if (selectedPostId === postId) {
      setSelectedPostId(null);
      setNotice("Selection cleared.");
      return;
    }
    makeMove(selectedPostId, postId);
  }, [level, makeMove, paused, selectedPostId, session]);

  const undo = useCallback(() => {
    if (!session || paused) return;
    const result = undoParadeCommand(session.state, session.history);
    if (!result.changed) { setNotice("Nothing to undo."); return; }
    const next = { ...structuredClone(session), state: result.state, history: result.history, usedUndo: true };
    setSelectedPostId(null);
    setHintMove(null);
    setResultOpen(false);
    setNotice("Last move undone exactly.");
    setAnimationToken((token) => token + 1);
    commitSession(next);
  }, [commitSession, paused, session]);

  const redo = useCallback(() => {
    if (!session || paused) return;
    const result = redoParadeCommand(session.state, session.history);
    if (!result.changed) { setNotice("Nothing to redo."); return; }
    const next = { ...structuredClone(session), state: result.state, history: result.history };
    setSelectedPostId(null);
    setHintMove(null);
    setNotice("Move restored exactly.");
    setAnimationToken((token) => token + 1);
    commitSession(next);
  }, [commitSession, paused, session]);

  const restart = useCallback(() => {
    if (!session) return;
    const next = {
      ...structuredClone(session),
      state: createInitialParadeState(level),
      history: createParadeHistory(),
      hintsUsed: 0,
      usedUndo: false
    };
    setSelectedPostId(null);
    setHintMove(null);
    setResultOpen(false);
    setCoachDismissed(false);
    setNotice("Organizer reset. Every visible tag returned to its authored position.");
    setAnimationToken((token) => token + 1);
    commitSession(next);
  }, [commitSession, level, session]);

  const showHint = useCallback(() => {
    if (!session || paused) return;
    const hint = legalHint(level, session.state, 20_000);
    if (!hint.move) { setNotice(hint.result.reason ?? "No legal hint is available."); return; }
    const next = { ...structuredClone(session), hintsUsed: session.hintsUsed + 1 };
    setHintMove(hint.move);
    setSelectedPostId(hint.move.from);
    setNotice(`${hint.strategic ? "Solver step" : "Legal step"}: move the highlighted top run from ${postById(level, hint.move.from)?.label} to ${postById(level, hint.move.to)?.label}.`);
    commitSession(next);
  }, [commitSession, level, paused, session]);

  const loadLevel = useCallback((nextLevel: PetParadeLevel) => {
    if (!session) return;
    const next = {
      ...structuredClone(session),
      activeLevelId: nextLevel.id,
      activeMode: nextLevel.mode,
      activeDate: nextLevel.mode === "daily" ? nextLevel.id.match(/(\d{4})(\d{2})(\d{2})$/)?.slice(1).join("-") : undefined,
      selectedLevelId: nextLevel.id,
      state: createInitialParadeState(nextLevel),
      history: createParadeHistory(),
      hintsUsed: 0,
      usedUndo: false
    };
    setLevel(nextLevel);
    setSession(next);
    setSelectedPostId(null);
    setHintMove(null);
    setCoachDismissed(false);
    setShowLevels(false);
    setResultOpen(false);
    setPaused(false);
    setNotice(nextLevel.intro);
    setAnimationToken((token) => token + 1);
    void persist(next);
  }, [persist, session]);

  const updateSettings = useCallback((changes: Partial<PetParadeSession["settings"]>) => {
    if (!session) return;
    const next = { ...structuredClone(session), settings: { ...session.settings, ...changes } };
    setSession(next);
    void persist(next);
  }, [persist, session]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (showHowToPlay) setShowHowToPlay(false);
        else if (showLevels) setShowLevels(false);
        else if (showAlbum) setShowAlbum(false);
        else if (resultOpen) setResultOpen(false);
        else setPaused((value) => !value);
      }
      else if (event.key.toLowerCase() === "u" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey)) { event.preventDefault(); undo(); }
      else if (event.key.toLowerCase() === "y" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && event.shiftKey)) { event.preventDefault(); redo(); }
      else if (event.key.toLowerCase() === "r") { event.preventDefault(); restart(); }
      else if (event.key.toLowerCase() === "h") { event.preventDefault(); showHint(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, restart, resultOpen, showAlbum, showHint, showHowToPlay, showLevels, undo]);

  if (!session) return <main className="parade-loading" role="status">Opening the collar organizer…</main>;

  const completion = session.completionRecords[level.id];
  const guidedPracticeActive = Boolean(tutorialLesson && !coachDismissed && !completion);
  const inspection = nextInspectionPreview(level, session.state);
  const nextStatic = shippedLevels[shippedLevels.findIndex((candidate) => candidate.id === level.id) + 1];
  const chapterMedals = (chapterNumber: number) => campaignLevels
    .filter((candidate) => candidate.chapterNumber === chapterNumber)
    .reduce((sum, candidate) => sum + (session.completionRecords[candidate.id]?.medals.length ?? 0), 0);

  return (
    <main className={`parade-app${guidedPracticeActive ? " guided-practice" : ""}${session.settings.highContrast ? " high-contrast" : ""}${session.settings.reducedMotion ? " reduce-motion" : ""}${session.settings.reducedEffects ? " reduce-effects" : ""}`}>
      <header className="parade-header">
        <button className="parade-back" type="button" onClick={onBackToShelf}>← Living Shelf</button>
        <div className="parade-brand">
          <p>CrewMultiply Play · Small moves. Big mischief.</p>
          <h1>Pet Parade Sort</h1>
          <span>The Collar Club</span>
        </div>
        <div className="parade-save"><span aria-hidden="true" />{saveStatus}</div>
      </header>

      <section className={`parade-hud${guidedPracticeActive ? " parade-hud-guided" : ""}`} aria-label="Level status">
        <div><span>{level.mode}</span><strong>{level.title}</strong><small>{level.chapter}</small></div>
        <div><span>Moves</span><strong>{session.state.moves}</strong><small>Par {level.parMoves}</small></div>
        {!guidedPracticeActive && <div><span>Best</span><strong>{completion?.moves ?? "—"}</strong><small>{completion?.medals.length ?? 0} / 3 medals</small></div>}
        <div><span>Orders</span><strong>{session.state.completedOrderIds.length} / {level.orders.length}</strong><small>{inspection ? inspection.active ? `Cat: ${inspection.moves}` : `Inspection in ${inspection.moves}` : "Organizer clear"}</small></div>
      </section>

      <nav className="parade-toolbar" aria-label="Pet Parade controls">
        <div className="parade-toolbar-primary">
          <button className="parade-help-button" type="button" onClick={() => setShowHowToPlay(true)}>How to play</button>
          {!guidedPracticeActive && <button type="button" onClick={showHint}>Hint <kbd>H</kbd></button>}
          <button type="button" onClick={undo} disabled={!session.history.undo.length}>Undo <kbd>U</kbd></button>
          {!guidedPracticeActive && <button type="button" onClick={redo} disabled={!session.history.redo.length}>Redo <kbd>Y</kbd></button>}
          <button type="button" onClick={restart}>Restart <kbd>R</kbd></button>
        </div>
        {guidedPracticeActive ? (
          <details className="parade-toolbar-more">
            <summary>More options</summary>
            <div>
              <button type="button" onClick={() => setPaused(true)}>Pause</button>
              <button type="button" onClick={() => setShowLevels(true)}>Level book</button>
              <button type="button" onClick={() => setShowAlbum(true)}>Parade Album</button>
              <button type="button" onClick={() => loadLevel(createDailyParade(todayLocal()))}>Daily Parade</button>
              <button type="button" aria-pressed={!session.settings.soundMuted} onClick={() => { ensureAudio(); updateSettings({ soundMuted: !session.settings.soundMuted }); }}>
                Sound {session.settings.soundMuted ? "off" : "on"}
              </button>
            </div>
          </details>
        ) : (
          <div className="parade-toolbar-secondary">
            <button type="button" onClick={() => setPaused(true)}>Pause <kbd>Esc</kbd></button>
            <button type="button" onClick={() => setShowLevels(true)}>Level book</button>
            <button type="button" onClick={() => setShowAlbum(true)}>Parade Album</button>
            <button type="button" onClick={() => loadLevel(createDailyParade(todayLocal()))}>Daily Parade</button>
            <button type="button" aria-pressed={!session.settings.soundMuted} onClick={() => { ensureAudio(); updateSettings({ soundMuted: !session.settings.soundMuted }); }}>
              Sound {session.settings.soundMuted ? "off" : "on"}
            </button>
          </div>
        )}
      </nav>

      <section className="parade-workbench">
        <div className="parade-board-panel">
          <div className="parade-level-copy">
            <div><p>{level.setting}</p><h2>{level.title}</h2></div>
            <p>{level.intro}</p>
          </div>
          {tutorialLesson && !coachDismissed && (
            <section className={`parade-coach-card${tutorialCoach ? ` phase-${tutorialCoach.phase}` : ""}`} aria-labelledby="parade-coach-title" aria-describedby="parade-coach-copy">
              <header>
                <span>Guided practice {tutorialLesson.number} of 3</span>
                <div className="parade-lesson-progress" role="progressbar" aria-label="Guided practice progress" aria-valuemin={1} aria-valuemax={3} aria-valuenow={tutorialLesson.number}>
                  {TUTORIAL_LESSONS.map((lesson) => <i key={lesson.levelId} className={session.completionRecords[lesson.levelId] || lesson.number < tutorialLesson.number ? "complete" : lesson.number === tutorialLesson.number ? "current" : ""} />)}
                </div>
              </header>
              <div className="parade-coach-action">
                <b aria-hidden="true">{tutorialCoach?.phase === "destination" ? "2" : tutorialCoach?.phase === "reset" ? "↺" : "1"}</b>
                <div>
                  <small>{tutorialLesson.eyebrow} · {tutorialLesson.title}</small>
                  <h2 id="parade-coach-title">{tutorialCoach?.title ?? tutorialLesson.title}</h2>
                  <p id="parade-coach-copy">{tutorialCoach?.copy ?? tutorialLesson.objective}</p>
                </div>
                <button type="button" onClick={() => setCoachDismissed(true)}>Hide guide</button>
              </div>
              <footer><strong>Goal</strong><span>{tutorialLesson.objective}</span></footer>
            </section>
          )}
          {tutorialLesson && coachDismissed && <div className="parade-guide-hidden"><span>Guided practice is hidden.</span><button type="button" onClick={() => setCoachDismissed(false)}>Show guide</button></div>}
          <PetParadeStage
            level={level}
            state={session.state}
            selectedPostId={selectedPostId}
            hintMove={hintMove}
            coachTargetId={tutorialCoach?.targetId}
            coachTargetLabel={tutorialCoach?.targetLabel}
            coachPhase={tutorialCoach?.phase}
            animationToken={animationToken}
            reducedMotion={session.settings.reducedMotion}
            reducedEffects={session.settings.reducedEffects}
            highContrast={session.settings.highContrast}
            onPostActivate={activatePost}
            onMoveRequest={makeMove}
          />
          <div className="parade-input-note">
            {tutorialCoach ? <><span>{tutorialCoach.phase === "destination" ? "Next" : tutorialCoach.phase === "reset" ? "Reset" : "Start"}</span> {tutorialCoach.copy}</> : <><span>Tap</span> source, then destination <i /> <span>Drag</span> post to post <i /> <span>Keyboard</span> Tab + Enter</>}
          </div>
        </div>

        <aside className="parade-orders" aria-label="Visible rescue orders">
          <div className="parade-orders-heading"><p>Rescue cards</p><h2>Every collar order</h2><span>Nothing hidden. Nothing reshuffled.</span></div>
          <div className="parade-order-list">
            {level.orders.map((order) => {
              const complete = session.state.completedOrderIds.includes(order.id);
              const presentation = OWNER_PRESENTATION[order.owner];
              return (
                <article key={order.id} className={complete ? "complete" : ""} style={{ "--owner-color": presentation.css } as React.CSSProperties}>
                  <div className="parade-owner-mark" data-edge={presentation.edge} aria-hidden="true">{presentation.symbol}</div>
                  <div><strong>{order.petName}</strong><span>{presentation.label} · {order.collarStyle}</span>{order.pattern && <small>Pattern: {order.pattern.map((part) => part.replace("nameplate", "ID").replace("stripe", "Ⅱ").replace("star", "✦").replace("seal", "—").replace("bell", "●")).join(" · ")}</small>}</div>
                  {order.priority !== undefined && <b>#{order.priority}</b>}
                  <em>{complete ? "Arrived" : "Waiting"}</em>
                </article>
              );
            })}
          </div>
          <details className={guidedPracticeActive ? "parade-guided-details" : "parade-board-details"} open={!guidedPracticeActive}>
            <summary>{guidedPracticeActive ? "Board details and accessibility" : "Board details"}</summary>
            <div className="parade-mechanics"><span>Board notes</span>{level.mechanics.map((item) => <b key={item}>{item.replaceAll("-", " ")}</b>)}</div>
            <div className="parade-settings">
              <label><input type="checkbox" checked={session.settings.reducedMotion} onChange={(event) => updateSettings({ reducedMotion: event.target.checked })} /> Reduced motion</label>
              <label><input type="checkbox" checked={session.settings.reducedEffects} onChange={(event) => updateSettings({ reducedEffects: event.target.checked })} /> Reduced effects</label>
              <label><input type="checkbox" checked={session.settings.highContrast} onChange={(event) => updateSettings({ highContrast: event.target.checked })} /> High contrast</label>
            </div>
          </details>
        </aside>
      </section>

      <p className="parade-notice" role="status" aria-live="polite">{notice}</p>
      <p className="sr-only" aria-live="polite">{describeBoard(level, session.state)}</p>
      {arrivalOwner && <div className="parade-arrival" role="status"><strong>{OWNER_PRESENTATION[arrivalOwner].label.slice(0, -1)} arrived.</strong><span>{reactionFor(arrivalOwner)}</span></div>}

      {showHowToPlay && (
        <div className="parade-modal-backdrop">
          <section className="parade-modal parade-how-to" role="dialog" aria-modal="true" aria-labelledby="parade-how-title" aria-describedby="parade-how-summary">
            <div className="parade-modal-heading"><div><p>Welcome to the Collar Club</p><h2 id="parade-how-title">Match the tags. Help every pet.</h2></div><button type="button" onClick={() => setShowHowToPlay(false)} aria-label="Close how to play">Close</button></div>
            <p id="parade-how-summary" className="parade-how-summary">Put every pet’s matching tags together on one post. A finished collar leaves automatically and its pet joins the parade.</p>
            <div className="parade-how-steps">
              <article><b>1</b><div><strong>Pick the top tag</strong><span>Only the exposed tag or matching top run can move.</span></div></article>
              <article><b>2</b><div><strong>Match the destination</strong><span>Land on an empty post or the same color and symbol.</span></div></article>
              <article><b>3</b><div><strong>Finish the collar</strong><span>Collect every tag for one pet and the collar clears itself.</span></div></article>
            </div>
            <div className="parade-control-choice"><strong>Easiest: tap source, then destination.</strong><span>You can also drag post to post. <span className="parade-keyboard-help">Keyboard play uses Tab and Enter. </span>There is no timer and undo is unlimited.</span></div>
            <div className="parade-how-actions">
              <button ref={howToStartRef} className="parade-primary" type="button" onClick={() => { setCoachDismissed(false); setShowHowToPlay(false); }}>Start guided practice</button>
              <button type="button" onClick={() => { setCoachDismissed(true); setShowHowToPlay(false); }}>Explore on my own</button>
            </div>
          </section>
        </div>
      )}

      {paused && (
        <div className="parade-modal-backdrop">
          <section className="parade-modal parade-pause" role="dialog" aria-modal="true" aria-labelledby="parade-pause-title">
            <p>Pause</p><h2 id="parade-pause-title">The organizer stays exactly here.</h2><span>No timer is running. No pet loses its place.</span><button className="parade-primary" type="button" onClick={() => setPaused(false)}>Resume sorting</button>
          </section>
        </div>
      )}

      {showLevels && (
        <div className="parade-modal-backdrop">
          <section className="parade-modal parade-level-book" role="dialog" aria-modal="true" aria-labelledby="parade-level-title">
            <div className="parade-modal-heading"><div><p>Level book</p><h2 id="parade-level-title">The Collar Club cases</h2></div><button type="button" onClick={() => setShowLevels(false)}>Close</button></div>
            <div className="parade-level-section"><h3>Guided practice · 3 boards</h3><div>{tutorialLevels.map((candidate) => <button className={candidate.id === level.id ? "active" : ""} key={candidate.id} type="button" onClick={() => loadLevel(candidate)}><strong>{candidate.title}</strong><span>{session.completionRecords[candidate.id]?.medals.join(" · ") || "Practice"}</span></button>)}</div></div>
            {campaignChapters.map((chapter) => (
              <div className="parade-level-section" key={chapter.number}><h3>Chapter {chapter.number} · {chapter.title} <span>{chapterMedals(chapter.number)} / 24 medals</span></h3><div>{chapter.levels.map((candidate) => <button className={candidate.id === level.id ? "active" : ""} key={candidate.id} type="button" onClick={() => loadLevel(candidate)}><strong>{candidate.title}</strong><span>{session.completionRecords[candidate.id]?.medals.join(" · ") || candidate.mechanics.at(-1)?.replaceAll("-", " ")}</span></button>)}<button className="challenge" type="button" onClick={() => loadLevel(createChapterChallenge(chapter.number))}><strong>Club Challenge</strong><span>Replayable finale</span></button></div></div>
            ))}
            <div className="parade-level-section"><h3>After-hours experts · 10 boards</h3><div>{expertLevels.map((candidate) => <button className={candidate.id === level.id ? "active" : ""} key={candidate.id} type="button" onClick={() => loadLevel(candidate)}><strong>{candidate.title}</strong><span>{session.completionRecords[candidate.id]?.medals.join(" · ") || `${candidate.mechanics.length} mechanics`}</span></button>)}</div></div>
          </section>
        </div>
      )}

      {showAlbum && (
        <div className="parade-modal-backdrop">
          <section className="parade-modal parade-album" role="dialog" aria-modal="true" aria-labelledby="parade-album-title">
            <div className="parade-modal-heading"><div><p>Parade Album</p><h2 id="parade-album-title">Pets helped, not currency collected.</h2></div><button type="button" onClick={() => setShowAlbum(false)}>Close</button></div>
            <img src="/assets/pet-parade/park-photo-lineup-v1.webp" alt="A cat slightly outside formation, an eager dog, a rabbit with notes, a fox in the light, and a hamster with a clipboard at the park photo" />
            <div className="parade-album-stats"><article><strong>{session.album.helpedPetIds.length}</strong><span>pet families helped</span></article><article><strong>{Object.values(session.completionRecords).reduce((sum, record) => sum + record.medals.length, 0)}</strong><span>chapter medals</span></article><article><strong>{Object.keys(session.dailyLedger).length}</strong><span>days helped</span></article></div>
            <div className="parade-reactions"><h3>Favorite reactions</h3>{session.album.reactions.length ? session.album.reactions.map((reaction) => <button type="button" className={session.album.favoriteReactionId === reaction ? "favorite" : ""} key={reaction} onClick={() => { const next = { ...structuredClone(session), album: { ...session.album, favoriteReactionId: reaction } }; setSession(next); void persist(next); }}>{reaction}</button>) : <p>Complete a collar to add its owner’s very specific opinion.</p>}</div>
          </section>
        </div>
      )}

      {resultOpen && session.state.status === "complete" && (
        <div className="parade-modal-backdrop">
          <section className={`parade-modal parade-result${tutorialLesson ? " parade-lesson-result" : ""}`} role="dialog" aria-modal="true" aria-labelledby="parade-result-title">
            {tutorialLesson ? <div className="parade-lesson-complete" aria-hidden="true">✓</div> : <img className={session.settings.reducedMotion ? "" : "parade-photo-arrives"} src="/assets/pet-parade/park-photo-lineup-v1.webp" alt="The completed rescue-pet park lineup" />}
            <p>{tutorialLesson ? `Practice ${tutorialLesson.number} of 3 complete` : "Park photo in progress"}</p><h2 id="parade-result-title">{tutorialLesson?.completionTitle ?? "Every collar was claimed."}</h2>
            <span>{tutorialLesson ? `${level.title} · ${session.state.moves} ${session.state.moves === 1 ? "move" : "moves"}` : `${level.title} · ${session.state.moves} moves · ${session.completionRecords[level.id]?.score ?? 0} score`}</span>
            {!tutorialLesson && <div className="parade-earned-medals">{session.completionRecords[level.id]?.medals.map((medal) => <b key={medal}>{medal}</b>)}</div>}
            {tutorialLesson ? <div className="parade-learned"><strong>You learned</strong><span>{tutorialLesson.learned}</span>{tutorialLesson.number === 1 && <small>Entryway bench added to your Living Shelf. Keep practicing; it will be waiting.</small>}</div> : <blockquote>“Cats do not line up. They permit arrangements.”</blockquote>}
            <div className="parade-result-actions">
              {nextStatic && <button ref={resultPrimaryRef} className="parade-primary" type="button" onClick={() => loadLevel(nextStatic)}>{tutorialLesson?.number === 3 ? "Start Chapter 1 · Intake Desk" : tutorialLesson ? `Continue · ${nextStatic.title}` : "Next board"}</button>}
              <button type="button" onClick={() => { setResultOpen(false); restart(); }}>Replay board</button>
              {(!tutorialLesson || tutorialLesson.number === 3) && <button type="button" onClick={() => { setResultOpen(false); setShowAlbum(true); }}>Open Parade Album</button>}
              {(!tutorialLesson || tutorialLesson.number === 3) && <button type="button" onClick={onBackToShelf}>Place Shelf rewards</button>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
