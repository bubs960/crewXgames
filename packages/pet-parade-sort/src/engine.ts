import {
  cloneParadeState,
  createInitialParadeState,
  postById,
  tagById,
  visibleVariant,
  type CollarOrder,
  type MoveCommand,
  type MoveTransition,
  type MoveValidation,
  type ParadeState,
  type PetParadeLevel,
  type TagDefinition,
  type TagOwner
} from "./model";

export const occupiedUnits = (level: PetParadeLevel, tagIds: string[]) =>
  tagIds.reduce((sum, id) => sum + (tagById(level, id)?.size ?? 0), 0);

export const isPostLocked = (level: PetParadeLevel, state: ParadeState, postId: string) => {
  const post = postById(level, postId);
  return Boolean(post?.lockedByOrderId && !state.completedOrderIds.includes(post.lockedByOrderId));
};

export const isPostInspected = (state: ParadeState, postId: string) =>
  state.activeInspection?.postId === postId && state.activeInspection.remainingMoves > 0;

export const isPostBlocked = (level: PetParadeLevel, state: ParadeState, postId: string) =>
  isPostLocked(level, state, postId) || isPostInspected(state, postId);

const topOwner = (level: PetParadeLevel, stack: string[]): TagOwner | undefined => {
  const top = stack.at(-1);
  return top ? tagById(level, top)?.owner : undefined;
};

const selectedSuffix = (stack: string[], count: number) => stack.slice(Math.max(0, stack.length - count));

const doesNotSplitLinkedGroup = (level: PetParadeLevel, stack: string[], count: number) => {
  const selected = new Set(selectedSuffix(stack, count));
  const groups = new Set(
    [...selected]
      .map((tagId) => tagById(level, tagId)?.linkedGroup)
      .filter((group): group is string => Boolean(group))
  );
  for (const group of groups) {
    const groupIds = level.tags.filter((tag) => tag.linkedGroup === group).map((tag) => tag.id);
    if (groupIds.some((tagId) => !selected.has(tagId))) return false;
  }
  return true;
};

export const accessibleRunCounts = (level: PetParadeLevel, state: ParadeState, postId: string) => {
  if (isPostBlocked(level, state, postId)) return [];
  const stack = state.stacks[postId] ?? [];
  const owner = topOwner(level, stack);
  if (!owner) return [];
  let contiguous = 0;
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (tagById(level, stack[index])?.owner !== owner) break;
    contiguous += 1;
  }
  const counts: number[] = [];
  for (let count = 1; count <= contiguous; count += 1) {
    if (doesNotSplitLinkedGroup(level, stack, count)) counts.push(count);
  }
  return counts;
};

const destinationAccepts = (level: PetParadeLevel, state: ParadeState, command: MoveCommand) => {
  const source = state.stacks[command.from] ?? [];
  const destination = state.stacks[command.to] ?? [];
  const moved = selectedSuffix(source, command.count);
  const owner = moved.length ? tagById(level, moved[0])?.owner : undefined;
  const post = postById(level, command.to);
  if (!owner || !post) return false;
  if (post.kind === "foster" && post.acceptsOwners && !post.acceptsOwners.includes(owner)) return false;
  const destinationOwner = topOwner(level, destination);
  return !destinationOwner || destinationOwner === owner;
};

export const validateMove = (
  level: PetParadeLevel,
  state: ParadeState,
  command: MoveCommand
): MoveValidation => {
  if (state.status === "complete") return { valid: false, reason: "The park photo is already complete." };
  if (command.from === command.to) return { valid: false, reason: "Choose a different collar post." };
  const sourcePost = postById(level, command.from);
  const destinationPost = postById(level, command.to);
  if (!sourcePost || !destinationPost) return { valid: false, reason: "That collar post is not on this board." };
  if (isPostLocked(level, state, command.from) || isPostLocked(level, state, command.to)) {
    return { valid: false, reason: "That buckle post is still locked. Complete its neighboring collar first." };
  }
  if (isPostInspected(state, command.from) || isPostInspected(state, command.to)) {
    return { valid: false, reason: "The Shelf cat is inspecting that post. The move counter shows when it will reopen." };
  }
  const source = state.stacks[command.from] ?? [];
  if (!source.length) return { valid: false, reason: "That post has no accessible tag." };
  if (!Number.isInteger(command.count) || command.count < 1 || !accessibleRunCounts(level, state, command.from).includes(command.count)) {
    return { valid: false, reason: "Only the top matching run can move, and linked charms stay together." };
  }
  if (!destinationAccepts(level, state, command)) {
    const destination = state.stacks[command.to] ?? [];
    const post = postById(level, command.to)!;
    return {
      valid: false,
      reason: post.kind === "foster" && destination.length === 0
        ? "That foster hook is reserved for the owner symbols printed beside it."
        : "Tags can land only on an empty post or the same visible owner family."
    };
  }
  const moved = selectedSuffix(source, command.count);
  const destination = state.stacks[command.to] ?? [];
  if (occupiedUnits(level, destination) + occupiedUnits(level, moved) > destinationPost.capacity) {
    return { valid: false, reason: "That post does not have enough visible capacity. Bell charms use two spaces." };
  }
  return { valid: true, command };
};

