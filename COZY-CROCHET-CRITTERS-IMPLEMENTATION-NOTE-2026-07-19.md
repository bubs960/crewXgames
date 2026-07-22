# Cozy Crochet Critters — Implementation Note

**Date:** 2026-07-19  
**Status:** implemented locally and verified in the TeamMultiply Play workspace

## Shipped player loop

Cozy Crochet Critters is a calm, information-complete yarn-routing puzzle. The player selects a visible spool, routes its yarn through visible pins and hooks to the required stitch, reads the live tension preview, and tightens the route. Completing all routes wakes the chapter's handmade critter, records progress locally, and emits versioned game events to the Living Shelf. The campaign has no countdown timer or consumable economy.

The local game route is `/#cozy-crochet`. It includes:

- 24 campaign boards: 8 **Kitten Squares**, 8 **Puppy Patches**, and 8 **Bunny Loops**.
- 6 deliberate expert remixes, including the final **Perfect Stitch** board.
- Three completion portraits: kitten, puppy, and bunny.
- The Pattern Book, route/tension hints, pause, restart, exact undo/redo, audio preference, reduced-motion mode, high-contrast mode, daily hoop, and share copy.

## Puzzle and solver architecture

`packages/crochet-critters` is a pure TypeScript package. Boards are small graph puzzles made from spools, pins, hooks, stitches, and directed/capacity-limited channels. The engine rejects wrong yarn color, disconnected routes, forbidden direction, exhausted channels, loops, missing required hardware, self-crosses/crosses, over-tension, and routes that exceed a spool's visible length.

Each action is a route command with before/after state snapshots. History restores exact state for undo and redo rather than trying to reverse puzzle operations heuristically. The solver enumerates legal routes and validates each authored solution trace. Per-level metadata records solver version, par moves, solution length, branch count, mechanics, and difficulty.

The Daily Hoop uses a deterministic date seed. It starts from a solved authored trace, remaps the yarn palette deterministically, reverses the trace into the candidate's stored initial state, and validates the result with the same solver. It is not a random unsolved-board picker.

## Content and progression

| Set | IDs | Count | Main mechanic |
| --- | --- | ---: | --- |
| Kitten Squares | `ccc-kitten-01` through `ccc-kitten-08` | 8 | Color order, simple routes, shared spools |
| Puppy Patches | `ccc-puppy-01` through `ccc-puppy-08` | 8 | Pins, hooks, shared junctions, planning |
| Bunny Loops | `ccc-bunny-01` through `ccc-bunny-08` | 8 | Tight tension, limited yarn, route order |
| Expert remix lab | `ccc-expert-01` through `ccc-expert-06` | 6 | Mixed three-color mastery and Perfect Stitch |

No information is hidden: every objective has a visible target, yarn color, required hardware, maximum length, and live tension state. There are no boosters, purchases, forced ads, soft blockers, or retry timers.

## Living Shelf Pack

`packages/shelf-pack/src/cozy-crochet-critters.ts` defines `cozy-crochet-critters.shelf-pack` and is loaded together with the existing Counter Cat pack. It includes:

- Craft-basket entrance and Mallow, the craft-room kitten resident.
- Yarn basket, crochet mat, pin cushion, oversized crochet hook, handmade fox, Perfect Stitch sampler, and Unauthorized yarn nest.
- A craft corner with warm task lighting, five deterministic resident behaviors, an opening story beat, daily event, and completion share scene.
- Provenance copy, accessibility labels, high-contrast yarn symbols/textures, and reduced-motion descriptions for every collectible.

Completion and discovery rewards flow only through `receiveGameEvent` from `@teammultiply/game-bridge`; the game never mutates Shelf inventory directly. The core event application now unlocks the matching pack ID, and is idempotent for unique rewards.

The rendered Shelf also exposes the pack as a real craft corner: warm task light, pinboard, worktable, Mallow, and distinctive vector treatments for the basket, mat, pin cushion, hook, fox, sampler, and yarn nest. The shared Live mode runs the highest-priority valid behavior from every unlocked pack, not only Counter Cat. A keyboard-accessible **Place selected object** action complements pointer drag placement.

## Save compatibility

`GameSessionStorage` was added to `packages/save-data` for schema-validated, versioned IndexedDB sessions. Cozy Crochet Critters stores the selected board, exact puzzle state, command history, progress, player settings, and a durable per-level completion ledger. The ledger preserves the original completion facts needed to recreate deterministic Shelf events after a later reload, so a completed game can safely retry a missed Shelf sync without duplicating rewards. The UI restores in-progress state after refresh; the game view is retained in the `#cozy-crochet` URL hash.

## Visual implementation

