import { describe, expect, it } from "vitest";
import { z } from "zod";
import { receiveGameEvent } from "@teammultiply/game-bridge";
import { GameSessionStorage } from "@teammultiply/save-data";
import { CozyCrochetCrittersShelfPack, createCounterCatFixtureWorld } from "@teammultiply/shelf-pack";
import {
  AUTHORED_LEVELS,
  CAMPAIGN_LEVELS,
  CrochetSessionSchema,
  EXPERT_LEVELS,
  createCommandHistory,
  createCompletionEvents,
  createCrochetSession,
  createInitialPuzzleState,
  dailyDateFromLevelId,
  executeRouteCommand,
  generateDailyCandidate,
  mergeCrochetMedals,
  replayTrace,
  stablePuzzleSnapshot,
  undoCommand,
  validateRoute,
  verifyAuthoredLevel,
  verifyDailySeeds
} from "@teammultiply/crochet-critters";
import "fake-indexeddb/auto";

const dbName = () => "crochet-session-test-" + crypto.randomUUID();

describe("Cozy Crochet Critters graph and solver", () => {
  it("ships 24 campaign boards, 6 expert remixes, and stored solution traces", () => {
    expect(CAMPAIGN_LEVELS).toHaveLength(24);
    expect(EXPERT_LEVELS).toHaveLength(6);
    expect(AUTHORED_LEVELS).toHaveLength(30);
    for (const level of AUTHORED_LEVELS) {
      const verification = verifyAuthoredLevel(level);
      expect(verification.valid, level.id + ": " + verification.errors.join(" ")).toBe(true);
      expect(replayTrace(level, level.solutionTrace).state.status).toBe("complete");
      expect(level.solverMetadata.solutionLength).toBe(verification.solver.solutionLength);
      expect(level.solverMetadata.branchCount).toBe(verification.solver.branchCount);
    }
  });

  it("opens with three explicit kitten lessons before route-planning difficulty begins", () => {
    const lessons = CAMPAIGN_LEVELS.slice(0, 3);
    expect(lessons.map((level) => level.id)).toEqual(["ccc-kitten-01", "ccc-kitten-02", "ccc-kitten-03"]);
    for (const level of lessons) {
      expect(level.tutorialBeat).toBeTruthy();
      for (const objective of level.objectives) {
        expect(level.solutionTrace).toContainEqual([objective.spoolId, ...objective.requiredVia, objective.targetId]);
      }
    }
  });

  it("keeps Daily Hoop spool labels and accessible descriptions synchronized after palette remapping", () => {
    const daily = generateDailyCandidate(20260719);
    for (const spool of daily.spools) {
      const node = daily.nodes.find((candidate) => candidate.id === spool.id);
      expect(spool.accessibleLabel.toLowerCase()).toContain(spool.color);
      expect(node?.label.toLowerCase()).toContain(spool.color);
      expect(node?.symbol).toBe(spool.color[0].toUpperCase());
    }
  });

  it("keeps best-earned medals and the Daily Hoop's original date across a resumed completion", () => {
    expect(mergeCrochetMedals(["par", "tension"], ["clean", "par"])).toEqual(["par", "tension", "clean"]);

    const daily = generateDailyCandidate(20260718);
    const dailyEvents = createCompletionEvents(daily, {
      completedAt: "2026-07-19T12:00:00.000Z",
      moves: 3,
      score: 940,
      usedUndo: false,
      date: "2026-07-19"
    });
    const dailyEvent = dailyEvents.find((event) => event.type === "daily.completed");
    expect(dailyDateFromLevelId(daily.id)).toBe("2026-07-18");
    expect(dailyEvent).toMatchObject({
      eventId: "cozy-crochet-critters:daily:2026-07-18",
      date: "2026-07-18"
    });
  });

  it("adds a replay ledger to legacy saves without changing deterministic completion receipts", () => {
    const level = CAMPAIGN_LEVELS[0];
    const { completionRecords: ignoredCompletionRecords, ...legacySession } = createCrochetSession(level);
    expect(ignoredCompletionRecords).toEqual({});

    const restored = CrochetSessionSchema.parse(legacySession);
    expect(restored.completionRecords).toEqual({});

    const facts = {
      completedAt: "2026-07-19T12:34:56.000Z",
      moves: 1,
      score: 1020,
      usedUndo: false
    };
    const withReplayLedger = CrochetSessionSchema.parse({
      ...restored,
      completionRecords: { [level.id]: facts }
    });
    expect(withReplayLedger.completionRecords[level.id]).toEqual(facts);
    expect(createCompletionEvents(level, withReplayLedger.completionRecords[level.id])[0]).toMatchObject({
      eventId: "cozy-crochet-critters:campaign:" + level.id,
      occurredAt: facts.completedAt
    });
  });

  it("refuses a route command if a restored state belongs to another pattern", () => {
    const level = CAMPAIGN_LEVELS[0];
    const wrongState = createInitialPuzzleState(CAMPAIGN_LEVELS[1]);
    expect(validateRoute(level, wrongState, level.solutionTrace[0])).toMatchObject({
      valid: false,
      reason: "This route belongs to a different pattern."
    });
  });

  it("uses command snapshots so a complete undo restores the initial state byte-for-byte", () => {
    const level = CAMPAIGN_LEVELS[3];
    const initial = createInitialPuzzleState(level);
    const initialBytes = stablePuzzleSnapshot(initial);
    let state = initial;
    let history = createCommandHistory();
    for (const path of level.solutionTrace) {
      const command = executeRouteCommand(level, state, history, path);
      expect(command.ok).toBe(true);
      if (!command.ok) return;
      state = command.state;
      history = command.history;
    }
    while (history.undo.length) {
      const undo = undoCommand(state, history);
      state = undo.state;
      history = undo.history;
    }
    expect(stablePuzzleSnapshot(state)).toBe(initialBytes);
  });

  it("generates every daily from a solved state and survives 10,000 deterministic seed checks", () => {
    const candidate = generateDailyCandidate(20260719);
    expect(candidate.mode).toBe("daily");
    expect(candidate.generationMethod).toBe("backward-from-solved-state");
    expect(candidate.initialState).toBeDefined();
    expect(createInitialPuzzleState(candidate)).toEqual(candidate.initialState);
    expect(replayTrace(candidate, candidate.solutionTrace).state.status).toBe("complete");
    expect(verifyDailySeeds(10_000, 17)).toEqual({ valid: true, checked: 10_000 });
  }, 90_000);

  it("emits versioned campaign, expert, daily, discovery, and story events without duplicating unique rewards", () => {
    const campaign = CAMPAIGN_LEVELS[0];
    const expert = EXPERT_LEVELS.at(-1)!;
    const finalCampaign = CAMPAIGN_LEVELS.at(-1)!;
    const facts = { completedAt: "2026-07-19T12:00:00.000Z", moves: 3, score: 940, usedUndo: false, date: "2026-07-19" };
    const campaignEvents = createCompletionEvents(campaign, facts);
    const expertEvents = createCompletionEvents(expert, facts);
    const dailyEvents = createCompletionEvents(generateDailyCandidate(44), facts);
    const finalEvents = createCompletionEvents(finalCampaign, facts);
    expect(campaignEvents.some((event) => event.type === "game.completed")).toBe(true);
    expect(expertEvents.some((event) => event.type === "expert.completed")).toBe(true);
    expect(dailyEvents.some((event) => event.type === "daily.completed")).toBe(true);
    expect(finalEvents.some((event) => event.type === "discovery.triggered")).toBe(true);
    expect(finalEvents.some((event) => event.type === "story.completed")).toBe(true);

    const initial = createCounterCatFixtureWorld("2026-07-19T11:00:00.000Z");
    const first = receiveGameEvent(initial, campaignEvents[0], [CozyCrochetCrittersShelfPack], facts.completedAt);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.application.rewardedObjectIds).toEqual(["crochet-yarn-basket"]);
    const duplicate = receiveGameEvent(first.application.state, campaignEvents[0], [CozyCrochetCrittersShelfPack], facts.completedAt);
    expect(duplicate.ok).toBe(true);
    if (!duplicate.ok) return;
    expect(duplicate.application.duplicate).toBe(true);
    expect(duplicate.application.state.inventory.filter((item) => item.objectId === "crochet-yarn-basket")[0]?.count).toBe(1);

    const wrongDiscovery = receiveGameEvent(initial, {
      schemaVersion: 1 as const,
      eventId: "cozy-crochet-critters:discovery:not-the-yarn-nest",
      type: "discovery.triggered" as const,
      gameId: "cozy-crochet-critters",
      discoveryId: "not-the-yarn-nest",
      occurredAt: facts.completedAt
    }, [CozyCrochetCrittersShelfPack], facts.completedAt);
    expect(wrongDiscovery.ok).toBe(true);
    if (!wrongDiscovery.ok) return;
    expect(wrongDiscovery.application.rewardedObjectIds).toEqual([]);

    const discovery = campaignEvents.find((event) => event.type === "discovery.triggered");
    expect(discovery).toBeDefined();
    if (!discovery) return;
    const matchingDiscovery = receiveGameEvent(initial, discovery, [CozyCrochetCrittersShelfPack], facts.completedAt);
    expect(matchingDiscovery.ok).toBe(true);
    if (!matchingDiscovery.ok) return;
    expect(matchingDiscovery.application.rewardedObjectIds).toEqual(["unauthorized-yarn-nest"]);
  });

  it("restores an exact in-progress puzzle through the shared save package", async () => {
    const level = CAMPAIGN_LEVELS[1];
    const first = executeRouteCommand(level, createInitialPuzzleState(level), createCommandHistory(), level.solutionTrace[0]);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const schema = z.object({
      version: z.literal(1),
      levelId: z.string(),
      state: z.unknown(),
      undoDepth: z.number()
    });
    const session = { version: 1 as const, levelId: level.id, state: first.state, undoDepth: first.history.undo.length };
    const storage = new GameSessionStorage("cozy-crochet-critters", schema, dbName());
    await storage.save(session, "2026-07-19T12:00:00.000Z");
    expect(await storage.load()).toEqual(session);
  });
});
