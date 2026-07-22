# MOSAIC MEADOW — build kickoff (written 2026-07-11 by the woofdoku/games chat)

Cold-start brief for a fresh chat. Read fully before writing code. Sibling references:
- `C:\Users\bubs9\apps\games\waddle-home\index.html` — "Knock It Off!" (original, releasable,
  passed 2 adversarial reviews). **Primary architecture reference.**
- Woofdoku (extension worktree, branch `claude/woofdoku-app-13c376`, `woofdoku/index.html`) —
  pattern reference ONLY. 🛑 It is a local-only Meowdoku clone: never release, never deploy,
  never reuse its theme. Read-only.

## What you are building

**Mosaic Meadow** — a cozy, ad-free, single-file HTML puzzle. A garden path is paved with
mosaic stones, each scrambled by a quarter-turn or three. **Twist tiles in place** until every
edge flows into its neighbors — vines connect, streams join, critter halves meet — and the
whole board resolves into one continuous living mural. Matched seams click-and-glow; the final
twist wakes the garden (colors bleed in, critters walk the finished path).

From the 10-concept judged bake-off (2026-07-09, 13 Sonnet agents): scored 24.0/30 —
**highest novelty of all ten (8.0)**, bus-stop 6.3. Judges' words: "the rotate-gesture is the
single most novel interaction on this list — nobody in the space is doing it" and "a completed
mural genuinely screenshots better than a validated grid." Nothing on the current top chart
uses rotation at all, and the win-condition is a *picture*, not a checkmark — a different
emotional note from every elimination grid out there.

## ⚖️ LEGAL / ORIGINALITY — hard constraints from Steve

- Games in this lane must be **releasable = original expression**. The rotation/edge-matching
  *genre* is ancient and public (Net/pipes, KPlumber, Infinity Loop, Tantrix, Wang/Truchet
  tiles) — mechanics are fair game. Do NOT copy any specific game's name, art style, tile set,
  level designs, or trade dress. Especially: no Infinity Loop minimalist grey-loop look —
  our warm painted-garden mural identity IS the differentiator.
- Woofdoku is the standing counter-example (deliberate clone, local-only forever).
- **Name check before attaching to "Mosaic Meadow":** search the App Store / Play Store for
  collisions FIRST. The last game's name collided with a shipped 2016 title and now needs a
  rename — don't repeat that. Propose alternates if taken.

## Core design — and how it kills the judges' #1 objection

All three judges flagged the same risk: "a solo dev now owns an art pipeline (12–20 hand-
authored tile pieces) — a cost every other concept avoids." **The kickoff answer: there is no
hand-drawn art. All tile art is procedural SVG, generated in code.**

- **Formal layer (the logic):** each tile edge carries one of K abstract connector types
  (start K=2: vine, empty; later add stream, stone-path, flower-chain, directional critter
  halves). A board is solved when every shared edge has equal types on both sides. Rotation
  state = one int 0–3 per cell. This keeps the logic layer Sudoku-simple.
- **Visual layer (the mural):** connector types render as SVG quarter-arcs/curves through the
  tile (Truchet-style), drawn programmatically — stroke, color, leaf/flower sprinkles along
  the path, all code. Critters are emoji (🐌🐞🦔🐝) seated at junctions and path-ends. Matched
  seams get the glow; on win, the connected network animates (color bleed + critters walking).
  If the procedural pass can't be made charming, that is the kill criterion — see the gate.

## Rules spec (v1)

- Grid N×N (start 4×4, ladder to 8×8). Tiles are FIXED in position; the only state is rotation.
- **One gesture, total:** tap = rotate 90° clockwise (dead-simple, thumb-friendly). Offer the
  concept's fancier circular-drag "twist with snap" as a progressive enhancement AFTER the
  tap version feels right — never instead of it.
- Per-edge feedback: matched seam glows softly, unmatched stays dull. No lives, no timer,
  free undo, unlimited play.
- Win = all seams matched. Track twist count vs solver minimum (sum of minimal rotation
  distances from scrambled to solved) → "Perfect Weave" badge at par, 1–3 stars near it.

## The "spin until it fits" failure mode — design it out, don't hope

Judges' second warning: rotation puzzles can degrade into jigsaw fiddling ("spin each tile
until it clicks"), which bounces the hardcore deduction audience. Countermeasures, in order:
1. **Generate for deduction:** verify each board is solvable by pure propagation — repeatedly,
   some tile's rotation is FORCED by its already-consistent neighbors + border (border edges
   must face 'empty' unless the vine exits are disallowed at the rim — decide and keep it
   consistent). Reject boards needing guessing at easy/mid tiers; allow bounded search depth
   as a "gnarled" late-tier flavor.
