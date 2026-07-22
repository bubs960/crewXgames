# CrewMultiply Play: Remaining Game Build Prompts

Date prepared: 2026-07-21  
Workspace: `C:\Users\bubs9\apps\games`  
Purpose: six self-contained prompts for fresh Codex builder tasks.

Required companion standard: `GAME-FIRST-SESSION-UX-CUSTOMER-JOURNEY-2026-07-21.md`. Every builder must treat its discovery-to-return journey, progressive disclosure matrix, tutorial acceptance tests, and clean-profile usability gate as part of the definition of done.

## How to use this file

Open a new Codex task in `C:\Users\bubs9\apps\games` and paste only the prompt for the game being built. Build in the listed order unless a later architecture review changes the dependency sequence:

1. Pawbrick Builder.
2. Walkies: Leash Tangle.
3. Castle Cats: Gate Guard.
4. Pet Rescue Conveyor.
5. Snack Stack Safari.
6. Animal Kingdom Builder Defense.

The current verified local baseline on 2026-07-21 had 57 passing tests across 13 files, a successful production build, 17 verified application routes, 5 compatibility game routes, and 9 public/PWA artifacts. Every fresh builder must verify the current baseline again rather than assuming these numbers remain current.

The current source uses `CrewMultiply Play` and `play.crewmultiply.com`, while older planning and package names still contain `TeamMultiply`. Each builder must preserve the brand currently approved in source and must not silently switch the product name or domain. No prompt below authorizes deployment, DNS changes, live ads, analytics, accounts, or legal claims.

## Shared intuitive-first-session standard

This is mandatory for every game below. The games must teach through safe interaction, not through a wall of instructions.

- Level 1 presents one goal, one relevant control, and one immediately useful action.
- The first correct target is visually demonstrated in the board itself. Do not depend on a paragraph above the game.
- Irrelevant controls and advanced HUD data remain hidden until they matter.
- Levels 1-3 have no ads, no timer pressure, no punitive failure, and unlimited correction.
- Teach one verb, let the player repeat it without a cue, then combine it with the next verb.
- On the first wrong action, return the object cleanly and explain the specific cause beside the action. Never open a generic error modal.
- Show cause and effect: support lines bend, leash tension changes, gates update counts, routes highlight, and unstable stacks visibly warn before failure.
- Detect pointer, touch, or keyboard input and show only the relevant control cue.
- Prompts disappear as competence is demonstrated and never cover the active object.
- Every tutorial can be replayed from Help or the level book.
- Contextual help can be disabled, and reduced motion must replace animated coaching with static high-contrast guidance.
- A new player should complete Level 1 in under 60 seconds without opening Help.
- By the end of Level 3, a new player should be able to state the objective and complete one unprompted example.
- Automated tests must prove the tutorial sequence cannot enter an unwinnable state.
- Browser QA must include a clean-profile first-run recording or screenshot sequence, not only experienced-player testing.

---

## Prompt 1: Pawbrick Builder

