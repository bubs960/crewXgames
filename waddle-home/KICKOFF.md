# WADDLE HOME — build kickoff (written 2026-07-09 by the woofdoku/games chat)

Cold-start brief. Everything you need is in this file; the reference implementation
for architecture patterns is Woofdoku (path below). Read this fully before writing code.

## What you are building

**Waddle Home** — a cozy, ad-free, single-file HTML puzzle game. A family of ducklings
is stranded on a frozen pond. **One swipe slides EVERYTHING** — ducklings, acorns, ice
blocks — simultaneously in that direction; each piece glides until it hits a wall, a
rock, or another stopped piece (ice = frictionless, which is why the theme teaches the
physics for free). The player choreographs swipes so every duckling comes to rest on a
nest. Win when all ducklings are home.

This concept won a 10-concept judged bake-off (13 Sonnet agents: chart research →
5-lens ideation → 3-judge panel). Judges' verdict: "best-rounded package — universal
gesture, real emotional difference (you stage the whole scene, not one piece), cleanest
build story." Full research/rankings live in the woofdoku session if ever needed.

## ⚖️ LEGAL / ORIGINALITY — hard constraint from Steve

- **Woofdoku (the previous game) is a deliberate clone of Meowdoku. It is LOCAL-ONLY,
  for fun, and can NEVER be released. Do not ship it, deploy it, or reuse its
  theme/branding.** It lives in the extension worktree and stays there.
- **Waddle Home must be releasable = original.** Genre mechanics are not protectable
  (sliding/ice puzzles are an ancient genre) but expression is: do NOT copy any specific
  game's name, art style, level designs, UI copy, or trade dress. Nearest analogues to
  stay conscious of: Ricochet Robots (moves ONE robot per turn — ours moves the whole
  board, keep it that way), 2048 (same gesture, totally different rules), Pokémon ice
  caves (single-avatar sliding). Simultaneous whole-board slide + settle-on-nest is our
  own combination — protect that originality as you add features.
- Original name, original art (emoji or hand-rolled CSS/SVG), original copy throughout.

## Core rules spec (v1)

- Grid N×N (start 6×6). Cell types: ice (default), rock/wall (immovable), nest.
- Movable pieces: ducklings (goal pieces) and obstacles (acorns/logs — slide but have
  no goal). Border is walled (nothing slides off the board).
- **Swipe (4-directional, whole viewport, one gesture only):** process pieces
  nearest-to-farthest in the swipe direction; each slides until blocked by wall, rock,
  a settled duckling, or an already-stopped piece. Fully deterministic, no physics engine.
- **Settling (recommended, builder may revisit):** a duckling that comes to rest ON a
  nest settles — it locks, becomes an obstacle, and visibly "sits down." Rationale:
  progressive visible progress was the judges' #1 criticism of rival concepts (a
  half-solved board must LOOK more solved). Any duckling may claim any nest in v1;
  color-matched pairs are a later difficulty lever, not v1.
- Win = every duckling settled. Score = swipe count vs solver optimal → 1–3 stars.
  No lives, no timer, free instant reset, unlimited undo.

## Generator + solver (learn from Woofdoku's biggest bug)

- **Recommended approach — forward-only, no reverse-move code:** seeded random layout
  (rocks, nests, ducklings, obstacles) → forward BFS over swipe sequences (visited-set
  on full board state, depth cap ~16) → accept boards solvable in 5–14 swipes, reject
  trivial (<4) or unsolvable. This entirely avoids the reverse-generation trap the
  judges flagged (reverse scrambler and forward simulator drifting out of sync = silent
  unsolvable boards). One simulator, one source of truth.
- **Measure, don't assume (Steve's law + the Woofdoku lesson):** Woofdoku's generator
  froze the UI up to 30s at 9×9 until a 65-agent review caught it; the fix was found by
  benchmarking three strategies in Node (the intuitive one was 4× WORSE; the measured
  one 123× better). Before committing: benchmark accept-rate and BFS time across sizes
  in Node. If slow: async chunked search (yield every ~25 states), localStorage puzzle
  cache (`woof_puz:` pattern), background pregen of next level. All three patterns are
  proven in Woofdoku — copy them.
