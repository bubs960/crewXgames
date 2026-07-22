# KNOCK IT OFF! — next-chat kickoff (written 2026-07-09, end of build chat 1)

Cold-start brief for the next games-lane session. Everything below is verified-true as
of commit `7de1455`. The original duck-era brief (`KICKOFF.md`) is historical — do not
build from it.

⚖️ GROUND RULES IN FORCE — read `Bridge/TEAM-GROUND-RULES.md` before any work
(R1 50-visits/7-31-or-dead · R2 two-chat validation · R3 memory-first · R4 cheap-model ·
R5 everything=traffic · R6 social-ask=dead-chat · R7/R7b subagents & Workflow agents =
explicit sonnet, never Fable/Opus). Games lane note: this game is Steve's app-building
learning track; lister is the profit lane; R1/R5 don't bind here directly.

## What this game is

**Knock It Off!** — you are the cat; one swipe = one paw swat that tilts the whole
counter; EVERYTHING slides until it hits something. Shove the human's stuff (orange,
named items with gag prices) out through narrow edge gaps → CRASH → floor pile +
damage-report receipt. Blue **balls of yarn are bigger than the gaps** — they bonk and
stay (never refused, never lost); they shield things and can plug gaps. Win = all
targets off. Par/stars, 30-level ladder, date-seeded Daily + streak, Floor Gallery
collection, 10 meme-named achievements, career damage ledger, ambient interruptions
(red dot event with tap-to-pounce, bird flyby). Zero ads/timers/lives, unlimited undo.
Duck mode is retired from the UI (CORE + 20 duck levels remain as solver regression
fixtures only).

## Where everything lives / how to run

- Game: `C:\Users\bubs9\apps\games\waddle-home\index.html` — single file, own git repo
  (master). ~2,100 lines: CSS → HTML → CORE block → LEVELS → UI sections.
- Serve: `cd C:\Users\bubs9\apps\games\waddle-home` then `py -m http.server 8642`
  → http://localhost:8642 . Preview tooling: launch.json config name `waddle-home`
  (worktree `.claude/launch.json`, port 8642).
- Tools: `cd tools` →
  `node bench.mjs verify` (MANDATORY gate: re-solves all 50 embedded levels) ·
  `bake-cat` (30-level ladder → cat-levels.generated.json, inject at the
  `/*CAT-LEVELS-JSON*/` marker) · `compare` (duck vs cat-rule depth stats) · `bench`.
- Design bible: `CAT-PIVOT-RESEARCH-2026-07-09.md` in the repo — meme beats, comedy
  spec, competitor/name map, engagement stack, §8 cat-culture item/icon pass.
- Memory: `memory/project_waddle_home.md` (this store is shared across worktrees).

## Architecture laws (violating these cost real debugging time — don't relearn them)

1. **One simulator.** All mechanics live in the marked `/* CORE-START */…/* CORE-END */`
   block; bench.mjs extracts and evals that exact block. Never duplicate sim logic.
   After ANY CORE or level change: `node tools/bench.mjs verify` must PASS (50 levels).
2. **Mechanics changes re-bake the ladder.** Measure par distributions first
   (bench compare / inline stats), re-bake, re-inject, verify. Done twice already
   (gaps ruleset; yarn-bigger-than-holes) — the pipeline is cheap, use it.
3. **Every setTimeout stores its handle and checks the epoch.** `startLevel()` bumps
   `genEpoch`; every animation/ambient timer captures `const ep = genEpoch` and bails
   if stale. Two adversarial reviews (21 confirmed bugs) were mostly violations of
   this one law. Pose timers also clear their predecessors (catTimer1/2, pawT1/2).
4. **Never store a counter that mirrors another store** — derive it (stats.items is
   computed from galleryTotal() at read; a stored copy double-counted every win).
5. **Determinism split:** puzzle logic = seeded mulberry32 only (never Math.random);
   cosmetic garnish (shards, quips, ambient timing) = Math.random is fine.
6. **Ladder keys carry the board seed** (`cat:idx:seed`) so re-bakes orphan old
   bests/done/saves harmlessly. Daily cache key currently `kio_puz2:` — bump on any
   rules change. localStorage prefix `kio_`.
7. **Interruption house rules:** ambient events fire only when idle 4s+, never during
   animation/modals/fetch, any input cancels, and they NEVER touch puzzle state.
8. **JS edit gate:** parse-check after every edit
   (`node -e "new Function(<script body>)"` pattern) + tail-byte check. Single-file
   game stays single-file.

## Session discipline

- Adversarial review workflow (finders → 3-refuter panels, ALL `model:'sonnet'`)
  before calling any milestone done; one Workflow at a time.
- Steve plays in the preview panel WHILE you verify — expect state interference; use
  atomic single-eval checks, restore his level/mode after, NEVER solve the Daily
  (his streak). preview_eval/screenshot sometimes time out at 30s while the page is
  fine — confirm via a follow-up state read, don't retry blind.
- Update `memory/project_waddle_home.md` after every work block (HARD RULE 3).

## Open decisions (Steve's)

- **Name:** "Knock It Off!" has a Google Play exact-match (Joongly brick game) + a
  SolidRoots physical cat-toy collision. Fine locally; decide before any store push.
  CLEAR alternates already vetted: Off the Table · Counter Cat · Paws Off ·
  Table Tumble · One Swat Wonder.
- Whether/when to publish anywhere at all (currently local-only, R1 doesn't bind).

## Backlog (rough priority — pick with Steve)

1. **Ladder expansion toward "1000s of levels"** — more tiers, authored difficulty
   curve, level-select screen; browser-side generation is proven viable (BFS worst
   ~350ms) if we want endless/procedural modes.
2. **Cucumber obstacle** (lane-denial: cat won't swat toward it until it's knocked
   off) — mechanics change ⇒ measure + re-bake per law 2. Introduce alone.
3. **Alive icons** — CSS micro-animations ~1% amplitude (phone buzz, mug steam, yarn
   thread sway, idle breathe w/ phase offsets). Spec in design bible §8.
4. **Treasure variety return** — late-ladder reintroduction of bowl/mouse/box/dot
   machine/fish (IDs already in ITEMS; ♥ badge carries the rule by then).
5. **Gallery depth** — rarity tiers, seasonal items (Christmas tree level), shareable
   damage-report card.
6. Zoomies celebration, human-shadow ambient, teaching hints from solver path, ghost
   replay, quip-arc finale ("worth it." at ladder end), exit-side tags + basket
   targets (depth levers, measured).

## State at handoff (all committed, clean tree)

Prototype → cat pivot (research workflow, 3 critics GO-WITH-CHANGES) → v1 full build
→ review #1 (11 bugs fixed) → yarn rule → animated vision (depth/paw/interruptions/
achievements) → review #2 (10 bugs fixed) → yarn-bigger-than-holes physics + re-baked
ladder. Everything live-verified; 50 embedded levels verify against the shipped
simulator; zero console errors at boot.
