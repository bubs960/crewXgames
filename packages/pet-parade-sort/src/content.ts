import { applyMove, occupiedUnits } from "./engine";
import {
  OWNER_PRESENTATION,
  TAG_OWNERS,
  createInitialParadeState,
  type MechanicTag,
  type MoveCommand,
  type PetParadeLevel,
  type PostDefinition,
  type TagDefinition,
  type TagOwner
} from "./model";

interface CuratedLevelConfig {
  id: string;
  title: string;
  mode: "tutorial" | "campaign" | "expert";
  chapter: string;
  chapterNumber: number;
  setting: string;
  intro: string;
  seed: number;
  ownerCount: number;
  reverseSteps: number;
  mechanics: MechanicTag[];
  workCaps?: number[];
  curationNote: string;
  tutorialBeat?: string;
}

const PET_NAMES: Record<TagOwner, string[]> = {
  cat: ["Miso", "Juniper", "Clove", "Pip"],
  dog: ["Scout", "Maple", "Otis", "Birdie"],
  rabbit: ["Ledger", "Fern", "Mochi", "Hazel"],
  fox: ["Copper", "Saffron", "Kit", "Ember"],
  hamster: ["Widget", "Peanut", "Biscuit", "Dot"],
  parrot: ["Echo", "Pepper", "Iris", "Cricket"]
};

const createRandom = (seed: number) => {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
};

const mechanic = (config: CuratedLevelConfig, id: MechanicTag) => config.mechanics.includes(id);

const createTagsAndOrders = (config: CuratedLevelConfig, owners: TagOwner[]) => {
  const tags: TagDefinition[] = [];
  const orders: PetParadeLevel["orders"] = [];
  owners.forEach((owner, ownerIndex) => {
    const variants = mechanic(config, "oversized-bell") && ownerIndex % 2 === 0
      ? ["bell", "nameplate", "stripe"]
      : ["nameplate", "stripe", "star", "seal"];
    const ownerTags = variants.map((variant, index): TagDefinition => ({
      id: `${config.id}:${owner}:${index + 1}`,
      owner,
      variant,
      reverseVariant: mechanic(config, "double-sided") && index === 1 ? `${variant}-reverse` : undefined,
      size: variant === "bell" ? 2 : 1,
      material: variant === "bell" ? "bell" : index % 3 === 1 ? "brass" : index % 3 === 2 ? "steel" : "enamel",
      doubleSided: mechanic(config, "double-sided") && index === 1,
      symbol: OWNER_PRESENTATION[owner].symbol,
      edge: OWNER_PRESENTATION[owner].edge
    }));
    if (mechanic(config, "linked-pair") && ownerIndex === 0) {
      const linked = ownerTags.slice(-2);
      for (const tag of linked) tag.linkedGroup = `${config.id}:${owner}:linked`;
    }
    tags.push(...ownerTags);
    orders.push({
      id: `${config.id}:order:${owner}`,
      owner,
      petName: PET_NAMES[owner][ownerIndex % PET_NAMES[owner].length],
      label: `${OWNER_PRESENTATION[owner].label} rescue card`,
      tagIds: ownerTags.map((tag) => tag.id),
      pattern: mechanic(config, "pattern-collar") ? ownerTags.map((tag) => tag.variant) : undefined,
      collarStyle: ["woven coral", "park teal", "brass check", "berry stripe", "leaf stitch", "ink ribbon"][ownerIndex]
    });
  });
  return { tags, orders };
};

const topBundle = (tags: TagDefinition[], stack: string[]) => {
  const topId = stack.at(-1);
  if (!topId) return [];
  const top = tags.find((tag) => tag.id === topId)!;
  if (!top.linkedGroup) return [topId];
  const ids: string[] = [];
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const tag = tags.find((candidate) => candidate.id === stack[index])!;
    if (tag.linkedGroup !== top.linkedGroup) break;
    ids.unshift(tag.id);
  }
  return ids;
};

