export type GameStatus = "Available" | "In Development" | "Coming Later";
export type DifficultyBand = "Easygoing" | "Moderate" | "Tricky" | "Hard";
export type SessionBand = "Under 10 min" | "10–15 min" | "Open-ended";
export type GameImageKey = "counter-cat" | "meadow" | "bento" | "tangle" | "parade" | "crochet";

export interface GameDefinition {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  animal: string;
  mechanic: string;
  difficulty: DifficultyBand;
  session: string;
  sessionBand: SessionBand;
  status: GameStatus;
  daily: boolean;
  firstPlay?: string;
  imageKey: GameImageKey;
  imageAlt: string;
  playPath: string;
  summary: string;
  personality: string;
  rules: string[];
  controls: string[];
  accessibility: string;
  relatedSlug: string;
  accent: "coral" | "green" | "gold" | "berry" | "teal";
}

export const games: GameDefinition[] = [
  {
    id: "counter-cat",
    slug: "counter-cat",
    title: "Counter Cat / Knock It Off!",
    shortTitle: "Counter Cat",
    eyebrow: "Flagship · Case file 001",
    animal: "Cat",
    mechanic: "Strategy",
    difficulty: "Hard",
    session: "5–15 minutes",
    sessionBand: "10–15 min",
    status: "Available",
    daily: true,
    imageKey: "counter-cat",
    imageAlt: "Counter Cat watching a kitchen-counter lane puzzle with protected yarn and human clutter",
    playPath: "/waddle-home/",
    summary: "Plan the perfect swat. Clear the human clutter while the protected yarn remains under feline jurisdiction.",
    personality: "The floor is accepting new evidence. The cat is accepting neither questions nor responsibility.",
    rules: [
      "Swipe a row or column to bap that lane. In Expert mode, only the selected lane moves.",
      "Send every orange evidence object through an edge gap and onto the floor.",
      "Keep every blue yarn object on the counter. Use protected yarn as a shield, bumper, or gap plug.",
      "Work around heavy blockers, use unlimited undo, and match par when the perfect crime matters."
    ],
    controls: [
      "Mouse or touch: drag across a row or column.",
      "Keyboard: arrow keys bap a lane; U undoes; R resets.",
      "On-screen controls provide previous, undo, reset, and next actions."
    ],
    accessibility: "The board supports keyboard swats as well as pointer and touch. Object roles use color, silhouette, and the protected-heart mark. Sound and pacing controls are available in-game. A complete screen-reader narration of the board is still pre-launch work.",
    relatedSlug: "paws-yarn-tangle",
    accent: "coral"
  },
  {
    id: "mosaic-meadow",
    slug: "mosaic-meadow",
    title: "Mosaic Meadow",
    shortTitle: "Mosaic Meadow",
    eyebrow: "Garden logic",
    animal: "Garden critters",
    mechanic: "Tile rotation",
    difficulty: "Tricky",
    session: "5–12 minutes",
    sessionBand: "Under 10 min",
    status: "Available",
    daily: true,
    imageKey: "meadow",
    imageAlt: "Mosaic Meadow tile board with connected garden paths, flowers, ladybugs, and snails",
    playPath: "/mosaic-meadow/",
    summary: "Rotate a field of paths, water, and flowers until one small meadow fits together without a loose end.",
    personality: "The meadow is quiet. The ladybugs have still filed several strongly worded routing notes.",
    rules: [
      "Tap a tile to rotate it by 90 degrees.",
      "Match every path edge with its neighbor and close every route cleanly.",
      "Use undo or a fair hint when the garden stops making sense.",
      "Complete the ladder or open the date-seeded Daily Meadow."
    ],
    controls: [
      "Mouse or touch: choose a tile to rotate it.",
      "Keyboard: surrounding buttons and level controls are focusable; the tile grid itself still needs a full keyboard control pass.",
      "Undo, reset, hint, theme, and share controls remain outside the board."
    ],
    accessibility: "Paths use shape and connection state, not color alone, and the layout responds down to phone widths. The rotating tile grid does not yet expose complete keyboard or screen-reader operation; that limitation is tracked for the pre-launch accessibility pass.",
    relatedSlug: "pet-parade-sort",
    accent: "green"
  },
  {
    id: "pup-purr-bento",
    slug: "pup-purr-bento",
    title: "Pup & Purr Bento",
    shortTitle: "Pup & Purr Bento",
    eyebrow: "Lunch-table placement",
    animal: "Cat & dog",
    mechanic: "Placement",
    difficulty: "Moderate",
    session: "Open-ended",
    sessionBand: "Open-ended",
    status: "Available",
    daily: true,
    imageKey: "bento",
    imageAlt: "Pup and Purr Bento board with a lunch tray and cat, dog, and shared snack pieces",
    playPath: "/pup-purr-bento/",
    summary: "Pack cat snacks, dog snacks, and shared treats into a lunch tray that never has quite as much room as promised.",
    personality: "The lunch committee has two members, three snack categories, and no unified position on sharing.",
    rules: [
      "Select one of the visible snack shapes, then place it into an open area of the tray.",
      "Complete rows or columns to clear space for the next menu.",
      "Plan around the next pieces; the tray ends when no legal placement remains.",
      "Use the date-seeded tray for the Daily Bento or start a fresh free-play lunch."
    ],
    controls: [
      "Mouse or touch: select a snack and choose its tray position.",
      "Keyboard: menu and action buttons are focusable; the placement grid still needs a complete keyboard equivalent.",
      "Undo and reset are always outside the active tray."
    ],
    accessibility: "Large cells and stable controls support touch and zoom. Snack ownership is paired with visible labels. Full keyboard placement and a nonvisual board summary are not complete yet and remain explicit launch work.",
    relatedSlug: "pet-parade-sort",
    accent: "gold"
  },
  {
    id: "paws-yarn-tangle",
    slug: "paws-yarn-tangle",
    title: "Paws & Yarn Tangle",
    shortTitle: "Paws & Yarn Tangle",
    eyebrow: "Craft-room spatial puzzle",
    animal: "Cat & dog",
    mechanic: "Untangle",
    difficulty: "Tricky",
    session: "3–10 minutes",
    sessionBand: "Under 10 min",
    status: "Available",
    daily: true,
    imageKey: "tangle",
    imageAlt: "Paws and Yarn Tangle board with colored yarn lines crossing between animal and yarn nodes",
    playPath: "/paws-yarn-tangle/",
    summary: "Move every yarn ball until no strands cross. The pets insist the original arrangement was intentional.",
    personality: "A spatial puzzle disguised as an incident in the craft room. Nobody saw who pulled the first strand.",
    rules: [
      "Drag a yarn or animal node to a clear position on the board.",
      "Watch the crossing count fall as lines separate.",
      "Finish when every yarn line reaches its endpoint without crossing another.",
      "Open the date-seeded Daily Tangle for one shared knot."
    ],
    controls: [
      "Mouse or touch: drag nodes directly across the board.",
      "Previous, next, daily, and reset actions use standard buttons.",
      "The spatial board is currently pointer-first and does not yet have a keyboard movement model."
    ],
    accessibility: "The current prototype provides large draggable targets and a text crossing count. A keyboard route-editing mode and full nonvisual graph description are not yet implemented; the game page states that limitation instead of implying support that is not present.",
    relatedSlug: "mosaic-meadow",
    accent: "berry"
  },
  {
    id: "pet-parade-sort",
    slug: "pet-parade-sort",
    title: "Pet Parade Sort",
    shortTitle: "Pet Parade Sort",
    eyebrow: "The Collar Club · Living Shelf Pack 02",
    animal: "Mixed pets",
    mechanic: "Sorting",
    difficulty: "Tricky",
    session: "5–15 minutes",
    sessionBand: "10–15 min",
    status: "Available",
    daily: true,
    firstPlay: "Starts with a guided one-move practice board. The game marks what to pick up and where it belongs.",
    imageKey: "parade",
    imageAlt: "Pet Parade Sort board with cats and dogs arranged on several wooden benches",
    playPath: "/shelf/#pet-parade-sort",
    summary: "Sort tactile enamel ID tags, assemble each rescue pet’s collar, and bring the whole Collar Club to the park photo.",
    personality: "Cats do not line up. They permit arrangements. Dogs are already ready. The rabbit has notes.",
    rules: [
      "Tap the visible top tag, then tap the glowing empty or matching post.",
      "Put every tag from one pet family together to complete that pet's collar.",
      "The three practice boards teach single tags, matching runs, and post capacity in that order.",
      "Later boards add locks, reversible faces, linked charms, bells, foster hooks, and previewed cat inspections."
    ],
    controls: [
      "Mouse or touch: tap source then destination, or drag directly from one collar post to another; both issue the same command.",
      "Keyboard: Tab reaches every post and action; Enter or Space selects; U/Y undo and redo; R restarts; H requests a solver step; Escape pauses.",
      "Unlimited undo/redo, restart, pause, level book, Daily Parade, Album, audio, motion, effects, and contrast controls remain available."
    ],
    accessibility: "Every post has a native keyboard control and a spoken bottom-to-top summary with capacity, lock, foster, and inspection state. Owner families use color, symbols, edge shapes, labels, and distinct marks. High contrast, reduced motion, reduced effects, persistent mute, live move announcements, and non-drag play are built in.",
    relatedSlug: "pup-purr-bento",
    accent: "teal"
  },
  {
    id: "cozy-crochet-critters",
    slug: "cozy-crochet-critters",
    title: "Cozy Crochet Critters",
    shortTitle: "Cozy Crochet",
    eyebrow: "Living Shelf Pack 01",
    animal: "Handmade critters",
    mechanic: "Yarn routing",
    difficulty: "Moderate",
    session: "5–15 minutes",
    sessionBand: "10–15 min",
    status: "Available",
    daily: true,
    firstPlay: "Starts with a protected practice stitch. The coach reveals one spool, pin, and tightening action at a time.",
    imageKey: "crochet",
    imageAlt: "A handmade crochet kitten waking on a warm craft table surrounded by colored yarn",
    playPath: "/shelf/#cozy-crochet",
    summary: "Route visible yarn through pins and hooks, tighten each clean stitch, and wake a handmade resident.",
    personality: "A calm craft-table puzzle where the yarn remembers every decision and the kitten has excellent timing.",
    rules: [
      "Start at the visible spool for the next stitch, then follow open pins and hooks to its target.",
      "Use the tension preview before tightening: crossings, closed channels, and scenic detours are rejected.",
      "Undo and redo restore the exact prior puzzle state, including yarn length and completed routes.",
      "Campaign, expert, and date-seeded Daily Hoop patterns all use the same readable rules."
    ],
    controls: [
      "Mouse or touch: choose a spool, then tap the visible route points in order.",
      "Keyboard: every board target is a native button; Enter or Space routes yarn, Ctrl/Cmd+Z undoes, R restarts, and Esc pauses.",
      "The Pattern Book keeps progress on this device and exposes every available board."
    ],
    accessibility: "Yarn colors are paired with visible symbols and spoken labels; tension, legality, and objectives have text equivalents. Reduced motion and high-contrast controls are available in-game.",
    relatedSlug: "paws-yarn-tangle",
    accent: "berry"
  }
];

export const gameBySlug = (slug: string) => games.find((game) => game.slug === slug);

export const requiredSiteRoutes = [
  "/",
  "/games/",
  ...games.map((game) => `/games/${game.slug}/`),
  "/daily/",
  "/about/",
  "/privacy/",
  "/terms/",
  "/cookies/",
  "/ads-and-rewards/",
  "/accessibility/",
  "/contact/",
  "/shelf/"
] as const;

export const legacyGameRoutes = [
  "/waddle-home/",
  "/mosaic-meadow/",
  "/pup-purr-bento/",
  "/paws-yarn-tangle/",
  "/pet-parade-sort/"
];