```text
You are the lead game engineer, puzzle designer, onboarding designer, and visual director for CrewMultiply Play.

Your task is to IMPLEMENT Pawbrick Builder as the next production game in the existing CrewMultiply Play and Living Shelf workspace. Do not stop at a plan, gray-box screenshot, or architecture proposal. Build a complete locally playable production game, verify it in a browser, connect it to the Shelf, and document the result.

WORKSPACE
C:\Users\bubs9\apps\games

READ FIRST
1. REMAINING-GAME-BUILD-PROMPTS-2026-07-21.md, especially the shared intuitive-first-session standard.
2. NEXT-GAME-BATCH-PRODUCTION-BLUEPRINT-2026-07-17.md, Game 1 and shared technical foundation.
3. LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md.
4. PET-PARADE-SORT-PRODUCTION-IMPLEMENTATION-NOTE-2026-07-19.md.
5. COZY-CROCHET-CRITTERS-IMPLEMENTATION-NOTE-2026-07-19.md.
6. The current Vite/React/Pixi workspace, save-data package, game bridge, Shelf Pack contracts, catalog, routes, tests, and latest implementation notes.

Verify the current Git state, tests, build, routes, brand, and package architecture before editing. Work with the existing application. Do not create a parallel app, second save system, or duplicate event contract.

PRODUCT
Name: Pawbrick Builder
Core promise: Build an animal structure, then prove it survives the animal.
Animal cast: cat, dog, rabbit, hamster, and parrot.
Genre: 2.5D spatial construction and stability puzzle.

Do not copy proprietary toy-brick studs, shapes, colors, branding, characters, instruction style, or trade dress. Use original modular construction pieces with their own connector language.

CORE LOOP
1. Read a compact blueprint showing required zones, forbidden zones, and the animal test.
2. Select a piece from a limited tray.
3. Rotate and provisionally place it on an isometric grid.
4. Read support, clearance, load, and connection previews.
5. Confirm the build and run the animal test.
6. Watch forces travel through the structure.
7. Pass, or receive a causal failure report identifying the first structural problem.
8. Repair the design within the level's piece and move constraints.

INTUITIVE OPENING
The opening must teach by doing:

- Tutorial 1, The First Perch: show one base and one highlighted platform. The player places one piece. Mallow the cat steps onto it and the level completes. Hide rotation, budgets, and advanced overlays.
- Tutorial 2, Turn the Ramp: introduce rotate left/right with a translucent destination silhouette. The cat's route preview updates immediately.
- Tutorial 3, Give It Support: let an unsupported platform visibly sag before confirmation. Highlight one brace, allow a harmless repair, then run the first small cat jump.
- Tutorial 4, Your Build: remove the step-by-step cue and ask the player to create a two-piece route using learned controls.
- Tutorial 5, Read the Test: introduce a dog bump with a visible force arrow before the test begins.

Do not lead with a multi-page rules screen. The first playable action must appear within one deliberate click from the game route. Keep a replayable Workshop Lessons section in the level book.

RULE SYSTEMS
- Grid coordinates, footprint, orientation, connector types, material, mass, strength, clearance, load, and art anchors.
- Deterministic placement validation independent of rendering.
- Support graph and disconnected-piece detection.
- Simplified center-of-mass and load propagation with explainable thresholds.
- Clearance paths for animals and moving parts.
- Hinges, ramps, wheels, axles, springs, ropes, and hanging loads introduced gradually.
- Deterministic animal test timelines with visible predicted behaviors.
- Cat: climbs and jumps to the highest intended perch.
- Dog: bumps entrances and carries a toy through clearance routes.
- Rabbit: tests tunnel height and branching paths.
- Hamster: creates wheel-driven vibration and repeating loads.
- Parrot: pulls on bright exposed or hanging components.

CONTROLS
- Fixed isometric 2.5D camera for the first release. No free-orbit camera.
- Stable rotate-left, rotate-right, pan, zoom, undo, redo, erase, test, and reset actions.
- Pointer, touch, and keyboard all dispatch the same game commands.
- Placement remains provisional until release or explicit confirmation.
- Invalid placements return cleanly with a specific visible reason.
- Use generous invisible hit regions, visible snap points, and at least 44x44 CSS pixel touch targets.
- Never charge a resource for undoing or correcting placement.

CONTENT
Build:
- 5 guided tutorial levels.
- 50 campaign levels across six chapters.
- 10 expert blueprints.
- One deterministic Daily Blueprint plus one expert daily variant.

Chapters:
1. Cat Tree Lab: support, platforms, ramps, first jumps.
2. Dog Yard Works: clearance, impact resistance, moving toys.
3. Bunny Burrow Bureau: tunnels, height, branching routes.
4. Hamster Motion Shop: axles, wheels, vibration, compact construction.
5. Bird Balcony: hanging loads, pull forces, tall structures.
6. Shared Pet Palace: combined systems and changed-objective showcase builds.

Levels 1-3 must be almost impossible to fail. Levels 4-10 teach one-rule reasoning. Later chapters combine established rules rather than hiding new rules in difficult boards. Boss builds must change the objective, not merely increase load values.

ENGINE AND VALIDATION
Add a pure TypeScript package such as `packages/pawbrick-builder` containing:
- Model and level schemas.
- Placement commands.
- Undo/redo history.
- Support and load analysis.
- Animal test simulation.
- Small-board solver or constrained validator.
- Difficulty analysis.
- Daily generation from authored modules.
- Scoring, medals, serialization, and events.

Every shipped level must contain a proven completion trace or solver verification. Test at least 100 sequential command/undo/redo operations. Failure reports must identify the first causal failure, not list every later collapse symptom.

PRESENTATION
Use React for menus, level book, settings, results, and accessible controls. Use PixiJS for the high-resolution 2.5D table and animated animal tests.

Visual direction:
- Premium miniature workshop with painted wood, molded recycled plastic, felt, rope, brushed metal, cork, and tiny tools.
- Original construction-piece silhouette and connector system.
- Bevels, wear variation, contact shadows, readable connection highlights, and coherent lighting.
- Stress appears before breakage through bend, wobble, creak, dust, and highlighted force paths.
- Each chapter changes environment, materials, lighting, sound, and animal behavior.
- Failure remains charming and legible. Effects cannot hide the first cause.

Use original bitmap assets for major backgrounds and animal reaction moments where they improve quality. Use the image-generation skill when appropriate, inspect generated files at full resolution, and do not use emoji as game art.

ACCESSIBILITY
- Full keyboard construction and camera operation.
- Non-drag placement path.
- Spoken piece, connector, support, objective, and failure summaries.
- High contrast and non-color support/invalid indicators.
- Reduced motion and reduced effects.
- Persistent audio settings.
- Zoom-safe layouts and stable touch controls.

LIVING SHELF
Create a versioned Pawbrick Shelf Pack using the existing event path. It should contribute construction pieces, ramps, perches, platforms, a workshop or room expansion, and animal support behaviors. Completion events must be durable, retryable, and idempotent. Reloading or replaying cannot duplicate rewards.

SITE AND ROUTES
- Add `/games/pawbrick-builder/` as a truthful detail page.
- Add a lazy-loaded canonical play route following the existing Shelf game pattern.
- Add Pawbrick to catalog filters, Daily, sitemap, offline assets, and related-game navigation only after it is playable.
- Do not break the six current games or their compatibility routes.

MONETIZATION
No live ad, analytics, account, payment, or energy system. No ad request can occur during active play or the animal test. A skilled player must complete the campaign with the default piece access.

VERIFICATION
- Run typecheck, lint, all tests, production build, and site verification.
- Test every shipped level's trace or solver proof.
- Test first-run tutorials from clean storage with no prior knowledge.
- Verify Level 1 completion in under 60 seconds during a small usability rehearsal.
- Test pointer, touch, and keyboard placement.
- Test undo/redo, interrupted sessions, reload restoration, Daily determinism, and duplicate-safe Shelf rewards.
- Browser QA at desktop and phone viewports.
- Capture tutorial, advanced build, animal test, failure report, result, Shelf reward, and phone screenshots.
- Perform canvas-pixel checks and inspect for blank rendering, clipped UI, bad camera framing, blurry art, and overlap.
- Profile 150 visible pieces and provide a 30 FPS battery mode when effects are reduced.

DOCUMENTATION
Create `PAWBRICK-BUILDER-PRODUCTION-IMPLEMENTATION-NOTE-YYYY-MM-DD.md` using the current date. Record architecture, tutorial design, content totals, solver/validator proof, visual assets, routes, Shelf Pack, tests, screenshots, known risks, and exact next step.

NON-GOALS
- No deployment or DNS changes.
- No proprietary brick imitation.
- No free-build mode until campaign placement is proven ergonomic on phones.
- No paid pieces, consumable undo, or ad-gated solutions.
- No unsupported claim that automated solvability equals human balance testing.

FINAL RESPONSE
Report the working local URL, tutorial flow, content count, mechanics, test results, browser evidence, screenshot paths, Shelf rewards, compatibility status, residual risks, and single best next step.

Continue autonomously through implementation and visual verification. The finished game must be understandable before it becomes difficult.
```

---

## Prompt 2: Walkies: Leash Tangle