const reverseScramble = (
  config: CuratedLevelConfig,
  posts: PostDefinition[],
  activePostIds: string[],
  tags: TagDefinition[],
  solvedStacks: Record<string, string[]>,
  ownerPostIds: string[],
  workPostIds: string[]
) => {
  const random = createRandom(config.seed);
  const stacks = structuredClone(solvedStacks);
  const operations: { source: string; target: string; tagIds: string[] }[] = [];
  const seen = new Set<string>();
  const signature = () => activePostIds.map((postId) => stacks[postId].join(",")).join("|");
  seen.add(signature());

  const canReverseMove = (source: string, target: string) => {
    const bundle = topBundle(tags, stacks[source]);
    if (!bundle.length) return null;
    const remaining = stacks[source].slice(0, -bundle.length);
    const movedOwner = tags.find((tag) => tag.id === bundle[0])!.owner;
    const remainingOwner = remaining.length ? tags.find((tag) => tag.id === remaining.at(-1))!.owner : undefined;
    if (remainingOwner && remainingOwner !== movedOwner) return null;
    const post = posts.find((candidate) => candidate.id === target)!;
    if (occupiedUnits({ tags } as PetParadeLevel, stacks[target]) + occupiedUnits({ tags } as PetParadeLevel, bundle) > post.capacity) return null;
    return bundle;
  };

  const commit = (source: string, target: string, tagIds: string[]) => {
    stacks[source].splice(stacks[source].length - tagIds.length, tagIds.length);
    stacks[target].push(...tagIds);
    operations.push({ source, target, tagIds });
    seen.add(signature());
  };

  const first = canReverseMove(ownerPostIds[0], workPostIds[0]);
  if (!first) throw new Error(`Could not start curated scramble ${config.id}.`);
  commit(ownerPostIds[0], workPostIds[0], first);
  for (let index = 1; index < ownerPostIds.length; index += 1) {
    const bundle = canReverseMove(ownerPostIds[index], ownerPostIds[index - 1]);
    if (!bundle) throw new Error(`Could not build owner chain for ${config.id}.`);
    commit(ownerPostIds[index], ownerPostIds[index - 1], bundle);
  }

  let attempts = 0;
  while (operations.length < config.reverseSteps && attempts < config.reverseSteps * 120) {
    attempts += 1;
    const candidates: { source: string; target: string; tagIds: string[]; score: number }[] = [];
    for (const source of activePostIds) {
      for (const target of activePostIds) {
        if (source === target) continue;
        const bundle = canReverseMove(source, target);
        if (!bundle) continue;
        if (source.includes(":work:") && stacks[source].length === bundle.length && stacks[target].length > 0) continue;
        const previous = operations.at(-1);
        if (previous?.source === target && previous.target === source && previous.tagIds.length === bundle.length) continue;
        const sourceAfter = stacks[source].slice(0, -bundle.length);
        const targetAfter = [...stacks[target], ...bundle];
        const candidateSignature = activePostIds.map((postId) => {
          if (postId === source) return sourceAfter.join(",");
          if (postId === target) return targetAfter.join(",");
          return stacks[postId].join(",");
        }).join("|");
        if (seen.has(candidateSignature)) continue;
        const sourceTop = tags.find((tag) => tag.id === bundle[0])!.owner;
        const targetTopId = stacks[target].at(-1);
        const targetTop = targetTopId ? tags.find((tag) => tag.id === targetTopId)!.owner : undefined;
        const score = targetTop && targetTop !== sourceTop ? 4 : targetTop === sourceTop ? 1 : 2;
        candidates.push({ source, target, tagIds: bundle, score });
      }
    }
    if (!candidates.length) break;
    candidates.sort((left, right) => right.score - left.score || `${left.source}:${left.target}`.localeCompare(`${right.source}:${right.target}`));
    const weighted = candidates.filter((candidate) => candidate.score >= candidates[0].score - 1);
    const candidate = weighted[Math.floor(random() * weighted.length)];
    stacks[candidate.source].splice(stacks[candidate.source].length - candidate.tagIds.length, candidate.tagIds.length);
    stacks[candidate.target].push(...candidate.tagIds);
    const after = signature();
    operations.push(candidate);
    seen.add(after);
  }

  return {
    stacks,
    solutionTrace: operations
      .slice()
      .reverse()
      .map((operation): MoveCommand => ({ from: operation.target, to: operation.source, count: operation.tagIds.length }))
  };
};

const safeInspection = (level: PetParadeLevel) => {
  const duration = level.mode === "expert" ? 2 : 1;
  const afterMove = Math.max(2, Math.floor(level.solutionTrace.length * 0.38));
  const upcoming = level.solutionTrace.slice(afterMove, afterMove + duration);
  const candidate = level.posts.find((post) =>
    !post.lockedByOrderId && upcoming.every((move) => move.from !== post.id && move.to !== post.id)
  );
  return candidate ? [{ afterMove, postId: candidate.id, duration }] : [];
};