2. **Uniqueness gate:** count solutions with a backtracking solver (limit 2), reject ambiguous
   boards. Watch rotationally-symmetric tiles (4 identical edges, or 180°-symmetric straights)
   — they create multiple valid rotations; either ban the fully-symmetric type or count
   solutions modulo symmetric tiles' equivalent orientations, then still require uniqueness.
3. **Teaching hints** (the Woofdoku signature): hint = highlight one tile whose rotation is
   currently forced, with a toast explaining WHY ("its left seam is locked and only one
   rotation continues that vine"). Never just reveal.
4. Difficulty ladder = edge-type count (2→6) + grid size + directional/asymmetric connectors,
   NOT arbitrary scramble depth.

## Generator + solver (Woofdoku lessons apply verbatim)

- Solved-state generation: lay out a valid tiling by construction — e.g. assign each internal
  edge a connector type (biased: ~55% vine to keep the mural lush but not saturated), derive
  each tile's edge tuple, THEN scramble each tile 0–3 quarter-turns. Solvable by construction;
  the gates above (propagation-solvable, unique) filter for quality.
- **Measure, don't assume:** benchmark accept-rate and generation time in Node across sizes
  BEFORE wiring in. Woofdoku's generator froze the UI 30s at 9×9 until measured; the winning
  fix was 123× faster than the intuitive one. If generation is slow: async chunked search,
  localStorage puzzle cache, background pregen — all three patterns exist in both sibling
  games; copy them.
- Determinism: mulberry32, seed from level int / date string. No unseeded Math.random() in
  generation. Same level = same board for everyone, forever.

## Engagement stack (proven; port it)

Daily seeded mural + 🔥 streak + credit-once done-map + solved-state restore; level ladder;
Perfect Weave badge; 🏆 solved counter; per-mode save slots with board-signature; dark mode
day one; seasonal palette packs (autumn hedgerow, winter burrow, tide pool) as streak-milestone
cosmetics, never sold. **Share card:** the finished mural as a rendered PNG (canvas snapshot of
the SVG) — the one game in the batch whose win screen is genuinely screenshot-worthy; make
that a one-tap save/share button.

## Build discipline (non-negotiable)

1. Build at `C:\Users\bubs9\apps\games\mosaic-meadow\index.html`. Own git repo in this folder
   (`git init` — it is NOT inside an existing repo). Single file, inline CSS/JS, sectioned.
2. **R7b: every Workflow `agent()` call passes `model: 'sonnet'` explicitly.** All subagents
   Sonnet, never Fable/Opus (R7). Fan-out soft cap 20 (R7a).
3. **Prototype gate FIRST (the cheapest test):** monochrome Truchet arcs on a 5×5 — no color,
   no critters, no engagement layer. Two questions it must answer before ANY further build:
   (a) does tap-rotate + seam-glow *feel* like deduction (not jigsaw fiddling)?
   (b) do the procedural arcs already look like they could become a garden?
   Steve playtests in the preview panel (he WILL play while you work — expect live state
   changes). If (a) fails → stop, report; fallback concept is **Homeward Hop** (Wordle-feedback
   path puzzle — see bake-off results in the woofdoku session / games-lane memory). If (b)
   fails → one art-direction iteration, then stop and report honestly.
4. Before "done": adversarial review workflow (finders → 3 refuters per finding, all Sonnet) —
   this caught 18 real bugs in Woofdoku including the 30s freeze — then verify live in the
   browser preview (desktop + mobile viewport), not just by reading code.
5. Verify every JS edit: tail-check bytes + `new Function` parse check. Update memory
   (`project_games_lane.md` + new `project_mosaic_meadow.md` + MEMORY.md index) after every
   work block — HARD RULE 3.

## Open design decisions (builder judgment; flag choices to Steve)

- Border policy: rim edges must be 'empty' (self-contained mural) vs vines may exit (feels
  like a window into a larger garden). Lean: self-contained early, window-tier later.
- Tap rotates CW only vs long-press for CCW. Lean: CW only; par accounts for it.
- Do matched seams LOCK their tiles (satisfying but can strand mistakes) or stay rotatable
  (forgiving)? Lean: never lock; glow is feedback, not commitment.
- Critter placement: junction-seated emoji vs path-walking on win only. Lean: both — static
  seat during play, walk animation on win.

## Definition of done (v1)

Playable 4×4→8×8, 25+ ladder levels + daily; propagation-solvable + unique boards, solver-
verified; teaching hints; Perfect Weave par; undo/reset; mid-level save/restore; dark mode;
share-card PNG export; name collision checked; adversarial review passed; live-verified in
preview both viewports; committed; memory updated.