export const getLegalMoves = (level: PetParadeLevel, state: ParadeState): MoveCommand[] => {
  const moves: MoveCommand[] = [];
  for (const source of level.posts) {
    const counts = accessibleRunCounts(level, state, source.id);
    for (const destination of level.posts) {
      if (destination.id === source.id) continue;
      for (const count of counts) {
        const command = { from: source.id, to: destination.id, count };
        if (validateMove(level, state, command).valid) moves.push(command);
      }
    }
  }
  return moves;
};

export const preferredMove = (level: PetParadeLevel, state: ParadeState, from: string, to: string) => {
  const legal = accessibleRunCounts(level, state, from)
    .map((count) => ({ from, to, count }))
    .filter((command) => validateMove(level, state, command).valid)
    .sort((left, right) => right.count - left.count);
  return legal[0] ?? null;
};

const orderMatchesStack = (
  level: PetParadeLevel,
  state: ParadeState,
  order: CollarOrder,
  stack: string[]
) => {
  if (stack.length !== order.tagIds.length) return false;
  if (new Set(stack).size !== stack.length) return false;
  const required = new Set(order.tagIds);
  if (stack.some((tagId) => !required.has(tagId))) return false;
  if (stack.some((tagId) => tagById(level, tagId)?.owner !== order.owner)) return false;
  if (order.pattern) {
    const variants = stack.map((tagId) => visibleVariant(level, state, tagId));
    if (variants.some((variant, index) => variant !== order.pattern![index])) return false;
  }
  return true;
};

const nextPriority = (level: PetParadeLevel, state: ParadeState) => {
  const priorities = level.orders
    .filter((order) => !state.completedOrderIds.includes(order.id) && order.priority !== undefined)
    .map((order) => order.priority!);
  return priorities.length ? Math.min(...priorities) : undefined;
};

const orderCanLeave = (level: PetParadeLevel, state: ParadeState, order: CollarOrder) => {
  const priority = nextPriority(level, state);
  if (priority === undefined) return true;
  return order.priority === priority;
};

const resolveCompletedCollars = (level: PetParadeLevel, state: ParadeState) => {
  const completed: string[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const post of level.posts) {
      if (post.kind === "foster" || isPostLocked(level, state, post.id)) continue;
      const stack = state.stacks[post.id] ?? [];
      const order = level.orders.find((candidate) =>
        !state.completedOrderIds.includes(candidate.id) &&
        orderMatchesStack(level, state, candidate, stack) &&
        orderCanLeave(level, state, candidate)
      );
      if (!order) continue;
      state.stacks[post.id] = [];
      state.completedOrderIds.push(order.id);
      state.arrivedPetIds.push(order.owner);
      completed.push(order.id);
      changed = true;
      break;
    }
  }
  if (state.completedOrderIds.length === level.orders.length) state.status = "complete";
  return completed;
};

const tickInspection = (level: PetParadeLevel, state: ParadeState) => {
  let inspectionEnded = false;
  if (state.activeInspection) {
    state.activeInspection.remainingMoves -= 1;
    if (state.activeInspection.remainingMoves <= 0) {
      delete state.activeInspection;
      inspectionEnded = true;
    }
  }
  let inspectionStarted;
  const event = level.inspectionSchedule[state.nextInspectionIndex];
  if (!state.activeInspection && event && event.afterMove <= state.moves) {
    inspectionStarted = {
      postId: event.postId,
      remainingMoves: event.duration,
      startedAfterMove: event.afterMove
    };
    state.activeInspection = inspectionStarted;
    state.nextInspectionIndex += 1;
  }
  return { inspectionStarted, inspectionEnded };
};