```text
You are the lead game engineer, graph-puzzle designer, onboarding designer, and visual director for CrewMultiply Play.

Your task is to IMPLEMENT Walkies: Leash Tangle as a production-quality multi-layer routing game inside the existing website and Living Shelf architecture. Build the playable game, not just a design document. Verify it locally on desktop and phone and document the result.

WORKSPACE
C:\Users\bubs9\apps\games

READ FIRST
1. REMAINING-GAME-BUILD-PROMPTS-2026-07-21.md and its shared intuitive-first-session standard.
2. LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md, Future Game: Walkies, Leash Tangle.
3. NEXT-GAME-BATCH-PRODUCTION-BLUEPRINT-2026-07-17.md shared architecture and quality gates.
4. Paws & Yarn Tangle source and catalog description, without treating that lightweight prototype as the target architecture.
5. Current game packages, save system, event bridge, Shelf Packs, site routes, tests, and latest implementation notes.

Verify the current baseline and preserve the approved product brand in source. Extend the existing Vite/React/Pixi workspace. Do not create a parallel app or duplicate save/event system.

PRODUCT
Name: Walkies: Leash Tangle
Core promise: Untangle every leash and create a safe route without releasing a dog or exceeding tension.
Genre: layered graph routing and spatial planning.
Setting: entryway, neighborhood, and park.

This is a deeper successor to the untangle category, not a visual reskin of Paws & Yarn Tangle.

CORE RULES
- Every leash has visible dog and handler endpoints.
- Leashes occupy foreground, middle, or background depth lanes.
- Crossings have explicit over/under order.
- Leashes have visible length and tension limits.
- Handlers may move only through valid standing zones.
- Dogs have deterministic, previewed movement impulses.
- Posts, trees, benches, signs, gates, puddles, and bushes constrain routes.
- Retractable leashes can change length within visible limits.
- Paired dogs may share one handle.
- A level is complete when every route is crossing-safe, within tension, and connected to the correct exit.

INTUITIVE OPENING
- Tutorial 1, One Easy Walk: one dog, one handler, one crossing. Highlight the handler's valid destination and preview the leash uncrossing before the move is committed.
- Tutorial 2, Over and Under: freeze endpoint movement and teach one depth-order toggle using a large, visible crossing badge.
- Tutorial 3, Mind the Tension: show the leash changing from relaxed to taut as the player previews a move. Illegal distance returns harmlessly with a precise tension message.
- Tutorial 4, Around the Tree: teach a fixed post and route segment.
- Tutorial 5, Your First Pack: remove step-by-step cues and ask the player to resolve two dogs using the learned verbs.

The first screen must contain a playable safe move, not a rules essay. Input cues must adapt to touch, pointer, or keyboard. Tutorials remain replayable from the Walk Book.

PLAYER ACTIONS
- Select and move a handler or permitted dog endpoint.
- Change crossing depth where a crossing control exists.
- Route around or release from a permitted post.
- Adjust retractable leash length.
- Open or close a route-layer gate.
- Preview all affected crossings and tension before confirming.
- Undo and redo the complete graph and depth state.

FAIRNESS
- All endpoints, crossings, depth order, route restrictions, and tension are visible.
- No random dog movement during a puzzle.
- An animal impulse is shown before it occurs and can be included in planning.
- Illegal moves consume no life or currency.
- Expert difficulty comes from interdependent routes, not hidden colors, tiny hit targets, or surprise movement.
- Calm planning mode has no timer. Any timed pedestrian crossing belongs only to clearly labeled expert content.

CONTENT
Build:
- 5 guided tutorials.
- 50 campaign levels.
- 10 expert walks.
- Deterministic Daily Walk and expert daily variant.
- Multi-stage neighborhood walks in later chapters.

Campaign chapters:
1. Front Hall: endpoints, crossings, and basic handler movement.
2. Sidewalk School: depth lanes, posts, and gates.
3. Park Benches: fixed obstacles, leash length, and retractable leads.
4. Pack Walk: paired dogs and interacting routes.
5. Rainy Route: puddles, bushes, weather restrictions, and planned dog impulses.
6. Morning Rush: multi-stage walks and optional expert timing.

ENGINE
Create a pure TypeScript package such as `packages/walkies-leash-tangle` with:
- Versioned graph, node, edge, crossing, depth, obstacle, and endpoint schemas.
- Legal move commands and exact undo/redo.
- Geometry and crossing detection.
- Tension and length calculation.
- Deterministic dog impulse simulation.
- Level validation and solution-trace replay.
- Solver support for authored board verification.
- Difficulty scoring.
- Daily generation from verified authored modules.
- Save parsing, scoring, medals, and game events.

Every authored puzzle must include a verified solution trace. Validation must detect impossible endpoint ownership, hidden crossings, invalid depth order, disconnected routes, excessive tension, and tutorial dead states.

PRESENTATION
Use PixiJS for high-density leash curves, animals, depth layers, route previews, and park environments. Use React for the route book, controls, settings, results, and accessible game mirror.

Visual direction:
- Premium illustrated neighborhood and park with crisp depth separation.
- Detailed woven, rope, leather, and retractable leashes with readable material and thickness.
- Expressive original dogs with distinct silhouettes, gaits, ears, tails, and walking preferences.
- Contact shadows and occlusion clarify over/under order.
- Tension appears through curve straightening, handle pull, dog posture, and a non-color meter.
- Environments change by chapter without obscuring route geometry.
- No emoji as primary animals or pieces.

Add restrained leash sway, dog anticipation, paw steps, weather, leaves, and handler reactions. Reduced motion replaces movement with static state changes.

ACCESSIBILITY
- Full keyboard endpoint movement and crossing-order controls.
- Non-drag interaction path.
- Spoken graph summary, selected endpoint, route, crossing count, tension, and obstacle status.
- Owner/dog pairing uses symbol, label, portrait, leash texture, and color.
- High contrast, reduced motion, reduced effects, persistent mute, and large targets.
- Provide a simplified route-list view for nonvisual play if spatial canvas narration alone is insufficient.

LIVING SHELF
Create a versioned Walkies Shelf Pack with a leash rack entrance, four distinct dog residents, retractable leash, park bench, water bottle, tennis ball, front path, park gate, and weather behaviors. Add the Morning Walk Report story/event. Use durable, provenance-preserving, idempotent completion events.

SITE
- Add `/games/walkies-leash-tangle/`.
- Add a lazy-loaded canonical play route following the established Shelf pattern.
- Add truthful catalog, Daily, sitemap, offline, and related-game entries only after the game works.
- Keep Paws & Yarn Tangle independently playable and do not overwrite its save data.

MONETIZATION
No energy, consumable hint, paid undo, live ad, analytics, or active-play interruption. Do not place an ad beside the leash board if it reduces touch space or route readability.

VERIFICATION
- Run typecheck, lint, all tests, production build, and site verification.
- Replay every authored solution trace.
- Test first-run tutorials from empty storage.
- Confirm a new player can solve Tutorial 1 in under 60 seconds and Tutorial 5 without step cues.
- Verify exact undo/redo of graph geometry, depth, tension, gates, and impulse schedule.
- Verify deterministic Daily behavior and resume after reload.
- Test pointer, touch, and keyboard parity.
- Test desktop, phone, landscape, reduced motion, high contrast, and zoom.
- Capture first-run tutorial, advanced multi-layer route, phone, result, and Shelf screenshots.
- Perform canvas-pixel and overlap checks.

DOCUMENTATION
Create `WALKIES-LEASH-TANGLE-PRODUCTION-IMPLEMENTATION-NOTE-YYYY-MM-DD.md` with the current date. Include tutorial evidence, mechanics, content, solver proof, assets, accessibility, Shelf integration, tests, screenshots, risks, and exact next step.

NON-GOALS
- No open-world walking simulation.
- No random dog behavior that invalidates planning.
- No timer in the calm campaign.
- No deployment or DNS change.
- No replacement of Paws & Yarn Tangle.

FINAL RESPONSE
Report the local URL, tutorial sequence, level totals, verified mechanics, test results, browser evidence, screenshots, Shelf rewards, compatibility status, remaining risks, and single best next step.

Continue through implementation and browser QA. The player must understand leash selection, crossing order, and tension before the game asks them to combine those ideas.
```

---

## Prompt 3: Castle Cats: Gate Guard