const createCuratedLevel = (config: CuratedLevelConfig): PetParadeLevel => {
  const owners = TAG_OWNERS.slice(0, config.ownerCount) as TagOwner[];
  const { tags, orders } = createTagsAndOrders(config, owners);
  const ownerPosts: PostDefinition[] = owners.map((owner, index) => ({
    id: `${config.id}:post:${index + 1}`,
    label: `${OWNER_PRESENTATION[owner].label} collar post ${index + 1}`,
    capacity: 4,
    kind: "standard"
  }));
  const workCaps = config.workCaps ?? [4, 4];
  const workPosts: PostDefinition[] = workCaps.map((capacity, index) => ({
    id: `${config.id}:work:${index + 1}`,
    label: `Sorting post ${index + 1}`,
    capacity,
    kind: "standard"
  }));
  const reservedPosts: PostDefinition[] = [];
  if (mechanic(config, "locked-buckle")) {
    reservedPosts.push({
      id: `${config.id}:buckle`,
      label: "Adjacent buckle post",
      capacity: 4,
      kind: "buckle",
      lockedByOrderId: orders[0].id
    });
  }
  if (mechanic(config, "foster-hook")) {
    reservedPosts.push({
      id: `${config.id}:foster`,
      label: "Temporary foster hook",
      capacity: 3,
      kind: "foster",
      acceptsOwners: owners.slice(0, 2)
    });
  }
  const posts = [...ownerPosts, ...workPosts, ...reservedPosts];
  const solvedStacks = Object.fromEntries(posts.map((post) => [post.id, [] as string[]]));
  ownerPosts.forEach((post, index) => { solvedStacks[post.id] = [...orders[index].tagIds]; });
  const activePostIds = [...ownerPosts, ...workPosts].map((post) => post.id);
  const scrambled = reverseScramble(
    config,
    posts,
    activePostIds,
    tags,
    solvedStacks,
    ownerPosts.map((post) => post.id),
    workPosts.map((post) => post.id)
  );

  const orientationProbe: PetParadeLevel = {
    id: config.id,
    title: config.title,
    mode: config.mode,
    chapter: config.chapter,
    chapterNumber: config.chapterNumber,
    setting: config.setting,
    intro: config.intro,
    mechanics: config.mechanics,
    posts,
    tags,
    orders: orders.map((order) => ({ ...order, pattern: undefined, priority: undefined })),
    initialStacks: scrambled.stacks,
    initialOrientations: {},
    inspectionSchedule: [],
    solutionTrace: scrambled.solutionTrace,
    parMoves: scrambled.solutionTrace.length,
    medalThresholds: [scrambled.solutionTrace.length + 8, scrambled.solutionTrace.length + 4, scrambled.solutionTrace.length],
    curationNote: config.curationNote,
    tutorialBeat: config.tutorialBeat
  };

  const movedCounts = new Map<string, number>();
  let probeState = createInitialParadeState(orientationProbe);
  const completionOrder: string[] = [];
  for (const command of scrambled.solutionTrace) {
    const transition = applyMove(orientationProbe, probeState, command);
    for (const tagId of transition.movedTagIds) movedCounts.set(tagId, (movedCounts.get(tagId) ?? 0) + 1);
    completionOrder.push(...transition.completedOrderIds);
    probeState = transition.state;
  }
  if (probeState.status !== "complete") throw new Error(`Curated trace did not complete ${config.id}.`);

  const initialOrientations = Object.fromEntries(
    tags.filter((tag) => tag.doubleSided).map((tag) => [tag.id, (movedCounts.get(tag.id) ?? 0) % 2 === 1])
  );
  if (mechanic(config, "priority-card")) {
    const rank = new Map(completionOrder.map((orderId, index) => [orderId, index + 1]));
    for (const order of orders) order.priority = rank.get(order.id) ?? completionOrder.length + 1;
  }

  const level: PetParadeLevel = {
    ...orientationProbe,
    orders,
    initialOrientations,
    parMoves: scrambled.solutionTrace.length,
    medalThresholds: [scrambled.solutionTrace.length + 8, scrambled.solutionTrace.length + 4, scrambled.solutionTrace.length]
  };
  if (mechanic(config, "cat-inspection")) level.inspectionSchedule = safeInspection(level);

  let finalState = createInitialParadeState(level);
  for (const [index, command] of level.solutionTrace.entries()) {
    try {
      finalState = applyMove(level, finalState, command).state;
    } catch (error) {
      throw new Error(`${config.id} failed its curated trace at move ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (finalState.status !== "complete") throw new Error(`Final curated rules did not complete ${config.id}.`);
  return level;
};

const tutorialConfigs: CuratedLevelConfig[] = [
  { id: "pps-tutorial-01", title: "Miso's Missing Tag", mode: "tutorial", chapter: "Parade Practice", chapterNumber: 0, setting: "Sunlit intake desk", intro: "Miso left one cat tag on the sorting post. Put it back on the red cat collar.", seed: 1101, ownerCount: 1, reverseSteps: 1, mechanics: ["top-tag"], curationNote: "One-move cat opening that teaches source, destination, and automatic collar completion without a failure path.", tutorialBeat: "Tap the glowing cat tag, then the glowing red collar." },
  { id: "pps-tutorial-02", title: "Matching Run", mode: "tutorial", chapter: "Parade Practice", chapterNumber: 0, setting: "Grooming-room pegboard", intro: "Matching tags can travel as one tidy little argument.", seed: 1102, ownerCount: 3, reverseSteps: 3, mechanics: ["runs"], curationNote: "Introduces multi-tag runs with two generous work posts after the one-move lesson.", tutorialBeat: "A matching run moves together when the destination has room." },
  { id: "pps-tutorial-03", title: "Capacity Check", mode: "tutorial", chapter: "Parade Practice", chapterNumber: 0, setting: "Entryway organizer", intro: "Every post shows its capacity. The rabbit checked twice.", seed: 1103, ownerCount: 3, reverseSteps: 5, mechanics: ["runs", "variable-capacity"], workCaps: [3, 5], curationNote: "Teaches visible capacity using one short staging post and one generous tray.", tutorialBeat: "Count the space markers before moving a run." }
];

const chapterDefinitions = [
  {
    chapter: "Intake Desk",
    setting: "Sunlit rescue intake desk",
    mechanics: ["runs"] as MechanicTag[],
    titles: ["Morning Tags", "Scout Signs In", "Rabbit Paperwork", "Bench Negotiations", "Two Open Hooks", "Quiet Intake", "The Brass Tray", "Photo Call One"]
  },
  {
    chapter: "Grooming Room",
    setting: "Tiled grooming room with woven collar racks",
    mechanics: ["runs", "variable-capacity", "locked-buckle"] as MechanicTag[],
    titles: ["Short Post", "Long Rack", "Buckle Pending", "Adjacent Approval", "Towel Cart", "The Narrow Hook", "Groomer’s Ledger", "Buckle Chorus"]
  },
  {
    chapter: "Charm Workshop",
    setting: "Task-lit charm workshop",
    mechanics: ["runs", "double-sided", "linked-pair"] as MechanicTag[],
    titles: ["Turn Me Over", "Two Sides Visible", "Linked Charms", "Travel Together", "Brass and Enamel", "Flip Ledger", "Pair Inspection", "Workshop Close"]
  },
  {
    chapter: "Collar Studio",
    setting: "Pattern wall and collar assembly studio",
    mechanics: ["runs", "pattern-collar", "priority-card"] as MechanicTag[],
    titles: ["Stripe First", "Visible Pattern", "Priority Rabbit", "Order of Arrival", "The Fox Card", "Collar Sequence", "Three Notes", "Studio Lineup"]
  },
  {
    chapter: "Park Gate",
    setting: "Leafy park gate before the group photo",
    mechanics: ["runs", "oversized-bell", "foster-hook", "cat-inspection"] as MechanicTag[],
    titles: ["Big Bell", "Foster Hook", "Inspection Soon", "Known Obstruction", "Gate Roster", "Treat Diplomacy", "Formation Pending", "Park Photo"]
  }
];

const campaignConfigs: CuratedLevelConfig[] = chapterDefinitions.flatMap((chapter, chapterIndex) =>
  chapter.titles.map((title, levelIndex) => {
    const mechanics = chapter.mechanics.filter((_, mechanicIndex) => mechanicIndex <= Math.floor(levelIndex / 2) + (chapterIndex === 0 ? 0 : 1));
    const ownerCount = chapterIndex === 0 ? (levelIndex < 2 ? 3 : 4) : levelIndex < 3 ? 4 : 5;
    const workCaps = chapterIndex === 1
      ? (levelIndex % 2 ? [3, 5] : [4, 4])
      : chapterIndex === 4 && levelIndex % 3 === 0 ? [3, 4] : [4, 4];
    return {
      id: `pps-c${chapterIndex + 1}-${String(levelIndex + 1).padStart(2, "0")}`,
      title,
      mode: "campaign" as const,
      chapter: chapter.chapter,
      chapterNumber: chapterIndex + 1,
      setting: chapter.setting,
      intro: [
        "The intake board is public. So are the consequences.",
        "Buckle status is visible. Optimism remains optional.",
        "Every reverse face is printed on the tag edge.",
        "The collar pattern is posted where everyone can dispute it.",
        "Park photo in progress. The cat has scheduled an inspection."
      ][chapterIndex],
      seed: 2100 + chapterIndex * 100 + levelIndex * 17,
      ownerCount,
      reverseSteps: 8 + chapterIndex * 3 + levelIndex,
      mechanics,
      workCaps,
      curationNote: `Curated chapter ${chapterIndex + 1} board ${levelIndex + 1}; replayed from a known solved collar arrangement and reviewed for visible working space.`
    };
  })
);

const expertConfigs: CuratedLevelConfig[] = [
  ["pps-expert-01", "Buckle & Bell", ["runs", "variable-capacity", "locked-buckle", "oversized-bell"]],
  ["pps-expert-02", "Double Inspection", ["runs", "double-sided", "cat-inspection", "variable-capacity"]],
  ["pps-expert-03", "Linked Priority", ["runs", "linked-pair", "priority-card", "locked-buckle"]],
  ["pps-expert-04", "Pattern Foster", ["runs", "pattern-collar", "foster-hook", "variable-capacity"]],
  ["pps-expert-05", "Bell Pattern", ["runs", "oversized-bell", "pattern-collar", "priority-card"]],
  ["pps-expert-06", "Workshop Audit", ["runs", "double-sided", "linked-pair", "cat-inspection", "locked-buckle"]],
  ["pps-expert-07", "Rescue Card Stack", ["runs", "priority-card", "foster-hook", "oversized-bell"]],
  ["pps-expert-08", "Known Cat Problem", ["runs", "cat-inspection", "pattern-collar", "linked-pair", "variable-capacity"]],
  ["pps-expert-09", "Collar Committee", ["runs", "double-sided", "priority-card", "locked-buckle", "foster-hook"]],
  ["pps-expert-10", "The Collar Club", ["runs", "variable-capacity", "locked-buckle", "double-sided", "linked-pair", "pattern-collar", "priority-card", "cat-inspection"]]
].map(([id, title, mechanics], index): CuratedLevelConfig => ({
  id: id as string,
  title: title as string,
  mode: "expert",
  chapter: "After-Hours Collar Club",
  chapterNumber: 6,
  setting: "After-hours park pavilion",
  intro: "All notes are visible. None of them are brief.",
  seed: 8100 + index * 71,
  ownerCount: index < 2 ? 4 : 5,
  reverseSteps: 16 + index * 2,
  mechanics: mechanics as MechanicTag[],
  workCaps: index % 2 ? [4, 5, 5] : [5, 5, 4],
  curationNote: `Expert board ${index + 1}; mixed-mechanic trace retained as a legal upper bound and reviewed for at least two plausible opening branches.`
}));

export const tutorialLevels = tutorialConfigs.map(createCuratedLevel);
export const campaignLevels = campaignConfigs.map(createCuratedLevel);
export const expertLevels = expertConfigs.map(createCuratedLevel);
export const shippedLevels = [...tutorialLevels, ...campaignLevels, ...expertLevels];

export const levelById = (levelId: string) => shippedLevels.find((level) => level.id === levelId);

export const campaignChapters = chapterDefinitions.map((definition, index) => ({
  number: index + 1,
  title: definition.chapter,
  setting: definition.setting,
  levels: campaignLevels.filter((level) => level.chapterNumber === index + 1)
}));

export const chapterChallengeSource = (chapterNumber: number) =>
  campaignLevels.filter((level) => level.chapterNumber === chapterNumber).at(-1);