The game board is a Pixi stage with a fabric/craft-table backdrop, dimensional spools, pins, hooks, stitches, and layered yarn rendering (shadow, body, and highlight). Active yarn travels only when motion is enabled. DOM controls remain large, labelled targets for mouse, touch, keyboard, and assistive technology; the canvas adds a forgiving magnetic hit radius.

The Pixi ticker now redraws only while a completed strand has an active fiber animation; an untouched board remains idle. Daily palette remapping updates both visual labels and accessible spool descriptions.

Original chapter-completion portraits were generated as a matched macro fiber-art set and saved at:

- `apps/web/public/assets/crochet/kitten-wakes.png`
- `apps/web/public/assets/crochet/puppy-wakes.png`
- `apps/web/public/assets/crochet/bunny-wakes.png`

Prompt set used: premium macro fiber-art of a completed crochet kitten, puppy, or bunny waking on a task-lit craft table; coral, teal, gold, leaf, and ink yarn; handmade texture; no text, logo, UI, or watermark.

## Verification

The final implementation was checked with:

- `npm test` — **38 passing tests across 8 files**, including all 30 authored boards, trace replay, byte-exact full undo, shared-save restoration, completion-ledger migration, reward idempotence, 10,000 deterministic daily seeds, precise discovery-event routing, locked-pack placement protection, collision-safe Cozy behavior resolution, preserved medal progress, and date-stable Daily events.
- `npm run build` — successful Vite production build. The startup entry is **300.65 kB** (88.49 kB gzip), down from 840.78 kB before the route split; ShelfScene, CozyCrochetGame, and the Pixi renderer emit as separate chunks.
- Browser QA at `http://127.0.0.1:5175/#cozy-crochet` — first completion emits the yarn-basket event; Pattern Book exposes all 30 boards and their medal states; Undo/Redo returns the exact route state; an in-progress board persists through reload; Daily Hoop route state renders correctly; pause disables puzzle actions; reduced motion and high contrast work; and the Shelf accepts keyboard-accessible placement. Live mode was exercised with the Yarn basket and Unauthorized yarn nest, producing Mallow's **Nest rehomed** discovery.
- Mobile browser QA at 390 px wide — no horizontal overflow (`scrollWidth === clientWidth`).
- Existing Counter Cat static route — HTTP 200 at `http://127.0.0.1:8765/waddle-home/`.

Captured browser evidence:

- `output/playwright/cozy-crochet-desktop.png`
- `output/playwright/cozy-crochet-desktop-routed.png`
- `output/playwright/cozy-crochet-mobile.png`
- `output/playwright/cozy-crochet-shelf-audit.png`
- `output/playwright/cozy-crochet-shelf-mobile-audit.png`
- `output/playwright/cozy-crochet-shelf-behavior-audit.png`

## Same-day audit corrections

- Pattern Book now shows the earned medal state for every campaign and expert pattern, and replaying a board merges earned medals instead of downgrading a prior best result.
- A resumed Daily Hoop emits the event date embedded in its deterministic level id, not the wall-clock date at the moment of completion.
- Discovery and story unlock rules now carry their required discovery/beat identifiers. A different discovery event from the same game cannot unlock the yarn nest.
- Placement and behavior execution honor unlocked-pack boundaries. Cozy resident recipes are reachable through the shared Live-mode control and will not commit an overlap-invalid placement.
- The former generic Shelf treatment has been replaced for Cozy assets with a visible craft corner, Mallow, and object-specific vector art.
- Daily Hoop now retains the actual solver-reversed initial state, and the Shelf has an accessible non-drag placement control for keyboard use.
- ShelfScene and CozyCrochetGame now load behind explicit React lazy boundaries, so a direct Crochet deep link does not load the Shelf scene and the renderer no longer blocks the initial application shell.
- Completed patterns persist original event facts in a backward-compatible completion ledger. The game saves that ledger before syncing events; the Shelf reports success only after its changed world is persisted, and replayed receipts remain idempotent.
- An invalid route can still be inspected through the live legality feedback, but its **Tighten stitch** action is disabled until the route is clean.

## Known follow-up work

- Browser QA used Playwright because the in-app browser connector failed its local setup with `Cannot redefine property: process`. A physical phone responsiveness/performance sweep remains prudent before release.

## Workspace state after verification

The verification above applies to the last complete Cozy Crochet / Living Shelf baseline. Immediately afterward, a separate site-shell refactor moved the former Shelf entry into `apps/web/src/LivingShelfApp.tsx` and changed `apps/web/src/App.tsx` to import `./site/SiteApp`. At audit time, `apps/web/src/site/SiteApp.tsx` was not present, so the **current** `npm run build` stops at that unresolved import. The refactor's partial files were left untouched; this note does not treat the current workspace as release-ready until that separate entry-point work is completed.
