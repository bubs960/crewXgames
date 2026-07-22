# Pet Parade Sort Production Implementation Note — 2026-07-19

Status: complete for the local production preview. No deployment, DNS, advertising, or analytics changes were made.

Canonical local game URL: `http://127.0.0.1:4173/shelf/#pet-parade-sort`

## Outcome

Pet Parade Sort is now a first-class game inside the Living Shelf app rather than an isolated HTML prototype. It has a pure, testable rules package; a responsive Pixi/React presentation; persistent progression and settings; exact undo/redo; deterministic Daily play; bounded solving and legal hints; Living Shelf rewards; and compatibility routes for old links.

The shipped content is:

- 3 guided tutorials.
- 40 campaign levels: 5 chapters with 8 levels each.
- 10 expert levels.
- 5 replayable chapter challenges, each based on a chapter finale with tighter medal targets.
- 1 date-specific deterministic Daily Parade available each day.

That is 53 static shipped boards, plus 5 challenge entries and the current Daily: 59 playable entries on a given date. Daily boards are deterministically selected from a 26-board solver-verified source pool, so every player receives the same board for the same date without a streak penalty or mystery reroll.

## Final rules

Each rescue pet has a collar order. Tags sit vertically on visible-capacity wooden posts. The player moves the exposed top tag, or the exposed matching run, onto an empty post or a compatible top tag. Capacity is measured in units, so an oversized bell occupies two spaces.

A collar clears automatically when one post contains the order's complete tag set in the required sequence and under the order's active constraints. The pet then joins the park-photo arrival line. The board is complete when all collar orders have cleared.

Owner identity is redundant by design: color, symbol, owner portrait, edge shape, label, and high-contrast marks all communicate the same family. The progression introduces mechanics in readable layers:

1. Matching runs.
2. Variable-capacity posts.
3. Locked-buckle posts that open after a stated order clears.
4. Double-sided tags whose exposed identity flips deterministically when moved.
5. Linked pairs that must travel together when their link is exposed.
6. Posted collar patterns that require an exact order, not merely a matching family.
7. Priority cards that gate completion order.
8. Oversized bells that consume two capacity units.
9. Foster hooks that accept only their printed owner families.
10. Cat inspections that block a telegraphed post for a stated number of moves.

Pointer drag, source-then-destination tap, and keyboard selection all dispatch the same pure move command. Unlimited undo/redo restores full state snapshots, including orientations, completed orders, arrivals, and inspection timing. Restart, pause, level selection, Album, Daily, settings, and solver hint remain available from the persistent toolbar.

## Campaign and difficulty structure

| Chapter | Levels | Primary progression |
| --- | ---: | --- |
| Parade Practice | 3 tutorials | exposed tags, runs, visible capacity |
| Intake Desk | 8 | readable matching-run planning |
| Grooming Room | 8 | variable capacity and locked buckles |
| Charm Workshop | 8 | double-sided tags and linked pairs |
| Collar Studio | 8 | exact patterns and priority cards |
| Park Gate | 8 | oversized bells, foster hooks, and inspections |
| After-Hours Collar Club | 10 expert | multi-mechanic compositions |

Campaign boards are built from explicit seeds and reverse-from-solved legal traces. Each board carries its seed, curation note, authored upper-bound trace, par, and medal thresholds. Difficulty is reported from solution depth, explored branching, spare capacity, and weighted mechanic interaction, then classified as guided, easygoing, thoughtful, tricky, or expert.

The browser play-test covered the complete first tutorial, undo and redo, a campaign board with reload restoration, the current Daily, and the most mechanic-dense expert board. Automated validation covers every static shipped board and a full leap-year-sized set of Daily dates. Broader human balance testing across all 40 campaign and 10 expert boards remains a pre-public-launch requirement; automated solvability is not being presented as equivalent to human pacing evidence.

## Architecture

