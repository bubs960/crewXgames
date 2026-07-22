import { commitRoute } from "./engine";
import { CAMPAIGN_LEVELS } from "./content";
import { createInitialPuzzleState, type CrochetLevel, type YarnColor } from "./model";
import { solveSmallBoard } from "./solver";

const palette: YarnColor[] = ["coral", "teal", "gold", "leaf", "ink"];

const seeded = (seed: number) => {
  let value = seed | 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let mixed = Math.imul(value ^ (value >>> 15), 1 | value);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};

const remapColor = (color: YarnColor, shift: number) => palette[(palette.indexOf(color) + shift) % palette.length];

const buildSolvedState = (level: CrochetLevel) => {
  let state = createInitialPuzzleState(level);
  for (const route of level.solutionTrace) {
    const result = commitRoute(level, state, route);
    if (!result.ok) throw new Error("Daily source trace failed: " + result.reason);
    state = result.state;
  }
  return state;
};

const reverseSolvedState = (level: CrochetLevel, solved: ReturnType<typeof buildSolvedState>) => {
  const reversed = structuredClone(solved);
  for (let index = reversed.routes.length - 1; index >= 0; index -= 1) {
    const route = reversed.routes[index];
    reversed.spoolRemaining[route.spoolId] += route.length;
  }
  reversed.routes = [];
  reversed.currentObjectiveIndex = 0;
  reversed.moves = 0;
  reversed.undosUsed = 0;
  reversed.status = "playing";
  if (JSON.stringify(reversed) !== JSON.stringify(createInitialPuzzleState(level))) {
    throw new Error("Backward daily generation did not return to the exact solved-state origin.");
  }
  return reversed;
};

export const generateDailyCandidate = (seed: number): CrochetLevel => {
  const random = seeded(seed);
  const source = CAMPAIGN_LEVELS[Math.floor(random() * CAMPAIGN_LEVELS.length)];
  const shift = Math.floor(random() * palette.length);
  const recolored = structuredClone(source);
  recolored.id = "ccc-daily-" + Math.abs(seed);
  recolored.title = "Daily Hoop " + Math.abs(seed);
  recolored.mode = "daily";
  recolored.chapter = "Daily Hoop";
  recolored.chapterNumber = 0;
  recolored.generatedFrom = source.id;
  recolored.generationMethod = "backward-from-solved-state";
  recolored.spools = recolored.spools.map((spool) => {
    const color = remapColor(spool.color, shift);
    return {
      ...spool,
      color,
      accessibleLabel: color[0].toUpperCase() + color.slice(1) + " spool, " + color + " yarn, with visible remaining length."
    };
  });
  recolored.nodes = recolored.nodes.map((node) => {
    if (!node.color) return node;
    const color = remapColor(node.color, shift);
    return {
      ...node,
      color,
      label: color[0].toUpperCase() + color.slice(1) + " spool",
      symbol: color[0].toUpperCase()
    };
  });
  recolored.objectives = recolored.objectives.map((objective) => ({ ...objective, color: remapColor(objective.color, shift) }));
  const solved = buildSolvedState(recolored);
  recolored.initialState = reverseSolvedState(recolored, solved);
  const verification = solveSmallBoard(recolored);
  if (!verification.solvable) throw new Error("Daily seed " + seed + " was rejected: " + verification.reason);
  recolored.solverMetadata = {
    ...recolored.solverMetadata,
    branchCount: verification.branchCount,
    solutionLength: verification.solutionLength,
    mechanicTags: [...new Set([...recolored.solverMetadata.mechanicTags, "daily", "backward-generated"])]
  };
  return recolored;
};

export const dailySeedFromDate = (date: string) => Number(date.replaceAll("-", ""));

export const verifyDailySeeds = (count: number, offset = 0) => {
  for (let index = 0; index < count; index += 1) {
    const candidate = generateDailyCandidate(index + offset);
    const solver = solveSmallBoard(candidate);
    if (!solver.solvable) return { valid: false, seed: index + offset, reason: solver.reason };
  }
  return { valid: true as const, checked: count };
};