```text
You are the lead game engineer, action-puzzle designer, onboarding designer, and visual director for CrewMultiply Play.

Your task is to IMPLEMENT Castle Cats: Gate Guard as a polished site-first action and strategy game. Build the deterministic simulation, complete campaign structure, intuitive first session, high-resolution presentation, Living Shelf integration, and local browser verification. Do not stop after a launcher prototype or one endless lane.

WORKSPACE
C:\Users\bubs9\apps\games

READ FIRST
1. REMAINING-GAME-BUILD-PROMPTS-2026-07-21.md and its shared intuitive-first-session standard.
2. NEXT-GAME-BATCH-PRODUCTION-BLUEPRINT-2026-07-17.md, Castle Cats and shared technical foundation.
3. LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md.
4. Current Vite/React/Pixi app, input patterns, save data, event contracts, Shelf Packs, catalog, tests, and latest implementation notes.
5. Pawbrick implementation note and reusable packages if Pawbrick has been completed.

Verify the current workspace and product brand. Extend existing services and patterns. Do not create another app, event bus, save database, or rendering runtime when the current packages can be extended.

PRODUCT
Name: Castle Cats: Gate Guard
Core promise: Aim a small animal squad through meaningful gates, then defend the blanket castle with the exact team you created.
Genre: precision gate shooter plus tactical defense puzzle.

This must not be a passive crowd-growth clone. Success depends on readable arithmetic, geometry, class choices, formation, timing, and defense priorities.

CORE LOOP
1. Inspect the lane, gates, hazards, defense objective, and predicted threat.
2. Aim a bounded stream from the cat launcher.
3. Pass through arithmetic, geometry, class, and formation gates.
4. Avoid or intentionally trade through visible hazards.
5. Assemble the surviving squad at the blanket castle.
6. Set a formation or target priority.
7. Run the deterministic defense phase.
8. Between waves, choose one of three visible tactical upgrades.
9. Protect the treat vault or complete the mission-specific objective.

INTUITIVE OPENING
- Tutorial 1, First Reinforcements: the lane is paused. Show one +3 gate, one trajectory line, and one large aim handle. The player aims through it, sees the count change from 2 to 5, and watches the squad reach an unopposed castle.
- Tutorial 2, Pick the Better Gate: show +2 and x2 from a starting squad of three. Update predicted final counts as the aim crosses each lane so the arithmetic is learned visually.
- Tutorial 3, Bend the Line: introduce one bounce gate with a first-collision preview and no enemies.
- Tutorial 4, Meet the Guard Dog: introduce one class gate and a single armored target whose weakness is stated visually.
- Tutorial 5, First Defense: let the player aim, choose one of two formations, and survive a forgiving wave without step-by-step highlighting.

No tutorial should begin with autoplay chaos. The player must first see that aim changes route, gates change the squad, and the squad determines defense. Keep Lessons at the castle map for replay.

GATES AND UNITS
- Arithmetic: add, multiply, split, and subtract-for-bonus with exact previewed results.
- Geometry: bounce, curve, fan, narrow, moving, and redirect.
- Class: archer cat, guard dog, trapper rabbit, scout owl.
- Formation: line, wedge, shield wall, elevated archers, split defense.
- Hazards: vacuum lanes, puddles, toy hammers, rolling cans, laundry chutes.
- Boss objectives: escort, interrupt, survive, break armor, protect two lanes, or stop a theft.

Every gate displays its effect before firing. Upgrades state exact numbers and tradeoffs. No hidden odds decide whether the base squad succeeds.

SIMULATION
Create a pure TypeScript package such as `packages/castle-cats-gate-guard` with:
- Fixed-timestep simulation independent of render frame rate.
- Unit, gate, launcher, projectile, hazard, enemy, wave, formation, and upgrade schemas.
- Deterministic collision and gate application.
- Compact input replay and simulation checksum.
- Level evaluator for candidate aim paths and outcomes.
- Defense targeting and formation rules.
- Save, scoring, medals, Daily generation, and ecosystem events.

Do not use DOM nodes for crowds. Render pooled units through PixiJS or an existing batching layer. Replays must produce the same result within the documented checksum contract.

CONTENT
Build:
- 5 guided tutorial missions.
- 50 campaign missions.
- 5 objective-changing bosses.
- 15 precision expert missions.
- Deterministic Daily Defense and expert daily variant.

Chapters:
1. Couch Keep: aiming and arithmetic gates.
2. Hallway Siege: moving geometry and two lanes.
3. Laundry Fort: class gates and household hazards.
4. Moonlit Kitchen: formation and target priority.
5. Backyard Bastion: multi-stage missions and bosses.

Difficulty must add interacting decisions, not unreadable speed or multiplied enemy health. The default roster must be capable of completing the base campaign through skill.

PRESENTATION
Use React for mission selection, upgrade choices, settings, results, replay details, and accessible controls. Use PixiJS for the lane, pooled squad, blanket castle, and battle.

Visual direction:
- Rich household fantasy at toy scale.
- Blanket walls, ruler bridges, spool towers, button shields, cardboard battlements, and warm practical lighting.
- Original cats and dogs in readable household-object armor.
- Units remain individually charming through silhouette, class icon, formation spacing, and animation variation.
- Effects include dust, shield flashes, arrows, yarn traps, debris, and restrained impact lighting.
- Slow motion occurs only for decisive moments and lasts no longer than 0.7 seconds.
- Chapters must materially change environment, lighting, props, enemies, and objective framing.

Use original high-resolution assets. Do not use emoji as units or copy characters, gates, UI, or level layouts from existing crowd games.

CONTROLS AND ACCESSIBILITY
- Pointer/touch aim and keyboard aim use the same normalized action.
- Provide a sensitivity setting, aim nudge buttons, and optional aim-lock confirmation.
- Trajectory preview stops at the first collision except in tutorial/accessibility assistance.
- Announce initial squad, highlighted gate sequence, predicted count, class conversion, and defense result.
- Use symbols and text in addition to color.
- Add reduced motion, reduced effects, high contrast, persistent mute, and battery mode.
- Provide a pause-and-plan option in campaign accessibility settings. Pausing cannot change competitive Daily scoring unless clearly classified separately.
- Pause simulation when the tab hides, focus is lost, or a menu opens.

LOSS FEEDBACK
A loss report must identify:
- Units lost at each gate or hazard.
- Squad composition entering defense.
- Defense leaks by lane and enemy type.
- One actionable replay suggestion based on actual facts.

Do not show a generic failure screen or sell an upgrade as the answer.

LIVING SHELF
Create a versioned Castle Cats Shelf Pack with night lighting, blanket-fort architecture, button shields, guard residents, ruler bridge, spool tower, defense keepsakes, and a castle story arc. Events must be durable, provenance-preserving, and idempotent.

SITE
- Add `/games/castle-cats-gate-guard/` and a lazy-loaded canonical play route.
- Add truthful catalog, Daily, sitemap, offline, and related-game entries after the game is functional.
- Preserve all current routes and saves.

MONETIZATION
No energy, paid squad power, random paid roster, ad-gated upgrade, or ad callback inside active play. Do not place ads between aim and defense phases.

VERIFICATION
- Run typecheck, lint, all tests, build, and site verification.
- Verify deterministic replay and checksums.
- Test all authored mission proofs or evaluator constraints.
- Run clean-profile tutorial QA and confirm the player understands aim, gate math, and squad-to-defense transfer by Tutorial 5.
- Test pointer, touch, keyboard, pause, focus loss, background tabs, interrupted saves, and Daily replay.
- Stress-test 500 friendly units and 200 enemies.
- Verify target frame pacing in quality and battery modes.
- Browser QA on desktop and phone, including no clipping or blocked aim region.
- Capture tutorial, large squad, defense, boss, loss report, phone, and Shelf screenshots.
- Perform canvas-pixel checks and inspect every asset request and console message.

DOCUMENTATION
Create `CASTLE-CATS-GATE-GUARD-PRODUCTION-IMPLEMENTATION-NOTE-YYYY-MM-DD.md` with architecture, tutorials, mission totals, replay contract, performance results, assets, routes, Shelf Pack, accessibility, tests, screenshots, risks, and exact next step.

NON-GOALS
- No passive endless runner as the main game.
- No copied gate-game presentation.
- No autoplay tutorial that hides the relationship between choices and results.
- No deployment, live ads, analytics, or accounts.

FINAL RESPONSE
Report the local URL, onboarding sequence, content totals, simulation and replay proof, test results, frame-pacing evidence, screenshots, Shelf rewards, compatibility status, residual risks, and single best next step.

Continue autonomously through implementation and visual QA. Make the first five minutes calm enough to understand and the later missions deep enough to master.
```