| Area | Implementation |
| --- | --- |
| Pure model and rules | `packages/pet-parade-sort/src/model.ts`, `engine.ts`, and `commands.ts` |
| Solver and validation | `packages/pet-parade-sort/src/solver.ts` |
| Authored content | `packages/pet-parade-sort/src/content.ts` |
| Daily and challenges | `packages/pet-parade-sort/src/daily.ts` |
| Score and medals | `packages/pet-parade-sort/src/scoring.ts` |
| Save and migration | `packages/pet-parade-sort/src/save.ts` |
| Ecosystem events | `packages/pet-parade-sort/src/events.ts` |
| React game shell | `apps/web/src/PetParadeGame.tsx` |
| Pixi stage and accessible post overlay | `apps/web/src/PetParadeStage.tsx` |
| Responsive visual system | `apps/web/src/PetParadeGame.css` |
| Living Shelf pack | `packages/shelf-pack/src/pet-parade-sort.ts` |
| Shelf environment and reward art | `apps/web/src/ShelfScene.tsx` |
| Catalog and compatibility routing | `apps/web/src/site/gameCatalog.ts`, `apps/web/src/App.tsx`, and both `pet-parade-sort/index.html` launchers |

The rules package has no DOM or renderer dependency. React owns session lifecycle and controls; Pixi owns the high-density board art; native buttons above the canvas own focus, spoken summaries, tap, drag, and keyboard dispatch. This keeps game correctness testable independently of presentation while preserving one command path for every input method.

## Solver, hints, and validation

The breadth-first solver deduplicates stable full-state keys and symmetric empty-post moves. Within its state bound, a found breadth-first result is optimal. If the search reaches its safety bound, a replayed legal authored trace remains a proven upper bound, while the remaining collar count supplies a conservative lower bound. Reports state this bounded status rather than claiming unproven global optimality.

Hints request the first move of a found solution. When bounded search cannot produce a full path, the fallback is still selected from the current legal move set and ranked deterministically. Dead-state detection distinguishes a proven dead end from an inconclusive search-bound result.

Level validation checks identifiers, exactly-once tag placement and order membership, visible capacity, lock references, pattern lengths, inspection schedules, non-degenerate trace length, complete trace replay, solvability, and difficulty. Tests additionally cover overflow rejection, incorrect-pattern rejection, priority gating, every special mechanic, exact command history, legal hints, deterministic Daily generation across 366 dates, save parsing, and legacy-best migration.

## Progression, scoring, save, and events

Completion starts from 1,000 points, adds a planning bonus, adds 400 for a no-hint solve, subtracts 80 per hint, and never falls below 250. Park Pass, Ribbon Collar, and Golden Tag medals use the board's recorded move thresholds. The best completion merges lower moves, higher score, and earned medals without deleting prior accomplishments.

IndexedDB stores the exact active board state, undo and redo stacks, completions, unlocked levels, Daily ledger, parade Album, accessibility/audio settings, hint and undo facts, and pending ecosystem events. The legacy local best-move array migrates into provenance-preserving `pps-legacy-*` completion records.

Completion events use stable IDs and remain duplicate-safe when retried. Normal, expert, Daily, story, and clean-solve discovery events drive the existing ecosystem event path.

## Visual and audio production

The board renders high-DPI enamel tags with metallic rims, scratches, inset portraits, owner marks, distinct edges, thickness, and contact shadows. Posts use woven material, capacity ticks, buckle/inspection/foster affordances, and arrived-pet vectors. Every chapter changes the environmental dressing instead of only recoloring the same scene: intake clipboard, grooming towels, charm board, collar swatches, park foliage, and after-hours lights.

Two original raster assets were created with the image-generation workflow, visually inspected at full size, converted from PNG to WebP at quality 88 with a high-quality encoding pass, and reinspected after conversion:

- `apps/web/public/assets/pet-parade/grooming-room-atmosphere-v1.webp` — 1536×1024, 330,782 bytes. Prompt direction: a wide sunlit premium rescue grooming room with a tactile wood organizer, teal tile, folded towels, and a park gate; warm handcrafted realism; no text, people, or branded characters.
- `apps/web/public/assets/pet-parade/park-photo-lineup-v1.webp` — 1536×1024, 368,586 bytes. Prompt direction: a warm wide park lineup with an eager dog, note-taking rabbit, fox, hamster, and a cat slightly outside formation, all with woven collars and enamel tags; original characters only and no text.

