import { replayTrace } from "./engine";
import { solveSmallBoard } from "./solver";
import type { Channel, CrochetLevel, GraphNode, PortraitId, SpoolDefinition, YarnColor } from "./model";

type LayoutName = "kitten-squares" | "puppy-patches" | "bunny-loops" | "remix-lab";

interface RouteRecipe {
  color: YarnColor;
  path: string[];
  label: string;
  requiredVia?: string[];
  tensionSlack?: number;
}

interface LevelRecipe {
  id: string;
  title: string;
  mode: "campaign" | "expert";
  chapter: string;
  chapterNumber: number;
  portrait: PortraitId;
  layout: LayoutName;
  routes: RouteRecipe[];
  tags: string[];
  tutorialBeat?: string;
  difficulty: number;
}

const node = (id: string, label: string, kind: GraphNode["kind"], x: number, y: number, symbol: string, color?: YarnColor): GraphNode => ({
  id, label, kind, x, y, symbol, color, visible: true
});

const channel = (from: string, to: string, label: string, oneWay = false): Channel => ({
  id: "channel:" + from + ":" + to,
  from,
  to,
  oneWay,
  maxUses: 1,
  label
});

const layout = (name: LayoutName) => {
  if (name === "kitten-squares") {
    return {
      nodes: [
        node("coral-spool", "Coral spool", "spool", 0.1, 0.2, "C", "coral"),
        node("teal-spool", "Teal spool", "spool", 0.1, 0.8, "T", "teal"),
        node("top-pin", "Top pin", "pin", 0.37, 0.2, "P"),
        node("bottom-pin", "Bottom pin", "pin", 0.37, 0.8, "P"),
        node("center-hook", "Center hook", "hook", 0.56, 0.5, "H"),
        node("ear-stitch", "Left ear stitch", "stitch", 0.88, 0.18, "1"),
        node("nose-stitch", "Nose stitch", "stitch", 0.88, 0.5, "2"),
        node("paw-stitch", "Paw stitch", "stitch", 0.88, 0.82, "3")
      ],
      channels: [
        channel("coral-spool", "top-pin", "Coral top channel"),
        channel("top-pin", "ear-stitch", "Ear channel"),
        channel("coral-spool", "center-hook", "Coral center channel"),
        channel("top-pin", "center-hook", "Top hook channel"),
        channel("center-hook", "nose-stitch", "Nose channel"),
        channel("teal-spool", "bottom-pin", "Teal bottom channel"),
        channel("bottom-pin", "paw-stitch", "Paw channel"),
        channel("teal-spool", "center-hook", "Teal center channel"),
        channel("bottom-pin", "center-hook", "Bottom hook channel"),
        channel("center-hook", "paw-stitch", "Hook paw channel")
      ]
    };
  }
  if (name === "puppy-patches") {
    return {
      nodes: [
        node("gold-spool", "Gold spool", "spool", 0.09, 0.2, "G", "gold"),
        node("leaf-spool", "Leaf spool", "spool", 0.09, 0.8, "L", "leaf"),
        node("left-pin", "Left patch pin", "pin", 0.29, 0.35, "P"),
        node("right-pin", "Right patch pin", "pin", 0.29, 0.68, "P"),
        node("arch-hook", "Arch hook", "hook", 0.56, 0.3, "H"),
        node("loop-hook", "Loop hook", "hook", 0.57, 0.7, "H"),
        node("ear-patch", "Puppy ear patch", "stitch", 0.88, 0.18, "1"),
        node("cheek-patch", "Puppy cheek patch", "stitch", 0.88, 0.5, "2"),
        node("tail-patch", "Puppy tail patch", "stitch", 0.88, 0.82, "3")
      ],
      channels: [
        channel("gold-spool", "left-pin", "Gold left channel"),
        channel("left-pin", "arch-hook", "Upper planning channel"),
        channel("arch-hook", "ear-patch", "Ear patch channel"),
        channel("gold-spool", "loop-hook", "Gold loop channel"),
        channel("loop-hook", "cheek-patch", "Cheek patch channel"),
        channel("leaf-spool", "right-pin", "Leaf right channel"),
        channel("right-pin", "loop-hook", "Lower planning channel"),
        channel("loop-hook", "tail-patch", "Tail patch channel"),
        channel("leaf-spool", "arch-hook", "Leaf arch channel"),
        channel("arch-hook", "cheek-patch", "Arch cheek channel"),
        channel("left-pin", "cheek-patch", "Short cheek channel")
      ]
    };
  }
  if (name === "bunny-loops") {
    return {
      nodes: [
        node("coral-spool", "Coral spool", "spool", 0.08, 0.15, "C", "coral"),
        node("ink-spool", "Ink spool", "spool", 0.08, 0.85, "I", "ink"),
        node("upper-pin", "Upper loop pin", "pin", 0.27, 0.18, "P"),
        node("lower-pin", "Lower loop pin", "pin", 0.27, 0.82, "P"),
        node("top-hook", "Top hook", "hook", 0.52, 0.22, "H"),
        node("middle-hook", "Middle hook", "hook", 0.52, 0.5, "H"),
        node("bottom-hook", "Bottom hook", "hook", 0.52, 0.78, "H"),
        node("ear-loop", "Bunny ear loop", "stitch", 0.9, 0.18, "1"),
        node("face-loop", "Bunny face loop", "stitch", 0.9, 0.5, "2"),
        node("foot-loop", "Bunny foot loop", "stitch", 0.9, 0.82, "3")
      ],
      channels: [
        channel("coral-spool", "upper-pin", "Coral upper channel"),
        channel("upper-pin", "top-hook", "Upper tension channel"),
        channel("top-hook", "ear-loop", "Ear loop channel"),
        channel("coral-spool", "middle-hook", "Coral middle channel"),
        channel("middle-hook", "face-loop", "Face loop channel"),
        channel("upper-pin", "middle-hook", "Upper middle detour"),
        channel("ink-spool", "lower-pin", "Ink lower channel"),
        channel("lower-pin", "bottom-hook", "Lower tension channel"),
        channel("bottom-hook", "foot-loop", "Foot loop channel"),
        channel("ink-spool", "middle-hook", "Ink middle channel"),
        channel("middle-hook", "bottom-hook", "Middle bottom detour"),
        channel("bottom-hook", "face-loop", "Bottom face detour")
      ]
    };
  }
  return {
    nodes: [
      node("coral-spool", "Coral spool", "spool", 0.08, 0.17, "C", "coral"),
      node("teal-spool", "Teal spool", "spool", 0.08, 0.82, "T", "teal"),
      node("gold-spool", "Gold spool", "spool", 0.08, 0.5, "G", "gold"),
      node("north-pin", "North pin", "pin", 0.3, 0.18, "P"),
      node("south-pin", "South pin", "pin", 0.3, 0.82, "P"),
      node("star-hook", "Star hook", "hook", 0.53, 0.34, "H"),
      node("moon-hook", "Moon hook", "hook", 0.53, 0.68, "H"),
      node("ear-stitch", "Remix ear stitch", "stitch", 0.9, 0.17, "1"),
      node("nose-stitch", "Remix nose stitch", "stitch", 0.9, 0.5, "2"),
      node("paw-stitch", "Remix paw stitch", "stitch", 0.9, 0.83, "3")
    ],
    channels: [
      channel("coral-spool", "north-pin", "Coral north channel"),
      channel("north-pin", "star-hook", "North star channel"),
      channel("star-hook", "ear-stitch", "Star ear channel"),
      channel("coral-spool", "moon-hook", "Coral moon channel"),
      channel("moon-hook", "nose-stitch", "Moon nose channel"),
      channel("teal-spool", "south-pin", "Teal south channel"),
      channel("south-pin", "moon-hook", "South moon channel"),
      channel("moon-hook", "paw-stitch", "Moon paw channel"),
      channel("gold-spool", "star-hook", "Gold star channel"),
      channel("star-hook", "nose-stitch", "Star nose channel"),
      channel("north-pin", "moon-hook", "North moon detour"),
      channel("south-pin", "star-hook", "South star detour")
    ]
  };
};