---

## Prompt 4: Pet Rescue Conveyor

```text
You are the lead game engineer, real-time routing designer, onboarding designer, and visual director for CrewMultiply Play.

Your task is to IMPLEMENT Pet Rescue Conveyor as a readable, high-detail shelter-routing game in the current site and Living Shelf ecosystem. Build the complete local game, campaign, deterministic simulation, accessible controls, Shelf Pack, and browser verification. Do not stop with a moving-belt demo.

WORKSPACE
C:\Users\bubs9\apps\games

READ FIRST
1. REMAINING-GAME-BUILD-PROMPTS-2026-07-21.md and the shared intuitive-first-session standard.
2. NEXT-GAME-BATCH-PRODUCTION-BLUEPRINT-2026-07-17.md, Pet Rescue Conveyor and shared foundation.
3. LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md.
4. Existing app architecture, save data, game events, Shelf Packs, accessibility patterns, tests, site routes, and current implementation notes.
5. Reusable deterministic scheduling or pathing packages from completed games, if present.

Verify current tests, build, Git state, routes, and approved brand before editing. Extend the existing workspace and service contracts.

PRODUCT
Name: Pet Rescue Conveyor
Core promise: Read each rescue animal's needs, switch the route, and keep the shelter flowing without losing calm or clarity.
Genre: real-time routing, capacity scheduling, and recoverable shelter management.

Wrong routes should create readable, recoverable animal interactions rather than immediate failure. The game can be lively without becoming visually or mechanically chaotic.

CORE LOOP
1. Inspect visible incoming pets, needs, temperament, and care route.
2. Preview the current path through switchable conveyor branches.
3. Change switches or use a temporary pen.
4. Route pets through compatible stations with visible capacity and processing time.
5. Correct recoverable mistakes before stress limits are exceeded.
6. Complete every care task and finish the shift.

INTUITIVE OPENING
- Tutorial 1, Welcome In: keep the belt paused. Show one dog, one destination badge, one switch, and one grooming station. The player taps the switch and sees the full route light up before pressing Start.
- Tutorial 2, One Station at a Time: introduce a second pet and visible station capacity. Pause automatically when the station becomes occupied and ask the player to route the waiting pet to a clearly marked holding pen.
- Tutorial 3, Bring Them Back: intentionally send a cat to the wrong branch, then teach the recoverable return loop without score penalty.
- Tutorial 4, Temperament Matters: show a wet dog and a cat with a visible compatibility warning before they share a pen.
- Tutorial 5, First Shift: remove step cues and run a short, forgiving schedule with a planning pause available.

The first action must happen on a paused board. Do not begin with animals already moving while instructions compete for attention. Keep Shift Training replayable from level selection.

RULE SYSTEMS
- Shelter represented as a directed graph with switchable edges.
- Pets have visible needs, destination, temperament, compatibility, patience, route history, and care state.
- Stations have capacity, accepted needs, processing duration, queue, and output route.
- Temporary pens buy time but can create deterministic interactions.
- Multi-step care routes appear only after direct routing is mastered.
- Priority cases and deadlines use clear forecast bars.
- Disruptions are scheduled and warned before activation.
- Wrong-route events remain recoverable: wet dog shake, cat in a box, rabbit-chewed label, or parrot echo.

REAL-TIME FAIRNESS
- Add player-controlled pause and planning mode throughout the campaign.
- Never make expert stages harder only by making the belt faster.
- Pause timers when the tab is hidden, focus is lost, orientation changes, or a menu opens.
- Resume must restore exact event times, routes, queues, switches, and station work.
- Character animation cannot delay input or obscure need/status indicators.

ENGINE
Create a pure TypeScript package such as `packages/pet-rescue-conveyor` containing:
- Shelter graph and route schemas.
- Switch commands and route preview.
- Pet, need, temperament, compatibility, station, job, queue, and pen models.
- Fixed-step deterministic event scheduler.
- Conflict detection and completion evaluation.
- Arrival schedule verifier and authored proof runner.
- Pause/resume and exact serialization.
- Difficulty analysis, scoring, medals, Daily schedule assembly, and events.

Test interruption at arbitrary simulation ticks. All authored schedules need simulation completion proof or an explicit authored trace.

CONTENT
Build:
- 5 guided training shifts.
- 50 campaign shifts.
- 10 expert shifts.
- Deterministic Daily Shift and expert daily variant.

Chapters:
1. Welcome Desk: one belt and direct stations.
2. Grooming Day: station capacity and processing time.
3. Mixed Company: compatibility and temporary pens.
4. Adoption Event: priority cases, crowds, and multi-step routes.
5. Storm Rescue: warned disruptions and complex scheduling.

Author at least 20 levels before adding disruption modules. Difficulty must grow through simultaneous scheduling decisions and interactions, not unreadable speed.

PRESENTATION
Use PixiJS for the animated shelter cutaway, pets, belts, stations, route previews, and effects. Use React for shift selection, pause/planning controls, settings, results, rescue profiles, and accessible summaries.

Visual direction:
- Bright, detailed rescue intake cutaway with stainless fixtures, colored signs, towels, toys, kennels, plants, and animated stations.
- Strong depth and lane hierarchy so detail never hides routing.
- Original animals with distinct silhouettes, needs, head/ear/tail/body poses, and temperament.
- Route preview highlights the full path before switch confirmation.
- Effects communicate state: clean sparkle, stress ripple, wet shake, fur puff, and restrained adoption celebration.
- Each chapter changes room dressing, weather, station art, staff props, lighting, and animal mix.

Do not use emoji as primary pets or status art. Use original high-resolution assets and inspect generated assets at full size.

CONTROLS AND ACCESSIBILITY
- Pointer/touch switch selection and keyboard graph navigation through one action layer.
- Large switches with anticipatory animation and stable hit areas.
- Screen-reader route list reporting each pet, need, current node, next node, destination, patience, and conflict.
- Symbols, text, portrait, and shape in addition to color.
- High contrast, reduced motion, reduced effects, persistent mute, and adjustable simulation speed.
- A full pause-and-plan mode that remains playable without quick reactions.

SCORING
Score accuracy, calmness, flow, and optional perfect-care chains. Explain every score component. Do not penalize use of accessibility settings. No punitive resource loss after failure.

LIVING SHELF
Create a versioned Pet Rescue Conveyor Shelf Pack with new residents, care stations, temperament traits, adoption records, towels, carrier, grooming props, and rescue-center story beats. All events must use the existing durable, provenance-preserving, idempotent path.

SITE
- Add `/games/pet-rescue-conveyor/` and a lazy-loaded canonical play route.
- Add truthful catalog, Daily, sitemap, offline, and related-game entries after completion.
- Preserve all existing routes, games, and saves.

MONETIZATION
No energy, paid queue capacity, ad-watched rescue, forced interstitial, live analytics, or ad code in active play. Ads cannot appear beside the game if they compress the route map below ergonomic phone size.

VERIFICATION
- Run typecheck, lint, all tests, build, and site verification.
- Verify every arrival schedule.
- Run clean-profile first-session QA and prove the player learns switch, capacity, recovery, and compatibility in that order.
- Test pause, speed controls, background tabs, focus loss, orientation change, interruption, reload, and exact event restoration.
- Test pointer, touch, keyboard, reduced motion, high contrast, zoom, and route narration.
- Browser QA on desktop and phone with no overlapping paths or indicators.
- Capture tutorial, full shift, recovery event, expert shift, result, phone, and Shelf screenshots.
- Perform canvas-pixel checks, console inspection, and asset request validation.

DOCUMENTATION
Create `PET-RESCUE-CONVEYOR-PRODUCTION-IMPLEMENTATION-NOTE-YYYY-MM-DD.md`. Include tutorial design, simulation contract, content totals, schedule proof, visuals, routes, accessibility, Shelf Pack, tests, screenshots, risks, and exact next step.

NON-GOALS
- No unreadable speed escalation.
- No instant failure for a single wrong route.
- No random disruption without warning.
- No deployment, accounts, analytics, or live ads.

FINAL RESPONSE
Report the local URL, onboarding sequence, shift totals, simulation proof, test results, browser evidence, screenshots, Shelf rewards, compatibility status, residual risks, and single best next step.

Continue through implementation and browser QA. The shelter should feel alive, but the player must always understand who needs what and where they are going.
```

