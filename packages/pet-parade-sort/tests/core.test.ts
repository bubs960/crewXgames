import { describe, expect, it } from "vitest";
import {
  PetParadeSessionSchema,
  accessibleRunCounts,
  applyMove,
  campaignLevels,
  createDailyParade,
  createInitialParadeState,
  createPetParadeSession,
  detectDeadState,
  executeParadeCommand,
  expertLevels,
  getLegalMoves,
  isPostLocked,
  legalHint,
  migrateLegacyPetParadeBests,
  occupiedUnits,
  redoParadeCommand,
  replaySolution,
  shippedLevels,
  stableParadeSnapshot,
  TUTORIAL_LESSONS,
  tutorialCoachFor,
  tutorialLessonFor,
  tutorialLevels,
  undoParadeCommand,
  validateLevel,
  validateMove,
  visibleVariant,
  type ParadeState,
  type PetParadeLevel
} from "@teammultiply/pet-parade-sort";

const stateAlongTrace = (level: PetParadeLevel, predicate: (state: ParadeState, index: number) => boolean) => {
  let state = createInitialParadeState(level);
  if (predicate(state, 0)) return state;
  for (const [index, move] of level.solutionTrace.entries()) {
    state = applyMove(level, state, move).state;
    if (predicate(state, index + 1)) return state;
  }
  throw new Error(`No matching trace state found for ${level.id}.`);
};