export const applyMove = (
  level: PetParadeLevel,
  current: ParadeState,
  command: MoveCommand
): MoveTransition => {
  const validation = validateMove(level, current, command);
  if (!validation.valid) throw new Error(validation.reason ?? "Illegal Pet Parade move.");
  const state = cloneParadeState(current);
  const source = state.stacks[command.from];
  const movedTagIds = source.splice(source.length - command.count, command.count);
  state.stacks[command.to].push(...movedTagIds);
  for (const tagId of movedTagIds) {
    const tag = tagById(level, tagId);
    if (tag?.doubleSided) state.orientations[tagId] = !state.orientations[tagId];
  }
  state.moves += 1;
  const inspection = tickInspection(level, state);
  const beforeCompleted = new Set(state.completedOrderIds);
  const beforeUnlocked = new Set(level.posts.filter((post) => !isPostLocked(level, current, post.id)).map((post) => post.id));
  const completedOrderIds = resolveCompletedCollars(level, state);
  const unlockedPostIds = level.posts
    .filter((post) => !beforeUnlocked.has(post.id) && !isPostLocked(level, state, post.id))
    .map((post) => post.id);
  if (completedOrderIds.some((id) => beforeCompleted.has(id))) throw new Error("A collar completion was applied twice.");
  return {
    state,
    command,
    movedTagIds,
    completedOrderIds,
    unlockedPostIds,
    inspectionStarted: inspection.inspectionStarted,
    inspectionEnded: inspection.inspectionEnded
  };
};

export const isDeadState = (level: PetParadeLevel, state: ParadeState) =>
  state.status !== "complete" && getLegalMoves(level, state).length === 0;

export const nextInspectionPreview = (level: PetParadeLevel, state: ParadeState) => {
  if (state.activeInspection) {
    return { active: true as const, postId: state.activeInspection.postId, moves: state.activeInspection.remainingMoves };
  }
  const next = level.inspectionSchedule[state.nextInspectionIndex];
  return next ? { active: false as const, postId: next.postId, moves: Math.max(0, next.afterMove - state.moves) } : null;
};

export const describePost = (level: PetParadeLevel, state: ParadeState, postId: string) => {
  const post = postById(level, postId);
  if (!post) return "Unknown collar post.";
  const stack = state.stacks[postId] ?? [];
  const contents = stack.length
    ? stack.map((tagId) => {
        const tag = tagById(level, tagId)!;
        return `${tag.owner} ${visibleVariant(level, state, tagId)}${tag.size === 2 ? " oversized bell" : " tag"}${tag.linkedGroup ? " linked" : ""}`;
      }).join(", ")
    : "empty";
  const stateLabel = isPostLocked(level, state, postId)
    ? " Locked."
    : isPostInspected(state, postId)
      ? ` Cat inspection for ${state.activeInspection!.remainingMoves} more move${state.activeInspection!.remainingMoves === 1 ? "" : "s"}.`
      : "";
  const foster = post.kind === "foster" ? ` Foster hook accepts ${(post.acceptsOwners ?? []).join(" and ")}.` : "";
  return `${post.label}, capacity ${post.capacity}, ${occupiedUnits(level, stack)} spaces used. Bottom to top: ${contents}.${stateLabel}${foster}`;
};

export const describeBoard = (level: PetParadeLevel, state: ParadeState) =>
  `${level.title}. ${state.completedOrderIds.length} of ${level.orders.length} collars complete. ${state.moves} moves. ` +
  level.posts.map((post) => describePost(level, state, post.id)).join(" ");

export const requiredTagUnits = (tags: TagDefinition[]) => tags.reduce((sum, tag) => sum + tag.size, 0);

export const completionOrderForTrace = (level: PetParadeLevel, trace: MoveCommand[]) => {
  let state = createInitialParadeState(level);
  const order: string[] = [];
  for (const command of trace) {
    const transition = applyMove(level, state, command);
    order.push(...transition.completedOrderIds);
    state = transition.state;
  }
  return { state, order };
};