---

## Prompt 5: Snack Stack Safari

```text
You are the lead game engineer, physics-puzzle designer, onboarding designer, and visual director for CrewMultiply Play.

Your task is to IMPLEMENT Snack Stack Safari as a polished, predictable physics puzzle in the existing website and Living Shelf ecosystem. Build the complete local game, Matter.js adapter, campaign, animal tests, accessible controls, Shelf Pack, and browser verification. Do not stop with a sandbox tower demo.

WORKSPACE
C:\Users\bubs9\apps\games

READ FIRST
1. REMAINING-GAME-BUILD-PROMPTS-2026-07-21.md and the shared intuitive-first-session standard.
2. NEXT-GAME-BATCH-PRODUCTION-BLUEPRINT-2026-07-17.md, Snack Stack Safari and shared technical foundation.
3. LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md.
4. Current Vite/React/Pixi app, save system, game bridge, Shelf Packs, catalog, tests, and implementation notes.
5. Pawbrick support/load packages and Castle Cats fixed-step patterns if those games are complete and reusable.

Verify current tests, build, Git state, brand, routes, and installed dependency versions before editing. Use Matter.js behind a game-owned adapter. Do not let physics-library objects leak into saves, content schemas, or UI contracts.

PRODUCT
Name: Snack Stack Safari
Core promise: Build a tactile tower, then survive the animal behavior you were shown in advance.
Genre: precision stacking, materials, breakage, and predictable animal-force puzzles.

The animal is part of the equation:
- Cat baps the highest shiny object.
- Dog produces a directional tail gust.
- Rabbit sends one vertical hop impulse.
- Bird pecks a bright exposed item.
- Turtle stabilizes its platform.

No animal behavior may secretly change after the player commits the tower.

CORE LOOP
1. Inspect the objective, object sequence, support area, and animal test forecast.
2. Position and rotate the next snack or toy.
3. Read contact, balance, and optional trajectory previews.
4. Release the object and wait for a clear settle state.
5. Continue until the build objective is met.
6. Run the deterministic animal test.
7. Pass if required objects remain in bounds and unbroken.
8. On failure, view the first destabilizing event and rebuild.

INTUITIVE OPENING
- Tutorial 1, Set the Plate: present one broad plate and one large target shadow. The player moves and drops it. Auto-center within a generous safe zone and complete the level after settling.
- Tutorial 2, Turn the Biscuit: introduce rotation with a matching silhouette and a live footprint preview.
- Tutorial 3, Watch the Balance: stack two objects while a simple center line and support polygon update. Let an unsafe preview wobble without committing failure.
- Tutorial 4, The First Bap: show exactly which shiny object the cat will target, where the force will land, and when. Run a gentle test that teaches the forecast.
- Tutorial 5, Build for the Test: remove placement highlighting and ask the player to protect one target using the learned controls.

Do not start with a tall collapsing tower. The player must learn place, rotate, settle, and forecast in that order. Keep Stack School replayable from the level book.

PHYSICS SYSTEM
- Matter.js behind a stable `PhysicsAdapter` owned by the game.
- Fixed simulation timestep and documented stepping policy.
- Object geometry, mass, center, friction, restitution, break threshold, material, damage states, and art anchors.
- Placement, rotation, provisional ghost, drop, settle, reset, and undo-before-release.
- Settle detection using linear/angular velocity windows and contact stability.
- Break logic based on measured impact impulse and material thresholds.
- Deterministic animal force timelines.
- Restricted support zones, moving platforms, fans, hanging pieces, and timed tests.
- Camera framing follows tower bounds without changing input scale.

Authored levels must be rejected if outcomes vary excessively across supported frame rates or browsers. Record stable solution demonstrations and physics configuration with every level.

CONTENT
Build:
- 5 guided tutorials.
- 50 campaign levels.
- 15 expert challenges.
- Deterministic Daily Stack and expert daily variant.

Chapters:
1. Cat Cafe Counter: balance and first bap.
2. Dog Picnic: friction and tail gusts.
3. Bunny Bakery: bounce and hop impulse.
4. Bird Market: shiny targets and hanging pieces.
5. Safari Banquet: combined animals, moving supports, and changed objectives.

Gray-box at least 30 distinct object shapes before final art. Author and validate 20 levels before expanding material and animal systems. Difficulty must come from geometry, material, order, and forecast interaction, not tiny placement tolerance.

OBJECTS AND MATERIALS
Include readable families such as:
- Ceramic plates and cups.
- Biscuits, crackers, fruit, jelly, and wrapped treats.
- Metal cans and bowls.
- Cardboard snack boxes.
- Rubber balls and squeaky toys.
- Wooden blocks and trays.
- Soft fabric toys.

Each material needs distinct contact sound, surface response, damage behavior, and visual state. Use object-specific reactions: ceramic cracks, biscuit crumbs, jelly wobble, can dents, box creases, and toy squeaks.

PRESENTATION
Use PixiJS for high-resolution object art, background, particles, animals, and camera while Matter.js owns only physics. Use React for level selection, controls, settings, results, replay, and accessible summaries.

Visual direction:
- Detailed, appetizing, toy-like materials with crisp phone-size silhouettes.
- Layered top surface, front edge, contact shadow, damage state, and fragments for each object.
- The tower is always the visual focus.
- Every chapter changes location, time of day, animal audience, props, lighting, and sound.
- Breakage is specific and satisfying but restrained enough to preserve the causal event.
- Use high-resolution original bitmap assets for environments and major animal reactions where appropriate.
- No emoji, copied branded snacks, or recognizable packaging.

FAILURE EXPLANATION
After failure, provide a short causal replay that marks:
- The first destabilizing contact or animal force.
- The support object that slipped, rotated, or broke.
- The objective item affected.
- One factual rebuild clue.

Do not blame every later collision or offer a paid stabilizer.

CONTROLS AND ACCESSIBILITY
- Pointer/touch drag and keyboard nudge/rotate/drop use the same commands.
- Large stable controls and optional placement confirmation.
- Spoken object, position, rotation, support/contact, forecast, settle, and result information.
- High contrast, reduced motion, reduced effects, persistent mute, and 30 FPS battery mode.
- Tutorial and accessibility modes may show trajectory and balance aids; scored expert mode may limit them only if clearly disclosed.
- Reduced motion removes camera impulse and slow motion, not essential state feedback.

SCORING
Use explained medals for height, survival, material constraints, and perfect balance. Accessibility settings cannot reduce rewards. No paid or ad-watched item can alter physics during a scored attempt.

LIVING SHELF
Create a versioned Snack Stack Shelf Pack with food and toy materials, break states, balance events, animal test props, snack shelf, cafe counter, picnic blanket, and deterministic resident reactions. Use the existing durable, idempotent, provenance-preserving event path.

SITE
- Add `/games/snack-stack-safari/` and a lazy-loaded canonical play route.
- Add truthful catalog, Daily, sitemap, offline, and related-game entries after completion.
- Preserve all current games, routes, and saves.

MONETIZATION
No consumable stabilizers, energy, paid physics changes, ad-watched retries, live analytics, or active-play ads. Ads cannot appear between build and animal test.

VERIFICATION
- Run typecheck, lint, all tests, build, and site verification.
- Verify tutorial sequence from clean storage.
- Confirm a new player learns placement, rotation, balance, and animal forecast before Tutorial 5.
- Test stable outcomes across supported Chromium and available Firefox/WebKit automation where practical.
- Test fixed timestep, settle detection, break thresholds, animal timelines, saves, Daily determinism, and Shelf idempotency.
- Test pointer, touch, keyboard, phone, landscape, reduced motion, high contrast, and zoom.
- Profile collision count, particles, audio voices, memory, and sustained frame pacing.
- Capture tutorials, material damage, animal test, causal replay, expert tower, phone, result, and Shelf screenshots.
- Perform canvas-pixel checks and inspect clipping, camera framing, blank rendering, console output, and asset requests.

DOCUMENTATION
Create `SNACK-STACK-SAFARI-PRODUCTION-IMPLEMENTATION-NOTE-YYYY-MM-DD.md`. Record tutorial evidence, physics adapter and configuration, content totals, stability proof, assets, accessibility, routes, Shelf Pack, tests, screenshots, risks, and exact next step.

NON-GOALS
- No uncontrolled physics sandbox as the main campaign.
- No hidden or random animal force.
- No precision demand below reasonable touch accuracy.
- No deployment, accounts, analytics, or live ads.

FINAL RESPONSE
Report the local URL, tutorial sequence, content totals, physics stability evidence, tests, browser results, screenshots, Shelf rewards, compatibility status, residual risks, and single best next step.

Continue autonomously through implementation and visual QA. The spectacle comes after the player understands why the tower stands or falls.
```