- Determinism: mulberry32 PRNG, seed from level number / date string. Same level =
  same board for everyone, forever. NEVER call unseeded Math.random() in generation.
- Solver doubles as: star benchmark, teaching hints ("this swipe is on the optimal
  path" — flash the direction, explain in a toast), and dead-end detection (optional
  "no path home from here — reset?" nudge).

## Engagement stack (copy Woofdoku's, it works)

- Level ladder: grid/piece count grows (6×6 2 ducklings → 8×8 4+ ducklings + obstacle
  types). New obstacle types re-teach the one gesture (Block Out's proven content
  playbook): breakable thin ice (crossable once), one-way currents, a second duckling
  species that must settle LAST, etc. — introduce one at a time.
- Daily pond: date-seeded board, 🔥 streak, credit-once done-map, solved-state restore.
- 1–3 stars vs optimal; personal bests; 🏆 solved counter; ghost replay of your solve
  (pure state playback, very shareable) is a strong v2 candidate.
- Zero ads, zero accounts, zero timers. Cozy dusk-pond palette, dark mode from day one.

## Architecture — copy these exact patterns from Woofdoku

Reference (READ-ONLY, do not modify, do not reuse theme):
`C:\Users\bubs9\Fig Pinner Dev - Claude\.claude\worktrees\youthful-agnesi-675cba\woofdoku\index.html`

Proven patterns to port: single-file HTML (inline CSS/JS, sectioned + commented);
safe-storage helpers (try/catch localStorage + NaN guards); per-key board save slots
with a board-signature so stale saves self-discard; done-map for credit-once wins;
cancellable overlay timer + input freeze while celebrating; pointer-id-tracked
gestures; theme toggle (manual overrides OS, region colors re-render); toast system;
paw/feather confetti. Steve plays live in the preview panel while you work — expect it.

## Build discipline (non-negotiable session rules)

1. Build at `C:\Users\bubs9\apps\games\waddle-home\index.html` (this folder). All new
   games live under `C:\Users\bubs9\apps\games\` — NOT the extension repo/worktree.
2. **R7b: every Workflow `agent()` call passes `model: 'sonnet'` explicitly.** All
   subagents Sonnet, never Fable/Opus (R7), fan-out soft cap 20 (R7a).
3. **Cheapest test FIRST:** grayscale prototype (bare grid, colored squares, working
   swipe sim, ~20 seeded boards, zero art). The riskiest assumption is that
   whole-board sliding FEELS like choreography, not chaos. Steve playtests it in the
   preview panel; only after it feels good do you build the full game. If it feels like
   random flicking, STOP and report back — the runner-up concept (Homeward Hop, Wordle
   feedback on a hidden path) is the fallback, details in the woofdoku session memory.
4. Before calling it done: adversarial review workflow (finders → 3 refuters per
   finding, all Sonnet) — this caught 18 real bugs in Woofdoku including the 30s freeze.
   Then verify live in the browser preview (preview_* tools), not just by reading code.
5. Verify every JS file edit: tail-check bytes + parse check (`new Function` on the
   script body). Update memory (`project_games_lane.md` + a new `project_waddle_home.md`)
   after every work block — HARD RULE 3.

## Open design decisions (builder judgment, flag choices to Steve)

- Do obstacles (acorns) ever settle or always slide? (Lean: always slide.)
- Duckling-duckling collision: stack-stop (recommended, simple) vs push-chains.
- Grid border: walls all around (recommended v1) vs open edges with fall-off fail.
- Name check: "Waddle Home" felt right in judging; builder may propose alternates —
  check the App Store for collisions before attaching to it.

## Definition of done (v1)

Playable at 6×6–8×8 with 25+ ladder levels + daily; solver-verified boards; stars vs
optimal; teaching hints; undo/reset; save/restore mid-level; dark mode; verified in
preview on desktop + mobile viewport; adversarial review passed; committed to a git
repo in this folder (init one — this folder is NOT inside an existing repo).