The Web Audio sound set is synthesized locally and begins muted. It includes distinct material clinks, buckle, bell, arrival, and invalid-move cues. Mute persists. Reduced effects suppresses nonessential visual treatment; reduced motion removes movement-dependent presentation.

## Routes and old links

- Canonical play route: `/shelf/#pet-parade-sort`
- Game detail route: `/games/pet-parade-sort/`
- Compatibility route: `/pet-parade-sort/`, which launches the canonical Shelf route

The Living Shelf route lazy-loads the game. The public compatibility launcher and root compatibility launcher contain no duplicate game logic. The existing five legacy games remain explicitly verified by the site artifact gate.

## Living Shelf integration

The Pet Parade Sort Shelf Pack adds an entryway environment, one rotating rescue visitor, seven unique rewards, five deterministic behaviors, one story beat, one Daily event, one share scene, and reduced-motion/contrast copy.

Rewards are the Entryway bench, Collar rack, Name-tag display, Visitor leash, Park photo, Golden buckle board, and Misplaced bell. Unlocks cover the first tutorial, chapter finales, Park Gate story completion, expert mastery, and a no-undo/no-hint discovery. All artwork is original vector drawing inside the Shelf renderer, including the dedicated entryway zone and rescue visitor.

The browser test completed the first tutorial, synchronized one validated duplicate-safe event, unlocked the Entryway bench, selected it, placed it on the Shelf floor, and confirmed the proof status.

## Accessibility

- Native focusable post buttons sit over the canvas and expose bottom-to-top contents, capacity, locks, foster restrictions, and inspection state.
- Tab reaches every action and post; Enter or Space selects; U/Y undo and redo; R restarts; H requests a hint; Escape pauses.
- Drag is never required because tap and keyboard use the same command path.
- Owner identity never relies on color alone.
- Live regions announce moves, completions, arrivals, errors, and settings.
- High contrast, reduced motion, reduced effects, and persistent mute are built in.
- Touch targets and responsive layout were checked at 390×844 with no page-level horizontal overflow.

## Verification record

Final automated gates:

- `npm run typecheck`
- `npm run lint`
- `npm test -- --run` — 15 test files, 67 tests after the 2026-07-21 first-session UX pass
- `npm run build` — 524 transformed modules; Pet Parade chunk 69.86 kB / 23.57 kB gzip, CSS 25.18 kB / 6.11 kB gzip, shared Pixi runtime 476.12 kB / 143.85 kB gzip
- `npm run verify:site` — 17 app routes, 5 legacy games, 9 public artifacts

Headed Chromium browser verification at `http://127.0.0.1:4173` covered:

- Desktop at 1440×1000 and phone at 390×844.
- Direct canonical load and old-link redirect.
- Pointer drag, tap-to-move, and keyboard-only completion.
- Exact undo/redo, restart, pause, legal hint, level-book navigation, and result flow.
- Campaign state persistence across reload.
- Current Daily and all level groups opening correctly.
- The eight-mechanic `The Collar Club` expert board and inspection preview.
- Reduced motion, reduced effects, and high-contrast settings.
- Album image loading and Shelf reward sync/place flow.
- Zero final console errors and zero console warnings; all inspected game, bundle, and image requests returned HTTP 200.

The final pointer regression check caught and fixed the canvas-overlay interception case: drag now uses pointer capture on the native overlay button and resolves the nearest destination, while tap and keyboard remain unchanged. The in-app browser connector itself could not bootstrap in this environment, so the browser checks were completed with the bundled headed Playwright CLI instead.

Pixel sanity checks confirmed both isolated canvas captures were nonblank and visually varied: desktop 988×661 with 9,845 sampled colors and phone 364×561 with 8,983 sampled colors.

Screenshots:

- `output/playwright/pet-parade-desktop-final.png`
- `output/playwright/pet-parade-phone-final.png`
- `output/playwright/pet-parade-canvas-desktop.png`
- `output/playwright/pet-parade-canvas-phone.png`
- `output/playwright/pet-parade-shelf-pack.png`
- `output/playwright/pet-parade-ux-welcome-desktop.png`
- `output/playwright/pet-parade-customer-journey-desktop.png`
- `output/playwright/pet-parade-customer-journey-phone.png`
- `output/playwright/pet-parade-ux-lesson-complete.png`