describe("Pet Parade Sort content and solver", () => {
  it("ships three tutorials, forty campaign boards, and ten expert boards", () => {
    expect(tutorialLevels).toHaveLength(3);
    expect(campaignLevels).toHaveLength(40);
    expect(expertLevels).toHaveLength(10);
    expect(shippedLevels).toHaveLength(53);
    expect(new Set(shippedLevels.map((level) => level.id)).size).toBe(53);
    expect(new Set(campaignLevels.map((level) => level.chapterNumber))).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it("solver-verifies every shipped trace and rejects trivial or malformed boards", () => {
    for (const level of shippedLevels) {
      const replay = replaySolution(level, level.solutionTrace);
      expect(replay.valid, `${level.id}: ${"reason" in replay ? replay.reason : ""}`).toBe(true);
      const report = validateLevel(level, 2_000);
      expect(report.valid, `${level.id}: ${report.errors.join(" ")}`).toBe(true);
      expect(report.solver.solved).toBe(true);
      expect(report.solver.upperBound).toBeGreaterThanOrEqual(level.orders.length);
      expect(report.difficulty.score).toBeGreaterThan(0);
    }
  }, 60_000);

  it("produces a legal strategic hint and reports a forced dead state", () => {
    const level = campaignLevels[12];
    const state = createInitialParadeState(level);
    const hint = legalHint(level, state, 2_000);
    expect(hint.move).toBeDefined();
    expect(validateMove(level, state, hint.move!).valid).toBe(true);

    const lockedLevel = structuredClone(level);
    for (const post of lockedLevel.posts) post.lockedByOrderId = lockedLevel.orders[0].id;
    const dead = detectDeadState(lockedLevel, createInitialParadeState(lockedLevel), 100);
    expect(dead).toMatchObject({ dead: true, certain: true });
  });
});

describe("Pet Parade Sort guided practice", () => {
  it("opens with a one-move lesson that completes the first collar", () => {
    const level = tutorialLevels[0];
    const state = createInitialParadeState(level);
    const move = tutorialCoachFor(level, state, null, 2_000)?.move;

    expect(level.solutionTrace).toHaveLength(1);
    expect(move).toEqual(level.solutionTrace[0]);
    expect(applyMove(level, state, move!).state.status).toBe("complete");
  });

  it("defines a three-lesson journey with a clear campaign handoff", () => {
    expect(TUTORIAL_LESSONS).toHaveLength(3);
    expect(TUTORIAL_LESSONS.map((lesson) => lesson.number)).toEqual([1, 2, 3]);
    expect(TUTORIAL_LESSONS.map((lesson) => lesson.levelId)).toEqual(tutorialLevels.map((level) => level.id));
    expect(tutorialLessonFor("pps-tutorial-01")?.title).toContain("Match");
    expect(tutorialLessonFor("pps-tutorial-03")?.completionTitle).toContain("Intake Desk");
    expect(tutorialLessonFor(campaignLevels[0].id)).toBeUndefined();
  });

  it("guides source, destination, and off-path selection without issuing an illegal move", () => {
    const level = tutorialLevels[0];
    const state = createInitialParadeState(level);
    const source = tutorialCoachFor(level, state, null, 2_000)!;
    expect(source.phase).toBe("source");
    expect(source.targetId).toBe(source.move.from);
    expect(validateMove(level, state, source.move).valid).toBe(true);

    const destination = tutorialCoachFor(level, state, source.move.from, 2_000)!;
    expect(destination.phase).toBe("destination");
    expect(destination.targetId).toBe(source.move.to);
    expect(destination.move).toEqual(source.move);

    const otherPost = level.posts.find((post) => post.id !== source.move.from)!.id;
    const reset = tutorialCoachFor(level, state, otherPost, 2_000)!;
    expect(reset).toMatchObject({ phase: "reset", targetId: otherPost, targetLabel: "Reset" });

    const completed = replaySolution(level, level.solutionTrace);
    expect(completed.valid).toBe(true);
    expect(tutorialCoachFor(level, completed.state, null, 2_000)).toBeNull();
    expect(tutorialCoachFor(campaignLevels[0], createInitialParadeState(campaignLevels[0]), null, 2_000)).toBeNull();
  });
});

describe("Pet Parade Sort move rules", () => {
  it("accepts top tags and matching runs, while rejecting same-post and incompatible moves", () => {
    const level = tutorialLevels[1];
    const state = createInitialParadeState(level);
    const legal = getLegalMoves(level, state);
    expect(legal.length).toBeGreaterThan(0);
    expect(validateMove(level, state, legal[0]).valid).toBe(true);
    expect(validateMove(level, state, { from: legal[0].from, to: legal[0].from, count: 1 }).valid).toBe(false);
    const source = level.posts.find((post) => (state.stacks[post.id]?.length ?? 0) > 0)!;
    const sourceOwner = level.tags.find((tag) => tag.id === state.stacks[source.id].at(-1))!.owner;
    const incompatible = level.posts.find((post) => {
      const top = state.stacks[post.id]?.at(-1);
      return top && level.tags.find((tag) => tag.id === top)!.owner !== sourceOwner;
    });
    if (incompatible) expect(validateMove(level, state, { from: source.id, to: incompatible.id, count: 1 }).valid).toBe(false);
  });

  it("enforces capacity, locked buckles, linked pairs, flips, patterns, bells, foster hooks, and inspections", () => {
    const locked = campaignLevels.find((level) => level.mechanics.includes("locked-buckle"))!;
    const lockedState = createInitialParadeState(locked);
    const buckle = locked.posts.find((post) => post.kind === "buckle")!;
    expect(isPostLocked(locked, lockedState, buckle.id)).toBe(true);
    const source = locked.posts.find((post) => lockedState.stacks[post.id].length)!;
    expect(validateMove(locked, lockedState, { from: source.id, to: buckle.id, count: 1 }).valid).toBe(false);

    const linked = campaignLevels.find((level) => level.mechanics.includes("linked-pair"))!;
    const linkedCommand = linked.solutionTrace.find((move) => move.count > 1)!;
    const linkedIndex = linked.solutionTrace.indexOf(linkedCommand);
    const linkedState = stateAlongTrace(linked, (_state, index) => index === linkedIndex);
    expect(accessibleRunCounts(linked, linkedState, linkedCommand.from)).toContain(linkedCommand.count);
    expect(validateMove(linked, linkedState, { ...linkedCommand, count: 1 }).valid).toBe(false);

    const flipped = campaignLevels.find((level) => level.mechanics.includes("double-sided"))!;
    let flipState = createInitialParadeState(flipped);
    let flippedTagId = "";
    for (const command of flipped.solutionTrace) {
      const transition = applyMove(flipped, flipState, command);
      flippedTagId = transition.movedTagIds.find((id) => flipped.tags.find((tag) => tag.id === id)?.doubleSided) ?? "";
      if (flippedTagId) {
        expect(visibleVariant(flipped, transition.state, flippedTagId)).not.toBe(visibleVariant(flipped, flipState, flippedTagId));
        break;
      }
      flipState = transition.state;
    }
    expect(flippedTagId).not.toBe("");

    const pattern = campaignLevels.find((level) => level.mechanics.includes("pattern-collar"))!;
    expect(replaySolution(pattern, pattern.solutionTrace).valid).toBe(true);

    const bell = campaignLevels.find((level) => level.mechanics.includes("oversized-bell"))!;
    const bellTag = bell.tags.find((tag) => tag.size === 2)!;
    expect(occupiedUnits(bell, [bellTag.id])).toBe(2);
    const capacityLevel = structuredClone(bell);
    const capacityState = createInitialParadeState(capacityLevel);
    for (const post of capacityLevel.posts) capacityState.stacks[post.id] = [];
    const capacitySource = capacityLevel.posts.find((post) => post.kind === "standard")!;
    const capacityDestination = capacityLevel.posts.find((post) => post.kind === "standard" && post.id !== capacitySource.id)!;
    capacityState.stacks[capacitySource.id] = [bellTag.id];
    capacityDestination.capacity = 1;
    expect(validateMove(capacityLevel, capacityState, { from: capacitySource.id, to: capacityDestination.id, count: 1 }).reason).toContain("capacity");

    const patternLevel = campaignLevels.find((level) => level.mechanics.includes("pattern-collar") && !level.mechanics.includes("priority-card"))!;
    const patternOrder = patternLevel.orders.find((order) => order.pattern)!;
    const patternState = createInitialParadeState(patternLevel);
    for (const post of patternLevel.posts) patternState.stacks[post.id] = [];
    const patternSource = patternLevel.posts.find((post) => post.kind === "standard")!;
    const patternDestination = patternLevel.posts.find((post) => post.kind === "standard" && post.id !== patternSource.id)!;
    patternDestination.capacity = 10;
    const wrongPattern = [...patternOrder.tagIds];
    [wrongPattern[0], wrongPattern[1]] = [wrongPattern[1], wrongPattern[0]];
    patternState.stacks[patternDestination.id] = wrongPattern.slice(0, -1);
    patternState.stacks[patternSource.id] = [wrongPattern.at(-1)!];
    const patternTransition = applyMove(patternLevel, patternState, { from: patternSource.id, to: patternDestination.id, count: 1 });
    expect(patternTransition.state.completedOrderIds).not.toContain(patternOrder.id);

    const priority = campaignLevels.find((level) => level.mechanics.includes("priority-card"))!;
    const laterOrder = [...priority.orders].filter((order) => order.priority !== undefined).sort((left, right) => right.priority! - left.priority!)[0];
    const priorityState = createInitialParadeState(priority);
    for (const post of priority.posts) priorityState.stacks[post.id] = [];
    const prioritySource = priority.posts.find((post) => post.kind === "standard")!;
    const priorityDestination = priority.posts.find((post) => post.kind === "standard" && post.id !== prioritySource.id)!;
    priorityDestination.capacity = 10;
    priorityState.stacks[priorityDestination.id] = laterOrder.tagIds.slice(0, -1);
    priorityState.stacks[prioritySource.id] = [laterOrder.tagIds.at(-1)!];
    const priorityTransition = applyMove(priority, priorityState, { from: prioritySource.id, to: priorityDestination.id, count: 1 });
    expect(priorityTransition.state.completedOrderIds).not.toContain(laterOrder.id);

    const foster = campaignLevels.find((level) => level.mechanics.includes("foster-hook"))!;
    const fosterState = createInitialParadeState(foster);
    const fosterPost = foster.posts.find((post) => post.kind === "foster")!;
    const rejectedSource = foster.posts.find((post) => {
      const top = fosterState.stacks[post.id]?.at(-1);
      return top && !fosterPost.acceptsOwners!.includes(foster.tags.find((tag) => tag.id === top)!.owner);
    })!;
    expect(validateMove(foster, fosterState, { from: rejectedSource.id, to: fosterPost.id, count: 1 }).valid).toBe(false);

    const inspected = campaignLevels.find((level) => level.mechanics.includes("cat-inspection"))!;
    const active = stateAlongTrace(inspected, (state) => Boolean(state.activeInspection));
    const blockedPost = active.activeInspection!.postId;
    const blockedCommand = { from: blockedPost, to: inspected.posts.find((post) => post.id !== blockedPost)!.id, count: 1 };
    expect(validateMove(inspected, active, blockedCommand).reason).toContain("inspecting");
  });

  it("restores exact board, inspection, flip, completion, and move state through undo and redo", () => {
    const level = expertLevels[5];
    const initial = createInitialParadeState(level);
    const command = getLegalMoves(level, initial)[0];
    const executed = executeParadeCommand(level, initial, { undo: [], redo: [] }, command);
    const undone = undoParadeCommand(executed.state, executed.history);
    expect(stableParadeSnapshot(undone.state)).toBe(stableParadeSnapshot(initial));
    const redone = redoParadeCommand(undone.state, undone.history);
    expect(stableParadeSnapshot(redone.state)).toBe(stableParadeSnapshot(executed.state));
  });
});

describe("Pet Parade Sort daily and save data", () => {
  it("creates a deterministic, solver-valid Daily Parade", () => {
    const first = createDailyParade("2026-07-20");
    const second = createDailyParade("2026-07-20");
    const other = createDailyParade("2026-07-21");
    expect(first).toEqual(second);
    expect(first.id).toBe("pps-daily-20260720");
    expect(first.generatedFrom).toBeDefined();
    expect(other.id).not.toBe(first.id);
    expect(replaySolution(first, first.solutionTrace).valid).toBe(true);
    for (let offset = 0; offset < 366; offset += 1) {
      const date = new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
      const daily = createDailyParade(date);
      expect(createDailyParade(date)).toEqual(daily);
      expect(replaySolution(daily, daily.solutionTrace).valid, date).toBe(true);
    }
  });

  it("round-trips exact sessions including undo, redo, album, settings, daily ledger, and pending events", () => {
    const level = tutorialLevels[0];
    const session = createPetParadeSession(level);
    const command = getLegalMoves(level, session.state)[0];
    const executed = executeParadeCommand(level, session.state, session.history, command);
    session.state = executed.state;
    session.history = executed.history;
    session.settings.highContrast = true;
    session.album.reactions.push("Dogs are already ready.");
    session.dailyLedger["2026-07-20"] = { completedAt: "2026-07-20T12:00:00.000Z", moves: 9 };
    const restored = PetParadeSessionSchema.parse(JSON.parse(JSON.stringify(session)));
    expect(restored).toEqual(session);
    const migrated = migrateLegacyPetParadeBests(restored, [7, null, 12], "2026-07-20T13:00:00.000Z");
    expect(migrated.completionRecords["pps-legacy-1"]?.moves).toBe(7);
    expect(migrated.completionRecords["pps-legacy-3"]?.moves).toBe(12);
    expect(migrated.state).toEqual(restored.state);
  });
});