const pathLength = (nodes: GraphNode[], path: string[]) => path.slice(1).reduce((total, id, index) => {
  const from = nodes.find((candidate) => candidate.id === path[index])!;
  const to = nodes.find((candidate) => candidate.id === id)!;
  return total + Math.hypot(from.x - to.x, from.y - to.y);
}, 0);

const createSpools = (nodes: GraphNode[], routes: RouteRecipe[]): SpoolDefinition[] => {
  const requiredLength = new Map<string, number>();
  for (const route of routes) {
    requiredLength.set(route.path[0], (requiredLength.get(route.path[0]) ?? 0) + pathLength(nodes, route.path));
  }
  return nodes.filter((candidate) => candidate.kind === "spool").map((candidate) => ({
    id: candidate.id,
    color: candidate.color!,
    length: Math.round(((requiredLength.get(candidate.id) ?? 0) + 0.08) * 1000) / 1000,
    accessibleLabel: candidate.label + ", " + candidate.color + " yarn, with visible remaining length."
  }));
};

const recipes: LevelRecipe[] = [
  { id: "ccc-kitten-01", title: "First Square", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "coral", path: ["coral-spool", "top-pin", "ear-stitch"], label: "Ear stitch", requiredVia: ["top-pin"] }], tags: ["color-order", "simple-route"], tutorialBeat: "Meet Mallow. We will make one guided coral stitch together—first the spool, then the pin, then the ear.", difficulty: 1 },
  { id: "ccc-kitten-02", title: "Two Soft Corners", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "coral", path: ["coral-spool", "top-pin", "ear-stitch"], label: "Ear stitch", requiredVia: ["top-pin"] }, { color: "teal", path: ["teal-spool", "bottom-pin", "paw-stitch"], label: "Paw stitch", requiredVia: ["bottom-pin"] }], tags: ["color-order", "simple-route"], tutorialBeat: "Mallow needs two small repairs. Every new route starts at its matching spool; follow the highlighted yarn for each stitch.", difficulty: 2 },
  { id: "ccc-kitten-03", title: "Nose in Line", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "coral", path: ["coral-spool", "center-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["center-hook"] }, { color: "teal", path: ["teal-spool", "bottom-pin", "paw-stitch"], label: "Paw stitch", requiredVia: ["bottom-pin"] }], tags: ["color-order", "hook"], tutorialBeat: "One last practice: a hook bends the coral yarn toward Mallow's nose. Hardware is a route instruction, not decoration.", difficulty: 3 },
  { id: "ccc-kitten-04", title: "Three Square Face", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "coral", path: ["coral-spool", "top-pin", "ear-stitch"], label: "Ear stitch", requiredVia: ["top-pin"] }, { color: "coral", path: ["coral-spool", "center-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["center-hook"] }, { color: "teal", path: ["teal-spool", "bottom-pin", "paw-stitch"], label: "Paw stitch", requiredVia: ["bottom-pin"] }], tags: ["color-order", "shared-spool"], difficulty: 4 },
  { id: "ccc-kitten-05", title: "Hook Before Paw", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "coral", path: ["coral-spool", "center-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["center-hook"] }, { color: "coral", path: ["coral-spool", "top-pin", "ear-stitch"], label: "Ear stitch", requiredVia: ["top-pin"] }, { color: "teal", path: ["teal-spool", "bottom-pin", "paw-stitch"], label: "Paw stitch", requiredVia: ["bottom-pin"] }], tags: ["color-order", "shared-spool", "crossing"], difficulty: 5 },
  { id: "ccc-kitten-06", title: "Quiet Whiskers", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "teal", path: ["teal-spool", "bottom-pin", "paw-stitch"], label: "Paw stitch", requiredVia: ["bottom-pin"] }, { color: "coral", path: ["coral-spool", "top-pin", "ear-stitch"], label: "Ear stitch", requiredVia: ["top-pin"] }, { color: "coral", path: ["coral-spool", "center-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["center-hook"] }], tags: ["color-order", "crossing"], difficulty: 5 },
  { id: "ccc-kitten-07", title: "Square Cat Study", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "coral", path: ["coral-spool", "top-pin", "ear-stitch"], label: "Ear stitch", requiredVia: ["top-pin"] }, { color: "teal", path: ["teal-spool", "center-hook", "paw-stitch"], label: "Paw stitch", requiredVia: ["center-hook"] }], tags: ["color-order", "route-planning"], difficulty: 6 },
  { id: "ccc-kitten-08", title: "Kitten Wakes", mode: "campaign", chapter: "Kitten Squares", chapterNumber: 1, portrait: "kitten", layout: "kitten-squares", routes: [{ color: "coral", path: ["coral-spool", "top-pin", "ear-stitch"], label: "Ear stitch", requiredVia: ["top-pin"] }, { color: "teal", path: ["teal-spool", "bottom-pin", "paw-stitch"], label: "Paw stitch", requiredVia: ["bottom-pin"] }, { color: "coral", path: ["coral-spool", "center-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["center-hook"] }], tags: ["color-order", "portrait"], difficulty: 7 },
  { id: "ccc-puppy-01", title: "Patch Placement", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "gold", path: ["gold-spool", "left-pin", "arch-hook", "ear-patch"], label: "Ear patch", requiredVia: ["left-pin", "arch-hook"] }], tags: ["pins", "route-planning"], tutorialBeat: "Pins change the route; use the marked left pin before the arch hook.", difficulty: 8 },
  { id: "ccc-puppy-02", title: "Looped Cheek", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "gold", path: ["gold-spool", "loop-hook", "cheek-patch"], label: "Cheek patch", requiredVia: ["loop-hook"] }, { color: "leaf", path: ["leaf-spool", "right-pin", "loop-hook", "tail-patch"], label: "Tail patch", requiredVia: ["right-pin", "loop-hook"] }], tags: ["pins", "shared-junction"], difficulty: 9 },
  { id: "ccc-puppy-03", title: "Arch Choice", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "leaf", path: ["leaf-spool", "arch-hook", "cheek-patch"], label: "Cheek patch", requiredVia: ["arch-hook"] }, { color: "gold", path: ["gold-spool", "left-pin", "arch-hook", "ear-patch"], label: "Ear patch", requiredVia: ["left-pin", "arch-hook"] }], tags: ["pins", "route-planning", "crossing"], difficulty: 10 },
  { id: "ccc-puppy-04", title: "Tail First", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "leaf", path: ["leaf-spool", "right-pin", "loop-hook", "tail-patch"], label: "Tail patch", requiredVia: ["right-pin", "loop-hook"] }, { color: "gold", path: ["gold-spool", "left-pin", "arch-hook", "ear-patch"], label: "Ear patch", requiredVia: ["left-pin", "arch-hook"] }, { color: "gold", path: ["gold-spool", "loop-hook", "cheek-patch"], label: "Cheek patch", requiredVia: ["loop-hook"] }], tags: ["pins", "route-order"], difficulty: 11 },
  { id: "ccc-puppy-05", title: "Patchwork Route", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "gold", path: ["gold-spool", "left-pin", "arch-hook", "ear-patch"], label: "Ear patch", requiredVia: ["left-pin", "arch-hook"] }, { color: "leaf", path: ["leaf-spool", "right-pin", "loop-hook", "tail-patch"], label: "Tail patch", requiredVia: ["right-pin", "loop-hook"] }], tags: ["pins", "crossing", "route-planning"], difficulty: 12 },
  { id: "ccc-puppy-06", title: "Pocket of Gold", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "gold", path: ["gold-spool", "loop-hook", "cheek-patch"], label: "Cheek patch", requiredVia: ["loop-hook"] }, { color: "gold", path: ["gold-spool", "left-pin", "arch-hook", "ear-patch"], label: "Ear patch", requiredVia: ["left-pin", "arch-hook"] }], tags: ["pins", "limited-yarn"], difficulty: 12 },
  { id: "ccc-puppy-07", title: "Puppy Plan", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "leaf", path: ["leaf-spool", "arch-hook", "cheek-patch"], label: "Cheek patch", requiredVia: ["arch-hook"] }, { color: "leaf", path: ["leaf-spool", "right-pin", "loop-hook", "tail-patch"], label: "Tail patch", requiredVia: ["right-pin", "loop-hook"] }], tags: ["pins", "limited-yarn", "route-order"], difficulty: 13 },
  { id: "ccc-puppy-08", title: "Puppy Wakes", mode: "campaign", chapter: "Puppy Patches", chapterNumber: 2, portrait: "puppy", layout: "puppy-patches", routes: [{ color: "gold", path: ["gold-spool", "left-pin", "arch-hook", "ear-patch"], label: "Ear patch", requiredVia: ["left-pin", "arch-hook"] }, { color: "gold", path: ["gold-spool", "loop-hook", "cheek-patch"], label: "Cheek patch", requiredVia: ["loop-hook"] }, { color: "leaf", path: ["leaf-spool", "right-pin", "loop-hook", "tail-patch"], label: "Tail patch", requiredVia: ["right-pin", "loop-hook"] }], tags: ["pins", "portrait", "route-planning"], difficulty: 14 },
  { id: "ccc-bunny-01", title: "Long Ear", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "coral", path: ["coral-spool", "upper-pin", "top-hook", "ear-loop"], label: "Ear loop", requiredVia: ["upper-pin", "top-hook"], tensionSlack: 0.02 }], tags: ["tension", "limited-yarn"], tutorialBeat: "Keep an eye on the tension ruler: a scenic detour uses yarn you do not have.", difficulty: 15 },
  { id: "ccc-bunny-02", title: "Face Under Tension", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "coral", path: ["coral-spool", "middle-hook", "face-loop"], label: "Face loop", requiredVia: ["middle-hook"], tensionSlack: 0.02 }, { color: "ink", path: ["ink-spool", "lower-pin", "bottom-hook", "foot-loop"], label: "Foot loop", requiredVia: ["lower-pin", "bottom-hook"], tensionSlack: 0.02 }], tags: ["tension", "limited-yarn"], difficulty: 16 },
  { id: "ccc-bunny-03", title: "Upper Thread", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "coral", path: ["coral-spool", "upper-pin", "top-hook", "ear-loop"], label: "Ear loop", requiredVia: ["upper-pin", "top-hook"], tensionSlack: 0.01 }, { color: "coral", path: ["coral-spool", "middle-hook", "face-loop"], label: "Face loop", requiredVia: ["middle-hook"], tensionSlack: 0.01 }], tags: ["tension", "shared-spool"], difficulty: 17 },
  { id: "ccc-bunny-04", title: "Ink Loop", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "ink", path: ["ink-spool", "lower-pin", "bottom-hook", "foot-loop"], label: "Foot loop", requiredVia: ["lower-pin", "bottom-hook"], tensionSlack: 0.01 }, { color: "coral", path: ["coral-spool", "middle-hook", "face-loop"], label: "Face loop", requiredVia: ["middle-hook"], tensionSlack: 0.02 }], tags: ["tension", "crossing"], difficulty: 18 },
  { id: "ccc-bunny-05", title: "No Spare Yarn", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "coral", path: ["coral-spool", "upper-pin", "top-hook", "ear-loop"], label: "Ear loop", requiredVia: ["upper-pin", "top-hook"], tensionSlack: 0 }, { color: "coral", path: ["coral-spool", "middle-hook", "face-loop"], label: "Face loop", requiredVia: ["middle-hook"], tensionSlack: 0 }, { color: "ink", path: ["ink-spool", "lower-pin", "bottom-hook", "foot-loop"], label: "Foot loop", requiredVia: ["lower-pin", "bottom-hook"], tensionSlack: 0.01 }], tags: ["tension", "limited-yarn", "route-order"], difficulty: 19 },
  { id: "ccc-bunny-06", title: "Bunny Balance", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "ink", path: ["ink-spool", "lower-pin", "bottom-hook", "foot-loop"], label: "Foot loop", requiredVia: ["lower-pin", "bottom-hook"], tensionSlack: 0.02 }, { color: "coral", path: ["coral-spool", "upper-pin", "top-hook", "ear-loop"], label: "Ear loop", requiredVia: ["upper-pin", "top-hook"], tensionSlack: 0.02 }], tags: ["tension", "crossing", "limited-yarn"], difficulty: 20 },
  { id: "ccc-bunny-07", title: "Three Loops", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "coral", path: ["coral-spool", "middle-hook", "face-loop"], label: "Face loop", requiredVia: ["middle-hook"], tensionSlack: 0.01 }, { color: "ink", path: ["ink-spool", "lower-pin", "bottom-hook", "foot-loop"], label: "Foot loop", requiredVia: ["lower-pin", "bottom-hook"], tensionSlack: 0.01 }, { color: "coral", path: ["coral-spool", "upper-pin", "top-hook", "ear-loop"], label: "Ear loop", requiredVia: ["upper-pin", "top-hook"], tensionSlack: 0.01 }], tags: ["tension", "route-order", "crossing"], difficulty: 21 },
  { id: "ccc-bunny-08", title: "Bunny Wakes", mode: "campaign", chapter: "Bunny Loops", chapterNumber: 3, portrait: "bunny", layout: "bunny-loops", routes: [{ color: "coral", path: ["coral-spool", "upper-pin", "top-hook", "ear-loop"], label: "Ear loop", requiredVia: ["upper-pin", "top-hook"], tensionSlack: 0.01 }, { color: "coral", path: ["coral-spool", "middle-hook", "face-loop"], label: "Face loop", requiredVia: ["middle-hook"], tensionSlack: 0.01 }, { color: "ink", path: ["ink-spool", "lower-pin", "bottom-hook", "foot-loop"], label: "Foot loop", requiredVia: ["lower-pin", "bottom-hook"], tensionSlack: 0.01 }], tags: ["tension", "portrait", "chapter-finale"], difficulty: 22 },
  { id: "ccc-expert-01", title: "Foxglove Relay", mode: "expert", chapter: "Expert Remixes", chapterNumber: 4, portrait: "kitten", layout: "remix-lab", routes: [{ color: "coral", path: ["coral-spool", "north-pin", "star-hook", "ear-stitch"], label: "Ear stitch", requiredVia: ["north-pin", "star-hook"] }, { color: "teal", path: ["teal-spool", "south-pin", "moon-hook", "paw-stitch"], label: "Paw stitch", requiredVia: ["south-pin", "moon-hook"] }], tags: ["expert", "pins", "crossing"], difficulty: 25 },
  { id: "ccc-expert-02", title: "Gold Threaded", mode: "expert", chapter: "Expert Remixes", chapterNumber: 4, portrait: "puppy", layout: "remix-lab", routes: [{ color: "gold", path: ["gold-spool", "star-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["star-hook"] }, { color: "coral", path: ["coral-spool", "north-pin", "star-hook", "ear-stitch"], label: "Ear stitch", requiredVia: ["north-pin", "star-hook"] }], tags: ["expert", "shared-junction", "limited-yarn"], difficulty: 26 },
  { id: "ccc-expert-03", title: "Moon Patch", mode: "expert", chapter: "Expert Remixes", chapterNumber: 4, portrait: "puppy", layout: "remix-lab", routes: [{ color: "coral", path: ["coral-spool", "north-pin", "star-hook", "ear-stitch"], label: "Ear stitch", requiredVia: ["north-pin", "star-hook"] }, { color: "gold", path: ["gold-spool", "star-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["star-hook"] }, { color: "teal", path: ["teal-spool", "south-pin", "moon-hook", "paw-stitch"], label: "Paw stitch", requiredVia: ["south-pin", "moon-hook"] }], tags: ["expert", "route-order", "crossing"], difficulty: 28 },
  { id: "ccc-expert-04", title: "Three Skeins", mode: "expert", chapter: "Expert Remixes", chapterNumber: 4, portrait: "bunny", layout: "remix-lab", routes: [{ color: "gold", path: ["gold-spool", "star-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["star-hook"] }, { color: "teal", path: ["teal-spool", "south-pin", "moon-hook", "paw-stitch"], label: "Paw stitch", requiredVia: ["south-pin", "moon-hook"] }, { color: "coral", path: ["coral-spool", "north-pin", "star-hook", "ear-stitch"], label: "Ear stitch", requiredVia: ["north-pin", "star-hook"] }], tags: ["expert", "three-color", "route-planning"], difficulty: 30 },
  { id: "ccc-expert-05", title: "Unauthorized Loop", mode: "expert", chapter: "Expert Remixes", chapterNumber: 4, portrait: "kitten", layout: "remix-lab", routes: [{ color: "coral", path: ["coral-spool", "north-pin", "star-hook", "ear-stitch"], label: "Ear stitch", requiredVia: ["north-pin", "star-hook"] }, { color: "gold", path: ["gold-spool", "star-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["star-hook"] }, { color: "teal", path: ["teal-spool", "south-pin", "moon-hook", "paw-stitch"], label: "Paw stitch", requiredVia: ["south-pin", "moon-hook"] }], tags: ["expert", "limited-yarn", "crossing"], difficulty: 32 },
  { id: "ccc-expert-06", title: "Perfect Stitch", mode: "expert", chapter: "Expert Remixes", chapterNumber: 4, portrait: "bunny", layout: "remix-lab", routes: [{ color: "gold", path: ["gold-spool", "star-hook", "nose-stitch"], label: "Nose stitch", requiredVia: ["star-hook"] }, { color: "coral", path: ["coral-spool", "north-pin", "star-hook", "ear-stitch"], label: "Ear stitch", requiredVia: ["north-pin", "star-hook"] }, { color: "teal", path: ["teal-spool", "south-pin", "moon-hook", "paw-stitch"], label: "Paw stitch", requiredVia: ["south-pin", "moon-hook"] }], tags: ["expert", "mastery", "three-color"], difficulty: 34 }
];

const materialize = (recipe: LevelRecipe): CrochetLevel => {
  const board = layout(recipe.layout);
  const spools = createSpools(board.nodes, recipe.routes);
  const objectives = recipe.routes.map((route, index) => ({
    id: recipe.id + ":stitch:" + (index + 1),
    label: route.label,
    color: route.color,
    spoolId: route.path[0],
    targetId: route.path.at(-1)!,
    maxLength: pathLength(board.nodes, route.path) + (route.tensionSlack ?? 0.06),
    requiredVia: route.requiredVia ?? [],
    visible: true
  }));
  const provisional: CrochetLevel = {
    id: recipe.id,
    title: recipe.title,
    mode: recipe.mode,
    chapter: recipe.chapter,
    chapterNumber: recipe.chapterNumber,
    portrait: recipe.portrait,
    nodes: board.nodes,
    channels: board.channels,
    spools,
    objectives,
    solutionTrace: recipe.routes.map((route) => route.path),
    solverMetadata: {
      solverVersion: "crochet-solver-v1",
      parMoves: objectives.length,
      solutionLength: 1,
      branchCount: 0,
      mechanicTags: recipe.tags,
      difficultyScore: recipe.difficulty
    },
    tutorialBeat: recipe.tutorialBeat,
    generationMethod: "hand-authored"
  };
  const replay = replayTrace(provisional, provisional.solutionTrace);
  const solved = solveSmallBoard(provisional);
  return {
    ...provisional,
    solverMetadata: {
      ...provisional.solverMetadata,
      solutionLength: replay.state.routes.reduce((total, route) => total + route.nodeIds.length - 1, 0),
      branchCount: solved.branchCount
    }
  };
};

export const AUTHORED_LEVELS = recipes.map(materialize);
export const CAMPAIGN_LEVELS = AUTHORED_LEVELS.filter((level) => level.mode === "campaign");
export const EXPERT_LEVELS = AUTHORED_LEVELS.filter((level) => level.mode === "expert");
export const getAuthoredLevel = (levelId: string) => AUTHORED_LEVELS.find((level) => level.id === levelId);