## Deployment and repository state

No deployment, production configuration, DNS, ad, or analytics change was made. The working directory does not expose functional Git metadata (`git status` reports that it is not a repository), so this implementation could not be committed or tagged here. The files and local verification artifacts are the available handoff boundary.

## Remaining risks

- A physical iOS/Android device pass, Safari pass, real screen-reader pass, 200–400% zoom audit, and production performance/Core Web Vitals run are still required before public release.
- Solver-optimal claims remain bounded for complex boards; a legal authored completion is proven when the state cap is reached, but global optimality is not inferred.
- Every shipped board is mechanically validated, but the complete campaign and expert set still needs wider human pacing, comprehension, and medal-threshold play-testing.
- Audio controls and persistence are verified, but subjective mix quality and mobile-browser audio behavior need device listening.
- The absent Git history prevents a normal commit-based rollback handoff until the workspace is placed under version control or copied into its authoritative repository.

## Recommended next game

Build **Pawbrick Builder** next. It is the next game in the production blueprint and adds a spatial construction lane after the library's routing, untangling, placement, and sorting games. The first coherent slice should be its pure placement/stability model, deterministic validator, and one polished construction table before progression or Shelf rewards are expanded.

## 2026-07-21 first-session UX and customer-journey addendum

The early journey was rebuilt around progressive disclosure and one successful action at a time.

1. The game detail page now sets first-visit expectations and labels the launch action `Start guided practice`.
2. A fresh local save opens a concise welcome dialog explaining the goal, the three move rules, the easiest tap control, drag and keyboard alternatives, unlimited undo, and the absence of a timer.
3. Practice 1 is now `Miso's Missing Tag`: one cat, one misplaced top tag, one authored move, and one automatic collar completion. Its authored opening is preferred over an equally short alternate solve so the visual coach and story never disagree.
4. The board coach advances from `1 · Pick` to `2 · Place`, names the exact source and destination, marks the active post in the canvas overlay, handles an off-path selection with a clear reset instruction, and does not charge a scoring hint.
5. Practice 2 explains the blocking tag before exposing and moving a matching run. Practice 3 adds destination-capacity reminders. Each lesson has a durable learning outcome and three-step progress indicator.
6. During guided practice, Best score, Hint, Redo, secondary navigation, board mechanics, and settings are visually deferred. `How to play`, Undo, Restart, the active rescue card, and the current learning action remain visible. All deferred controls stay available under explicit `More options` and `Board details and accessibility` disclosures.
7. Tutorial completion uses a compact lesson result instead of the full campaign celebration. It states what was learned, records the first Shelf reward without pulling the player away, and focuses the primary continuation action. Practice 3 hands off explicitly to `Start Chapter 1 · Intake Desk`.

Keyboard focus now follows the same journey: the fresh-session dialog focuses `Start guided practice`; closing it focuses the marked source; selecting the source focuses the marked destination; and completion focuses the continuation button. At phone widths, each source/destination change anchors the complete coach card and playable post together in the viewport; desktop keeps its current scroll position. The welcome dialog also suppresses desktop-only keyboard copy on the phone. The game-event callback is held through a stable ref so Shelf synchronization can no longer rerun initial restoration and overwrite the first-win message.

Motion remains limited to compositor-friendly opacity and transform cues. The coach badge's gentle bob and coach-card entrance are declared only inside `prefers-reduced-motion: no-preference`; the existing in-game reduced-motion setting also collapses durations.

Browser verification covered the fresh desktop and 390×844 phone journeys, the welcome dialog, one-move Miso completion, source-to-destination copy transition, success-message preservation after Shelf synchronization, responsive control disclosure, exact 390-pixel page width with no horizontal overflow, and zero final console errors or warnings. The remaining launch evidence is moderated first-time-user testing with people unfamiliar with stack-sort conventions, plus the previously recorded physical-device and assistive-technology passes.
