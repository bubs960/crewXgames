import {
  channelAllows,
  clonePuzzleState,
  createInitialPuzzleState,
  distanceBetween,
  getChannel,
  getCurrentObjective,
  getNode,
  getSpool,
  type CrochetLevel,
  type GraphNode,
  type PuzzleState,
  type Route,
  type RouteValidation
} from "./model";

const EPSILON = 0.00001;

const orientation = (a: GraphNode, b: GraphNode, c: GraphNode) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

const segmentsCross = (a: GraphNode, b: GraphNode, c: GraphNode, d: GraphNode) => {
  if ([a.id, b.id].some((id) => id === c.id || id === d.id)) return false;
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  return (abC > EPSILON && abD < -EPSILON || abC < -EPSILON && abD > EPSILON) &&
    (cdA > EPSILON && cdB < -EPSILON || cdA < -EPSILON && cdB > EPSILON);
};

const routeSegmentsCross = (level: CrochetLevel, first: string[], second: string[]) => {
  for (let i = 0; i < first.length - 1; i += 1) {
    const a = getNode(level, first[i]);
    const b = getNode(level, first[i + 1]);
    if (!a || !b) continue;
    for (let j = 0; j < second.length - 1; j += 1) {
      const c = getNode(level, second[j]);
      const d = getNode(level, second[j + 1]);
      if (c && d && segmentsCross(a, b, c, d)) return true;
    }
  }
  return false;
};

const routeLength = (level: CrochetLevel, nodeIds: string[]) => {
  let length = 0;
  for (let index = 0; index < nodeIds.length - 1; index += 1) {
    const from = getNode(level, nodeIds[index]);
    const to = getNode(level, nodeIds[index + 1]);
    if (!from || !to) return Number.POSITIVE_INFINITY;
    length += distanceBetween(from, to);
  }
  return length;
};

export const validateRoute = (
  level: CrochetLevel,
  state: PuzzleState,
  nodeIds: string[]
): RouteValidation => {
  if (state.levelId !== level.id) {
    return { valid: false, reason: "This route belongs to a different pattern." };
  }
  if (state.status !== "playing") {
    return { valid: false, reason: "This pattern is already complete." };
  }
  const objective = getCurrentObjective(level, state);
  if (!objective) return { valid: false, reason: "This pattern is already complete." };
  if (nodeIds.length < 2) return { valid: false, reason: "Start at the visible spool and end at the required stitch." };
  if (new Set(nodeIds).size !== nodeIds.length) return { valid: false, reason: "A stitch route cannot loop back through the same point." };
  if (nodeIds[0] !== objective.spoolId) return { valid: false, reason: "Use the " + objective.color + " spool for the next stitch." };
  if (nodeIds.at(-1) !== objective.targetId) return { valid: false, reason: "Finish at " + objective.label + "." };

  const spool = getSpool(level, objective.spoolId);
  if (!spool || spool.color !== objective.color) return { valid: false, reason: "The next stitch has no compatible visible spool." };

  const channelIds: string[] = [];
  for (let index = 0; index < nodeIds.length; index += 1) {
    const node = getNode(level, nodeIds[index]);
    if (!node || node.visible === false) return { valid: false, reason: "Every required stitch point must remain visible." };
    if (index > 0 && index < nodeIds.length - 1 && (node.kind === "spool" || node.kind === "stitch")) {
      return { valid: false, reason: "Route through pins and hooks, not another spool or stitch." };
    }
    if (index === nodeIds.length - 1 && node.kind !== "stitch") {
      return { valid: false, reason: "The final point must be the required stitch." };
    }
    if (index === 0) continue;
    const channel = getChannel(level, nodeIds[index - 1], nodeIds[index]);
    if (!channel || !channelAllows(channel, nodeIds[index - 1], nodeIds[index])) {
      return { valid: false, reason: "Those points do not share an open stitch channel." };
    }
    const uses = state.routes.flatMap((route) => route.channelIds).filter((id) => id === channel.id).length;
    if (uses >= (channel.maxUses ?? 1)) {
      return { valid: false, reason: "That channel is already carrying a completed strand." };
    }
    channelIds.push(channel.id);
  }

  if (!objective.requiredVia.every((nodeId) => nodeIds.includes(nodeId))) {
    return { valid: false, reason: "This stitch needs the marked pin or hook before it can tighten." };
  }

  const length = routeLength(level, nodeIds);
  if (length > objective.maxLength + EPSILON) {
    return { valid: false, reason: "That route exceeds this stitch's visible tension limit." };
  }
  if ((state.spoolRemaining[spool.id] ?? 0) + EPSILON < length) {
    return { valid: false, reason: "The selected spool does not have enough yarn remaining for that route." };
  }

  for (const route of state.routes) {
    if (routeSegmentsCross(level, nodeIds, route.nodeIds)) {
      return { valid: false, reason: "That strand would cross an earlier stitch. Choose a clean channel." };
    }
  }
  if (routeSegmentsCross(level, nodeIds, nodeIds)) {
    return { valid: false, reason: "That route knots across itself." };
  }

  return {
    valid: true,
    route: {
      id: "route:" + objective.id,
      objectiveId: objective.id,
      spoolId: spool.id,
      color: objective.color,
      nodeIds: [...nodeIds],
      channelIds,
      length
    }
  };
};

export type RouteCommit =
  | { ok: true; state: PuzzleState; route: Route }
  | { ok: false; state: PuzzleState; reason: string };

export const commitRoute = (level: CrochetLevel, state: PuzzleState, nodeIds: string[]): RouteCommit => {
  const validation = validateRoute(level, state, nodeIds);
  if (!validation.valid || !validation.route) {
    return { ok: false, state, reason: validation.reason ?? "That route cannot be stitched." };
  }
  const next = clonePuzzleState(state);
  next.routes.push(validation.route);
  next.spoolRemaining[validation.route.spoolId] -= validation.route.length;
  next.currentObjectiveIndex += 1;
  next.moves += 1;
  if (next.currentObjectiveIndex >= level.objectives.length) next.status = "complete";
  return { ok: true, state: next, route: validation.route };
};

export const replayTrace = (level: CrochetLevel, trace: string[][]) => {
  let state: PuzzleState = createInitialPuzzleState(level);
  for (const route of trace) {
    const committed = commitRoute(level, state, route);
    if (!committed.ok) return { ok: false as const, state, reason: committed.reason };
    state = committed.state;
  }
  return { ok: state.status === "complete", state, reason: state.status === "complete" ? undefined : "The trace stopped before every stitch was complete." };
};