---

## Prompt 6: Animal Kingdom Builder Defense

```text
You are the principal game architect, simulation engineer, strategy designer, onboarding designer, and visual director for CrewMultiply Play.

Your task is to IMPLEMENT the first production-ready capstone slice of Animal Kingdom Builder Defense inside the current CrewMultiply Play and Living Shelf ecosystem.

This is intentionally the high-complexity game. Do not pretend to complete a six-to-nine-month capstone in one shallow pass. First audit the reusable engines from Pawbrick Builder, Castle Cats: Gate Guard, Pet Rescue Conveyor, and Snack Stack Safari. Reuse proven systems. Then build Phase A plus one polished Phase B vertical slice with ten playable nights. Document exactly what remains for the full campaign.

WORKSPACE
C:\Users\bubs9\apps\games

READ FIRST
1. REMAINING-GAME-BUILD-PROMPTS-2026-07-21.md and its shared intuitive-first-session standard.
2. NEXT-GAME-BATCH-PRODUCTION-BLUEPRINT-2026-07-17.md, Animal Kingdom Builder Defense and shared foundation.
3. LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md.
4. Implementation notes and pure packages for Pawbrick, Castle Cats, Pet Rescue Conveyor, Snack Stack Safari, Pet Parade, Cozy Crochet, and Living Shelf.
5. Current save, input, rendering, accessibility, event, Shelf Pack, site, test, and PWA contracts.

PREREQUISITE AUDIT
Before editing, make a reuse matrix showing whether these proven capabilities exist:
- Pawbrick grid, placement commands, support/connection rules, and camera.
- Castle Cats fixed-step combat, pooled units, replay, and formations.
- Conveyor path preview, deterministic scheduling, and interruption restore.
- Snack Stack material/force adapter where structural damage is genuinely needed.
- Shared save, event, input, audio, accessibility, and rendering services.

If the required engines do not exist, do not create four rushed replacements. Build only the smallest missing contract required for Phase A, record the dependency gap, and keep the slice honest. Do not advertise the capstone in the public catalog until its vertical slice is genuinely playable.

PRODUCT
Name: Animal Kingdom Builder Defense
Core promise: Build a functional animal sanctuary by day; defend the exact layout at night.
Genre: strategic construction, route shaping, roster placement, and active defense.

CORE LOOP
1. Review a visible threat forecast.
2. Place structures, paths, fences, utilities, and animal stations.
3. Confirm power, food, comfort, support, and path access.
4. Assign a small defender roster.
5. Preview enemy routes and defensive coverage.
6. Start the night wave.
7. Trigger a limited set of visible active abilities.
8. Repair, expand, and choose one transparent strategic upgrade.
9. Survive the expedition and return results to the Living Shelf.

INTUITIVE OPENING
- Tutorial 1, Raise the Cat Tower: use a small prebuilt sanctuary. Ask the player to place one highlighted cat tower on a valid elevated connector. Show range and the enemy path immediately.
- Tutorial 2, First Night: run one slow, nearly impossible-to-lose wave. Teach one cat ability only after the automatic attack is understood.
- Tutorial 3, Add a Guard Dog: return to day, place one dog house beside the path, and show its knockback zone before the next wave.
- Tutorial 4, Keep the Path Open: introduce one fence and demonstrate a blocked-route warning before confirmation.
- Tutorial 5, Your First Plan: give the player a small budget, cat tower, dog house, and two valid approaches. Remove step cues and accept more than one winning layout.

Do not begin with a large base, resource dashboard, roster screen, technology tree, and wave at once. Reveal forecast, place, coverage, battle, ability, repair, and upgrade in that order. Keep Sanctuary Training replayable.

STRATEGIC SYSTEMS
- Cat towers improve range but require elevated, connected support.
- Dog houses create guard and knockback zones.
- Rabbit workshops build and repair traps.
- Owl perches reveal hidden routes and improve forecasts.
- Turtle ponds create durable slow zones.
- Sheep yarn fences slow enemies but are vulnerable to cutting or fire threats.
- Power, food, comfort, support, and path access constrain construction.
- Enemies react to the actual map through visible pathing rules.
- Upgrades provide clear choices and tradeoffs rather than flat mandatory power.

PHASE A: SYSTEMS PROTOTYPE
Implement:
- Reused construction grid and placement commands.
- Reused fixed-step combat and pooled renderer.
- Deterministic pathfinding and route visualization.
- Three structures.
- Two enemy types.
- One defender.
- One five-wave night.
- Exact build-to-battle transition.
- Versioned save/restore at day, dusk, wave, and result boundaries.

PHASE B: POLISHED VERTICAL SLICE
Implement:
- One finished sanctuary biome with day, dusk, and night lighting.
- Three defenders: cat, dog, and rabbit.
- Six structures with real tradeoffs.
- Five enemy types with readable counters.
- One objective-changing boss.
- Ten authored nights, including five tutorial/onboarding missions.
- Visible upgrades, expedition results, save slots, and replay summary.
- At least three missions with two or more genuinely viable layout strategies.
- One deterministic Daily Siege based on the finished slice.

Do not build Phase C's full campaign until this slice passes onboarding, strategy diversity, save, phone, and performance gates.

ENGINE CONTRACTS
Keep pure TypeScript ownership boundaries for:
- Construction commands and validation.
- Utility/resource graph.
- Pathfinding and route forecast.
- Defender placement and coverage.
- Fixed-step battle simulation.
- Enemy targeting and reactions.
- Active ability commands.
- Upgrade effects.
- Replay and checksum.
- Save migration and interrupted-session restore.
- Mission validation, scoring, Daily generation, and events.

Rendering must observe simulation state rather than own game rules. Reuse existing package APIs where possible and document every extension.

STRATEGY AND FAIRNESS
- Every non-tutorial mission in the eventual campaign must target at least three viable strategies. The vertical slice must prove multiple strategies on selected missions.
- Show enemy routes, resistances, target priorities, and upcoming wave composition.
- A skilled player can clear the slice with the default roster.
- No energy timer, random paid roster, ad-gated combat power, or punitive resource loss.
- Difficulty changes enemy logic, terrain, constraints, and objectives, not health alone.
- A loss report identifies route leaks, resource bottlenecks, structure failures, and unused counterplay from actual simulation facts.

PRESENTATION
Use the established PixiJS rendering and batching architecture. Use React for build inventory, forecasts, roster, upgrades, results, settings, and accessible summaries.

Visual direction:
- Detailed animal sanctuary built from original modular materials.
- Clear day/dusk/night transformation without hiding paths or units.
- Strong readable terrain, structure footprint, route, range, resource, and damage layers.
- Animals remain the personality center: cat elevation, dog momentum, rabbit repair, owl observation, turtle stability, sheep yarn engineering.
- Camera remains stable and ergonomic on phone. No free camera that fights placement.
- Quality and battery modes with bounded particles, shadows, lights, and active units.

Use high-resolution original assets. Reuse prior game assets only when world continuity is intentional and licensing/provenance is documented.

ACCESSIBILITY
- Keyboard, pointer, and touch parity for construction, roster, and abilities.
- Non-drag placement and map navigation.
- Spoken route, tile, structure, range, resource, wave, and result summaries.
- Pause-and-plan mode.
- Adjustable simulation speed outside score-verified competitive modes.
- High contrast, reduced motion, reduced effects, persistent mute, large targets, and zoom-safe panels.
- Do not penalize accessibility settings in campaign rewards.

LIVING SHELF
Create a versioned capstone Shelf Pack only for features proven in the vertical slice. It may contribute a sanctuary room, connected paths, night lighting, cat tower, dog house, rabbit workshop, defender residents, and the first household-wide night event. Events must be durable, provenance-preserving, retryable, and idempotent.

SITE
- Add `/games/animal-kingdom-builder-defense/` only when the vertical slice meets its release gate.
- Add a lazy-loaded canonical play route.
- Mark the page accurately as Preview or In Development if only the slice is complete.
- Do not label it as a 40-mission finished campaign.
- Preserve all existing routes, games, saves, PWA behavior, and catalog truthfulness.

MONETIZATION AND ACCOUNTS
No deployment, live ads, analytics, payments, energy, random paid roster, or account requirement. Cloud save and Capacitor packaging belong to a later explicitly approved phase. Guest/local-first play must remain valid.

VERIFICATION
- Run baseline and final typecheck, lint, all tests, production build, and site verification.
- Test first-run onboarding from clean storage and prove the player learns build, range, route, battle, and ability before Tutorial 5.
- Verify deterministic replay and checksums.
- Verify saves at every day/night lifecycle boundary and arbitrary interruptions.
- Verify path updates after every legal structure change.
- Prove multiple winning strategies on selected slice missions.
- Test pointer, touch, keyboard, pause, focus loss, phone layouts, reduced motion, high contrast, and zoom.
- Profile long battles, pooled units, pathfinding, memory, heat proxies, and frame pacing in quality and battery modes.
- Capture each tutorial beat, full day map, night battle, boss, loss report, result, phone, and Shelf screenshots.
- Perform canvas-pixel checks and inspect console, network, layout, and asset failures.

DOCUMENTATION
Create `ANIMAL-KINGDOM-BUILDER-DEFENSE-VERTICAL-SLICE-NOTE-YYYY-MM-DD.md`. Include:
- Reuse matrix.
- Contracts reused or extended.
- Tutorial evidence.
- Phase A and Phase B completion status.
- Mission and system totals.
- Strategy-diversity proof.
- Performance and lifecycle results.
- Routes and Shelf Pack.
- Screenshots.
- Explicit Phase C and Phase D backlog.
- Risks and exact next action.

NON-GOALS
- Do not claim the full capstone is complete after a vertical slice.
- Do not rebuild every prior engine inside this package.
- Do not add cloud accounts, native packaging, endless mode, or a 40-mission campaign during the first slice.
- Do not deploy or change DNS.

FINAL RESPONSE
Report the reuse audit, working local URL, onboarding sequence, slice scope, missions, systems, strategy proof, tests, performance, screenshots, Shelf rewards, deferred Phase C/D work, residual risks, and single best next step.

Continue autonomously through the vertical slice and browser QA. Complexity must arrive in layers the player can understand and in systems the codebase can actually support.
```

---

## Pack completion checklist

Before using a later prompt, confirm the preceding game's implementation note records:

- A clean-profile tutorial rehearsal.
- Actual browser and phone evidence.
- A pure rules/simulation package.
- Versioned save and migration behavior.
- Deterministic Daily content.
- A validated, idempotent Shelf Pack.
- Current build and test results.
- Honest remaining human playtesting and device risks.
- No deployment, DNS, live advertising, or analytics changes without explicit approval.

The critical design rule for the whole batch is simple: teach the player what an action means before testing whether they can plan several actions ahead.
