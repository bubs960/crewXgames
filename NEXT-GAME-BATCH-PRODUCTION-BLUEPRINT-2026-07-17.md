# Animal Puzzle Shelf: Next Game Batch Production Blueprint

Date: 2026-07-17

## Approved Ecosystem Direction

The six-game batch now belongs to the approved **Living Shelf** ecosystem. Each game must remain independently playable and must also ship a versioned Shelf Pack containing an entrance, resident or visitor, functional props, an environment layer, behavior recipes, a story packet, a daily event, and a share scene.

The controlling ecosystem specification is `LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md`. Where the original batch order in this document conflicts with that plan, the Living Shelf plan takes precedence.

## Product Goal

Build five ambitious animal games and one larger capstone game for a shared website. Each game must be immediately understandable, substantially harder than typical ad-driven casual games, visually recognizable in one screenshot, playable with mouse or touch, installable as a PWA, and architected for a later phone wrapper.

The positioning is not "another casual puzzle site." It is:

> Beautiful animal games with real puzzles, fair rules, memorable reactions, and no tricks.

The six-game batch is:

1. Pawbrick Builder - spatial construction and animal-proof engineering.
2. Cozy Crochet Critters - visible-information yarn routing and crochet reconstruction.
3. Castle Cats: Gate Guard - precision gate shooter and tactical defense.
4. Pet Rescue Conveyor - real-time routing and shelter management.
5. Snack Stack Safari - physics stacking with animal behavior.
6. Animal Kingdom Builder Defense - the high-complexity capstone combining construction and defense.

## What Player Reviews Tell Us

### Complaint: the game is an ad delivery system

Players repeatedly object to an ad appearing every level, ads longer than the play session, ads over controls, accidental rewarded-ad taps, broken reward callbacks, and levels intentionally designed to require a booster ad.

Build response:

- Never interrupt an active puzzle, run, construction test, or defense wave.
- No sticky ad may cover the board, HUD, navigation, inventory, or action button.
- Do not place a rewarded-ad button where a player was already rapidly tapping.
- The first three completed games in a session are ad-free.
- A natural-break interstitial may appear only after a result screen is dismissed, never before the player sees the result.
- Cap interstitials at one per 12 minutes and two per session during launch testing.
- Rewarded ads are optional conveniences: one cosmetic reroll, one post-failure replay token, or one extra daily cosmetic chest.
- A rewarded ad can never reveal information required to solve a puzzle.
- If an ad fails or is closed, restore the exact pre-ad state and never consume the reward opportunity.
- Provide a one-time remove-interstitials purchase when the phone version exists. Daily and progression rewards remain available without it.

### Complaint: impossible means manipulated, not difficult

Yarn and sort-game reviews often describe required colors buried under inaccessible pieces, random baskets that make a level unwinnable, insufficient slots, or boosters required to finish. Players accept difficulty when they can identify their mistake; they reject hidden loss conditions.

Build response:

- Every authored puzzle must pass an automated solver before shipping.
- Randomized levels must be generated backward from a solved state.
- Show all strategically relevant information or clearly label what will be revealed next.
- Never alter a puzzle after the player begins it.
- Undo must restore state exactly, including score consequences and random state.
- Hints explain a useful relationship before performing a move.
- Expert difficulty comes from interacting constraints, planning depth, execution, and optional par goals, not missing information.
- Record a solution trace, minimum or estimated move count, branch count, and solver time for every shipped level.

### Complaint: the first hour contains the whole game

Mob, defense, sort, and builder reviews praise the initial loop but describe repeated layouts, recycled waves, cosmetic upgrades that stop changing, and difficulty that disappears after upgrades.

Build response:

- Design each game around at least five mechanic families, not one mechanic repeated with larger numbers.
- Introduce one meaningful rule every four to six levels during the campaign.
- Combine established rules after teaching them separately.
- Change the visual environment every chapter, with new object sets, lighting, sound, and animal behavior.
- Boss or showcase levels must change the objective, not merely add health.
- Daily challenges use deterministic seeds plus a verified solvability check.
- Upgrades add choices and tradeoffs; they do not simply overpower old content.

### Complaint: controls and camera fight the player

Builder reviews cite accidental block placement, awkward cameras, blocked UI, small touch targets, and expensive mistakes. Similar complaints appear when tower merging or dragging is finicky.

Build response:

- Use an isometric 2.5D camera for Pawbrick rather than free-orbit 3D in the first release.
- Provide rotate-left, rotate-right, pan, zoom, undo, redo, and erase as stable controls.
- Minimum touch target is 44 by 44 CSS pixels.
- Drag targets have generous invisible hit regions and visible snap previews.
- A placement is provisional until release; invalid placement returns cleanly.
- Never charge currency for correcting a placement.
- Offer keyboard, pointer, and touch controls from the same input-action layer.
- Pause timers when the tab is hidden, a menu opens, or the game loses focus.

### Complaint: grind and randomness replace mastery

Defense reviews object to abrupt progression walls, opaque drop rates, mandatory farming, energy systems, and random units that determine success before play begins.

Build response:

- No energy system.
- Campaign progress is unlocked through completion, not waiting.
- Random choices use visible odds and a bounded offer system.
- A skilled player can clear the base campaign using the default roster.
- Failed attempts earn knowledge and a small deterministic unlock meter, never a punitive resource loss.
- Difficulty modes change enemy logic, constraints, and scoring instead of multiplying health alone.

## Shared Site-First Technical Foundation

The current single-file games prove concepts well, but this batch should move to a shared application architecture before production art and level volume expand.

Recommended stack:

- Vite plus TypeScript for the site and game shells.
- React for menus, navigation, settings, results, Living Shelf journal screens, and ad slots.
- PixiJS for high-resolution 2D and 2.5D rendering.
- Matter.js for Snack Stack Safari physics.
- Web Audio API with a shared sound manager.
- IndexedDB for campaign saves, replays, daily states, and settings.
- Local storage only for tiny preferences and migration flags.
- Service worker and web manifest for installation and offline campaign play.
- Capacitor later for iOS and Android packaging without rewriting the games.
- Vitest for logic, solver, progression, and serialization tests.
- Playwright for complete browser flows, screenshots, touch emulation, and layout checks.

### Shared repository structure

```text
games/
  apps/
    web/
      src/pages/
      src/components/
      src/routes/
  games/
    pawbrick-builder/
      src/core/
      src/render/
      src/ui/
      src/content/
      tests/
    crochet-critters/
    castle-cats/
    rescue-conveyor/
    snack-stack/
    kingdom-defense/
  packages/
    game-shell/
    input/
    audio/
    save-data/
    progression/
    ads/
    analytics/
    accessibility/
    rendering/
  public/
    assets/
      shared/
      pawbrick/
      crochet/
      castle-cats/
      conveyor/
      snack-stack/
      kingdom/
```

### Shared game contract

Every game implements the same lifecycle:

1. `mount(container, services)` creates the game.
2. `load(contentId)` loads an authored level or deterministic daily seed.
3. `start()` begins input and simulation.
4. `pause(reason)` freezes simulation, timers, audio, and effects.
5. `resume()` restarts only after assets and focus are ready.
6. `serialize()` returns a versioned save state.
7. `restore(save)` validates and restores state.
8. `getResult()` produces score, completion, medals, and replay data.
9. `destroy()` removes listeners, textures, audio nodes, and timers.

### Shared player experience

Every game page contains:

- Compact site header with Home, Games, Daily, Collection, sound, and settings.
- Full-width game stage sized to the available viewport.
- A game-specific HUD outside critical play space.
- Pause, restart, undo when applicable, and accessible help.
- A result screen with score reasoning, next level, replay, and share card.
- A related-game link after results, not during play.
- Reserved ad regions with fixed dimensions to prevent layout shift.

### Graphics quality bar

"High resolution" is not just larger files. It requires a consistent rendering pipeline:

- Author master art at 4x the intended CSS display size.
- Export sprite atlases at 1x, 2x, and 3x density where practical.
- Use lossless PNG or WebP for sharp transparent objects and AVIF/WebP for backgrounds.
- Use signed-distance-field text or DOM text for crisp labels; do not rasterize instructions into art.
- Use physically coherent key light, fill light, contact shadow, rim light, and material response.
- Give every interactive object a readable silhouette at phone size.
- Use normal-like highlight overlays, ambient occlusion, soft contact shadows, particles, and subtle secondary motion.
- Build effects from reusable components: impact ring, dust, fibers, crumbs, sparks, wobble, squash, stretch, camera impulse, and material fragments.
- Limit active particles and pool sprites to prevent heat and battery complaints.
- Target 60 FPS on a midrange phone and provide a 30 FPS battery mode.
- Avoid real-time blur, giant transparent layers, excessive filters, and unbounded particles.

### Difficulty and content pipeline

Every level file includes:

```text
id, chapter, rules, initialState, objective, parMoves, parTime,
solverVersion, solutionTrace, difficultyScore, tags, tutorialBeat,
artSet, audioSet, reward, analyticsVersion
```

Difficulty is scored from:

- Minimum solution length.
- Number of viable first moves.
- Number of misleading but recoverable branches.
- Required lookahead depth.
- Number of interacting rule families.
- Motor/execution demand.
- Time pressure, if present.

Each campaign follows this ladder:

- Levels 1-3: interaction teaching, no ads, almost impossible to fail.
- Levels 4-10: one-rule reasoning and clear recovery.
- Levels 11-20: two-rule combinations and optional par goals.
- Levels 21-35: multi-stage boards and first expert constraints.
- Levels 36-50: chapter mastery and altered-objective bosses.
- Expert cases: no tutorial assists, deeper lookahead, separate leaderboard.
- Daily: one normal and one expert seed, identical for every player that day.

## Game 1: Pawbrick Builder

### Product summary

A 2.5D construction puzzle in which players build useful animal structures and then watch an animal physically test them. It borrows the satisfaction of snap-together toys without copying proprietary brick shapes, studs, branding, colors, characters, or instructions.

### Standout hook

The build is not finished when it looks correct. It must survive the animal.

A cat climbs and leaps onto the highest platform. A dog bumps the entrance while carrying a toy. A rabbit tests tunnel clearance. A hamster runs a wheel that transmits vibration. A parrot pulls on bright loose pieces. The player is designing for behavior, not merely matching a silhouette.

### Core rules

1. Select a structural piece from a limited tray.
2. Rotate and place it on an isometric grid.
3. Pieces require valid support and connection points.
4. The blueprint defines mandatory zones, forbidden zones, and functional goals.
5. Run the animal test.
6. Forces travel through connected pieces.
7. Loose, overloaded, blocked, or unbalanced components visibly fail.
8. Repair the build within the piece and move budget.

### Mechanic families

- Support: center of mass must remain over connected support.
- Clearance: an animal or moving part must fit through a route.
- Load: heavy beds, bowls, or animals require stronger pieces.
- Motion: hinges, wheels, ramps, and springs create dynamic forces.
- Behavior: each animal follows a predictable but distinct test path.
- Economy: expert levels restrict piece type, count, rotations, or anchor points.

### Campaign outline

- Chapter 1, Cat Tree Lab: supports, platforms, ramps, first cat jump.
- Chapter 2, Dog Yard Works: wide entrances, impact resistance, moving balls.
- Chapter 3, Bunny Burrow Bureau: tunnels, clearance, branching routes.
- Chapter 4, Hamster Motion Shop: axles, wheels, vibration, compact builds.
- Chapter 5, Bird Balcony: hanging loads, pull forces, tall structures.
- Chapter 6, Shared Pet Palace: all systems combined.

### Line-by-line implementation guide

1. Define grid coordinates, piece schema, connectors, weight, strength, and footprint.
2. Build deterministic placement validation without rendering.
3. Add undo and redo as command objects and test 100 sequential actions.
4. Implement support graph and disconnected-piece detection.
5. Implement simplified center-of-mass and load propagation.
6. Create a headless animal test that emits timed force events.
7. Build a solver that searches a constrained piece inventory for small boards.
8. Author ten gray-box levels and verify every solution.
9. Build the isometric PixiJS renderer with pan, zoom, and fixed camera rotations.
10. Add placement ghost, snap points, valid/invalid material, and touch hit areas.
11. Add provisional placement and release confirmation.
12. Animate structural stress before failure so failure is understandable.
13. Add material fragments, dust, wobble, sound, and restrained camera impulse.
14. Create the cat, dog, rabbit, hamster, and bird test animations.
15. Add blueprint overlay, objective panel, piece tray, and test button.
16. Add a failure report that highlights the first causal failure, not every symptom.
17. Build Chapters 1 and 2 to 20 levels before adding more piece types.
18. Add daily blueprints generated from authored modules and solver verification.
19. Add free-build mode only after campaign controls test well on phones.
20. Add share rendering showing the build, animal test verdict, and score.

### Visual brief

- Premium miniature workshop aesthetic: painted wood, molded recycled plastic, felt, rope, brushed metal, and cork.
- Deep tabletop scene with foreground tools and a softly active workshop beyond.
- Pieces have bevels, contact shadows, wear variation, and connection highlights.
- Animal animation carries personality: anticipation, test, reaction, verdict.
- Failure is delightful and legible, never visually noisy enough to hide the cause.

### Definition of done

- 50 campaign levels, 10 expert levels, and daily mode.
- Every level solver-verified and tagged by mechanic.
- Full campaign is possible with no ad or paid piece.
- Touch placement error rate under 3 percent in a 20-action usability test.
- Stable 60 FPS with 150 visible pieces on target desktop and phone profiles.

## Game 2: Cozy Crochet Critters

### Product summary

A tactile yarn-routing and pattern-reconstruction puzzle. Players pull visible yarn through hoops, pins, and stitch channels to complete dimensional animal portraits. It combines sorting, routing, and spatial planning while preserving the relaxing fiber-art fantasy.

### Standout hook

The completed puzzle becomes a richly animated crochet animal that wakes up, stretches, or reacts to the final stitch. The player always sees enough information to reason; the game never buries a required color behind ad-gated randomness.

### Core rules

1. Yarn spools have visible color, remaining length, and next stitch destination.
2. A strand may pass through compatible stitch channels and around pins.
3. Crossing, knotting, tension, and limited length constrain the route.
4. Completed stitch groups fill a section of the animal pattern.
5. The puzzle ends when every required section is correctly stitched without illegal crossings or excess tension.

### Mechanic families

- Color order and spool access.
- Non-crossing path routing.
- Tension and maximum path length.
- Locked pins and one-way hooks.
- Shared multi-color junctions.
- Repair challenges with pre-existing incorrect stitches.

### Campaign outline

- Chapter 1, Kitten Squares: color order and simple paths.
- Chapter 2, Puppy Patches: pins and route planning.
- Chapter 3, Bunny Loops: tension and limited length.
- Chapter 4, Sheep Studio: multi-strand junctions.
- Chapter 5, Foxy Fixes: repair and reverse reasoning.
- Chapter 6, Friendship Blanket: large multi-animal patterns.

### Line-by-line implementation guide

1. Define board graph, stitch nodes, pins, channels, spool lengths, and completion requirements.
2. Build route validation and crossing detection as pure TypeScript.
3. Build exact undo/redo for every path edit.
4. Build a small-board solver and a verifier for authored larger boards.
5. Generate candidate puzzles backward from completed stitch graphs.
6. Reject candidates with forced guesses, duplicate states, or booster-only solutions.
7. Add a visible next-stitch queue and spool-length preview.
8. Gray-box 20 levels across three mechanic families.
9. Build yarn as a smooth rendered spline with fiber texture and tension response.
10. Add touch-friendly control points and magnetic snapping.
11. Animate yarn traveling through the chosen route rather than teleporting.
12. Add stitch formation, loose fiber particles, fabric compression, and soft audio.
13. Render the animal portrait progressively beneath the stitch grid.
14. Add a final character wake-up animation unique to each portrait.
15. Add hints that highlight a constraint relationship for five seconds.
16. Add a challenge medal for no undo, minimum length, and perfect tension.
17. Build 60 campaign patterns from modular authored graphs.
18. Add Daily Hoop and Weekly Blanket modes.
19. Add a pattern book and high-resolution share card.
20. Test every board at phone width for color differentiation and finger occlusion.

### Visual brief

- Macro fiber-art presentation with visible yarn twist, fuzz, stitch depth, and fabric shadows.
- Warm craft-table lighting balanced with colorful spools, metal hooks, patterned scissors, and animal-shaped pin cushions.
- Avoid a uniformly beige cozy palette; use clear coral, teal, golden yellow, leaf green, ink, and natural fiber neutrals.
- The final animal should feel collectible enough to motivate completion by appearance alone.

### Definition of done

- 60 campaign levels, 12 expert repairs, daily and weekly modes.
- Zero unsolvable seeds in a 100,000-seed generation test.
- No level requires hidden information.
- Color-blind symbols and high-contrast strand outlines are available.
- A complete undo chain restores initial state byte-for-byte.

## Game 3: Castle Cats: Gate Guard

### Product summary

A skill-and-strategy action puzzle in which a cat archer fires squads through mathematical and behavioral gates to defend a blanket castle. The appeal of crowd multiplication remains, but success depends on aiming, gate order, squad composition, and tactical timing rather than watching numbers grow.

### Standout hook

Every projectile is a tiny rescue animal with a role. The player is creating a coordinated defense team, not an anonymous crowd. Gates can help, redirect, specialize, or create tradeoffs.

### Core rules

1. Aim the launcher while the lane scrolls or advances in stages.
2. Fire a bounded stream through gates.
3. Gates modify count, class, direction, speed, element, or formation.
4. Units collide with hazards and join the castle defense line.
5. The defense phase uses the exact squad the player produced.
6. Between waves, choose one of three visible tactical upgrades.
7. Clear the stage by protecting the treat vault through all waves.

### Mechanic families

- Arithmetic gates: plus, multiply, split, subtract-for-bonus.
- Geometry gates: bounce, curve, fan, narrow, moving.
- Class gates: archer cat, guard dog, trapper rabbit, scout owl.
- Hazards: vacuum lanes, puddles, toy hammers, rolling cans.
- Defense formations and target priorities.
- Boss objectives: escort, interrupt, survive, break armor, protect two lanes.

### Campaign outline

- Chapter 1, Couch Keep: aiming and arithmetic gates.
- Chapter 2, Hallway Siege: moving geometry and two lanes.
- Chapter 3, Laundry Fort: class gates and environmental hazards.
- Chapter 4, Moonlit Kitchen: formation and target priority.
- Chapter 5, Backyard Bastion: multi-stage missions and bosses.

### Line-by-line implementation guide

1. Build a fixed-timestep simulation independent from frame rate.
2. Define unit, gate, projectile, hazard, enemy, and wave schemas.
3. Implement deterministic collision and gate application.
4. Record input as a compact replay and verify deterministic playback.
5. Create a level evaluator that simulates candidate aim paths and outcomes.
6. Build three launcher patterns and six gate types in gray box.
7. Add a tactical defense phase using the generated squad.
8. Author 15 levels with increasing path and defense interaction.
9. Add pointer and touch aiming with trajectory preview limited to the first collision.
10. Build pooled unit rendering so hundreds of characters do not create DOM nodes.
11. Add readable team colors, silhouettes, class icons, and formation spacing.
12. Add impact reactions, dust, shield flashes, arrows, debris, and layered sound.
13. Add slow motion only for decisive moments and never longer than 0.7 seconds.
14. Add three-choice upgrades with exact numeric effects visible.
15. Add a post-loss tactical report: gate losses, hazard losses, and defense leaks.
16. Add handcrafted bosses with altered objectives every ten levels.
17. Add campaign difficulty and a separate precision expert mode.
18. Add daily fixed-loadout defense and replay-based score verification.
19. Add battery mode with fewer particles and simplified shadows.
20. Stress-test 500 active units and 200 enemies on target hardware profiles.

### Visual brief

- A richly lit household fantasy viewed at toy scale: blanket walls, ruler bridges, spool towers, button shields, and cardboard battlements.
- Cats and dogs have readable armor assembled from household objects.
- Crowds remain individually charming but use animation variation and batching.
- Environments change strongly by chapter to answer repetition complaints.

### Definition of done

- 50 campaign stages, 5 bosses, 15 expert stages, daily defense.
- Deterministic replay within an agreed simulation checksum.
- No upgrade choice is ad-gated.
- Active gameplay contains no ad request or ad callback code path.
- Target frame pacing holds during the largest authored wave.

## Game 4: Pet Rescue Conveyor

### Product summary

A real-time routing puzzle set in a lively animal rescue intake room. Players inspect incoming pets, switch conveyor branches, manage temporary holding spaces, and route each animal to the correct care station before the shelter becomes overwhelmed.

### Standout hook

Wrong routing creates recoverable animal comedy and new tactical problems instead of instant failure. A wet dog shakes near cats, a cat occupies an empty box, a rabbit chews a label, or a parrot repeats an incorrect destination cue. The shelter feels alive while remaining mechanically readable.

### Core rules

1. Pets enter with visible need icons, temperament, and destination.
2. Tap or drag switches to route them through the shelter.
3. Stations have capacity, processing time, and compatibility rules.
4. Temporary pens buy time but create interactions.
5. Complete all care tasks with limited mistakes, stress, or elapsed time.

### Mechanic families

- Branch routing and switch timing.
- Capacity scheduling.
- Compatibility and separation.
- Priority cases with deadlines.
- Environment disruptions with clear warning.
- Multi-step care routes.

### Campaign outline

- Chapter 1, Welcome Desk: one belt and direct destinations.
- Chapter 2, Grooming Day: capacity and processing time.
- Chapter 3, Mixed Company: compatibility and temporary pens.
- Chapter 4, Adoption Event: priority cases and crowds.
- Chapter 5, Storm Rescue: disruptions and multi-step routes.

### Line-by-line implementation guide

1. Define the shelter as a directed graph with switchable edges.
2. Define pet needs, compatibility, patience, route history, and station jobs.
3. Build deterministic event scheduling and pause behavior.
4. Build path preview and conflict detection.
5. Add a simulation verifier for every authored arrival schedule.
6. Create one-belt gray box with three pet types and three stations.
7. Add recoverable wrong-route behavior and clear correction actions.
8. Add capacity, processing, and temporary holding mechanics.
9. Author 20 levels before introducing random disruptions.
10. Render the shelter as an animated cutaway with clear conveyor layers.
11. Give every pet a silhouette, need badge, destination color, and accessible symbol.
12. Add anticipatory switch animation and route highlight on touch.
13. Add character reactions that never obscure state or delay input.
14. Add chapter-specific rooms, weather, staff props, and station animations.
15. Add scoring for accuracy, calmness, flow, and optional perfect-care chains.
16. Add a planning pause to expert levels with a limited number of uses.
17. Add Daily Shift from verified authored arrival modules.
18. Add rescued-animal profiles and shelter-photo share cards.
19. Run tests for background-tab pause, orientation change, and interrupted sessions.
20. Tune expert stages around simultaneous decisions, not faster conveyor speed alone.

### Visual brief

- Bright, detailed shelter cutaway with stainless fixtures, colored signage, towels, toys, kennels, plants, and animated care stations.
- Characters use expressive head, ear, tail, and body poses.
- Clear lane color and depth hierarchy prevents detail from reducing readability.
- Effects communicate state: clean sparkle, stress ripple, wet shake, fur puff, happy adoption confetti.

### Definition of done

- 50 campaign shifts, 10 expert shifts, daily mode.
- Every arrival schedule is completion-tested by simulation or authored proof.
- No important status relies on color alone.
- Resuming after interruption restores all event times and routes exactly.
- Expert difficulty comes from scheduling and interaction, not unreadable speed.

## Game 5: Snack Stack Safari

### Product summary

A precision physics puzzle in which players build precarious snack and toy towers, then survive a predictable animal behavior test. It delivers tactile stacking, breakable objects, and dramatic physical reactions while preserving puzzle fairness.

### Standout hook

The animal is part of the level equation. The player knows that the cat will bap the highest shiny object, the dog will create a tail gust, the rabbit will send one vertical hop impulse, the bird will peck a bright item, and the turtle will stabilize its platform.

### Core rules

1. Place a limited sequence of objects in the build area.
2. Rotate and position each object before release.
3. Objects differ in shape, mass, friction, break strength, and bounce.
4. Meet height, order, inclusion, or balance objectives.
5. Run a timed animal test.
6. Pass if the required objects remain in bounds and unbroken through the test.

### Mechanic families

- Shape and center-of-mass stacking.
- Material friction and breakability.
- Ordered-object placement.
- Restricted support zones.
- Animal force profiles.
- Moving platforms, fans, and timed events.

### Campaign outline

- Chapter 1, Cat Cafe Counter: balance and first bap.
- Chapter 2, Dog Picnic: friction and tail gusts.
- Chapter 3, Bunny Bakery: bounce and hop impulse.
- Chapter 4, Bird Market: shiny targets and hanging pieces.
- Chapter 5, Safari Banquet: combined animals and moving supports.

### Line-by-line implementation guide

1. Integrate Matter.js behind a game-owned physics adapter.
2. Use a fixed timestep and deterministic-enough authored test conditions.
3. Define object geometry, mass, friction, restitution, break threshold, and art anchor.
4. Build placement, rotation, drop, undo-before-release, and reset controls.
5. Add a settle detector based on velocity and angular velocity windows.
6. Add break logic driven by impact impulse and material threshold.
7. Add animal tests as deterministic force timelines.
8. Gray-box 30 object shapes before producing final art.
9. Author 20 levels and record stable solution demonstrations.
10. Reject levels whose results vary excessively across supported frame rates.
11. Build layered object art with front edge, top surface, contact shadow, damage state, and fragments.
12. Add object-specific reactions: ceramic cracks, biscuit crumbs, jelly wobble, can dents, toy squeaks.
13. Add camera framing that follows tower bounds without changing control scale.
14. Add trajectory and balance hints only in tutorial and accessibility modes.
15. Add slow-motion fracture and a clear causal replay after failure.
16. Add height, survival, material, and perfect-balance medals.
17. Build 50 campaign levels and 15 expert challenges.
18. Add Daily Stack with a fixed object sequence shared by all players.
19. Add tower portrait and short replay share export.
20. Profile collision count, particles, audio voices, and temperature behavior.

### Visual brief

- High-detail food and toy materials with appetizing surfaces and strong silhouettes.
- Each chapter has a different location, time of day, animal audience, and prop language.
- The tower is always the visual focus; background depth supports it without competing.
- Break effects are object-specific and generously animated.

### Definition of done

- 50 campaign levels, 15 expert levels, daily mode.
- Stable outcomes on supported browsers for every authored level.
- Failure replay identifies the first destabilizing event.
- Reduced-motion mode removes camera impulse and slow motion.
- No paid or ad-watched item changes physics during a scored attempt.

## Game 6: Animal Kingdom Builder Defense

### Product summary

The capstone combines strategic construction, route shaping, hero placement, and active defense. During the day, players build an animal sanctuary from functional pieces. At night, the exact layout becomes the defense map.

### Why this is the complex game

It unifies the best systems from the batch: Pawbrick construction, Castle Cats combat, Conveyor routing, Snack Stack material behavior, and the shared animal collection. It should begin only after those systems are stable enough to reuse rather than rewrite.

### Core loop

1. Review the upcoming threat forecast.
2. Place structures, paths, fences, utilities, and animal stations.
3. Assign a small defender roster.
4. Start the night wave.
5. Trigger limited active abilities while the simulation runs.
6. Repair, expand, and choose one strategic upgrade.
7. Survive a multi-night expedition and return with cosmetic and roster rewards.

### Strategic systems

- Cat towers improve range but require elevated connected structures.
- Dog houses create guard and knockback zones.
- Rabbit workshops build and repair traps.
- Owl perches reveal hidden routes and forecast enemies.
- Turtle ponds create durable slow zones.
- Sheep yarn fences slow enemies but are vulnerable to fire or cutting units.
- Power, food, comfort, and path access constrain overbuilding.
- Enemies react to the map through visible pathing rules.

### Production phases

Phase A, systems prototype:

1. Reuse Pawbrick grid and placement commands.
2. Reuse Castle Cats fixed-step combat and pooled renderer.
3. Add pathfinding and route visualization.
4. Add three structures, two enemy types, one defender, and one five-wave night.
5. Prove build-to-battle transition and deterministic save restore.

Phase B, vertical slice:

1. Build one polished biome with day, dusk, and night lighting.
2. Add three defenders, six structures, five enemies, one boss, and ten nights.
3. Add upgrade choices with visible tradeoffs.
4. Add expedition results, save slots, and replay summary.
5. Validate that multiple layouts can win through different strategies.

Phase C, campaign:

1. Add four biomes with rule-changing terrain.
2. Add six animal classes and 24 structures.
3. Add 40 authored missions plus an endless verified ruleset.
4. Add daily siege with fixed seed and roster.
5. Add cosmetic sanctuary progression and animal biographies.

Phase D, phone and live readiness:

1. Optimize simulation workers and rendering batches.
2. Add cloud-save account option while retaining guest play.
3. Add Capacitor packaging, native safe areas, haptics, and lifecycle handling.
4. Add anti-cheat score validation only where leaderboards require it.
5. Run long-session heat, memory, interruption, and offline tests.

### Definition of done

- Ten-hour base campaign without mandatory grind.
- At least three viable strategies for each non-tutorial mission.
- Build, battle, and resume work on desktop and phone layouts.
- No energy timer, random paid roster requirement, or ad-gated combat power.
- Stable 30 FPS battery mode and 60 FPS quality mode on target devices.

## Website, Ads, and Phone Roadmap

### Site map

```text
/
  New visitor homepage or returning-player Living Shelf preview
/games/
  Filterable shelf with difficulty, duration, genre, and animal
/games/pawbrick-builder/
/games/cozy-crochet-critters/
/games/castle-cats-gate-guard/
/games/pet-rescue-conveyor/
/games/snack-stack-safari/
/games/animal-kingdom-builder-defense/
/daily/
  Shared daily board, Mischief Report status, archive
/shelf/
  Full interactive Living Shelf environment
/shelf/journal/
  Residents, object provenance, discoveries, and story archive
/about/
/privacy/
/ads-and-rewards/
```

### Ad placement policy

- Desktop top ad: below site header and above game introduction, never between title and Play.
- Desktop side ad: only when at least 320 CSS pixels remain outside the game stage.
- Mobile ad: below the result screen or game description, never sticky over play.
- Interstitial: only after results are acknowledged and subject to session/time caps.
- Rewarded: explicit user action from a dedicated reward panel with a confirmation state.
- No ad requests during active play; preload only from menus or results.
- Reserve exact ad dimensions to prevent layout shifts.
- Label ads clearly and maintain visual separation from game controls.
- Disable personalized ads until consent is established where required.
- Use a child-safety review before claiming the site is directed to children; animal art alone does not decide legal audience.

### Phone path

1. Make every game responsive and touch-complete on the website.
2. Make the site installable as a PWA and support offline campaign assets.
3. Add safe-area insets, orientation behavior, background pause, and low-power mode.
4. Package the unchanged web build with Capacitor.
5. Replace browser ad adapters with native provider adapters behind the same interface.
6. Add native haptics, share sheet, review prompt, and store compliance.
7. Test save migration between web versions before offering account sync.

## Batch Production Order

### Stage 0: Living Shelf contract, one to two weeks

Finalize the Shelf Pack, ecosystem event, collectible, behavior recipe, and world-state contracts. Define the first Counter Cat props, behaviors, and story beats.

Exit gate: one Counter Cat completion can be traced from result event to validated unlock to placeable object without an unresolved contract decision.

### Stage 1: ecosystem foundation and Counter Cat vertical slice, nine to fifteen weeks

Build the shared save system, pack loader, behavior engine, gray-box room, production room, Counter Cat and House Dog residents, 20 props, 25 behavior recipes, and the first Mischief Report.

Exit gate: complete the full puzzle-to-unlock-to-placement-to-reaction-to-report loop on desktop and phone.

### Stage 2: connect the current five games, four to seven weeks

Create and validate Shelf Packs for Counter Cat, Mosaic Meadow, Pup & Purr Bento, Paws & Yarn Tangle, and Pet Parade Sort. Preserve existing progress wherever it can be proven.

Exit gate: every current game changes the shared world through the same event bridge without depending on another game.

### Stage 3: web production readiness and soft launch, eight to fourteen weeks

Complete daily reports, journal depth, accessibility, legal and privacy work, offline behavior, conservative ad integration, launch QA, and a limited web release.

Exit gate: the ecosystem has no critical save or reward defect, consent rejection leaves the product usable, and ads do not interrupt games or the shelf.

### Stage 4: Cozy Crochet Critters, eight to ten weeks

Build the first new premium game and its Shelf Pack together. Its handmade residents, repair behavior, and craft-room layers should demonstrate that ecosystem content is part of production rather than a post-release add-on.

### Stage 5: Pawbrick Builder, ten to twelve weeks

Build structural puzzles and connect their ramps, perches, platforms, and room expansion pieces to the shared environment.

### Stage 6: Walkies: Leash Tangle, eight to twelve weeks

Build the future multi-layer leash-routing game after resident navigation and pack contracts are stable. Use it to expand the entryway, park, dog roster, and route behaviors.

### Stage 7: action, routing, and physics games, twenty to thirty weeks total

Build Pet Rescue Conveyor, Castle Cats: Gate Guard, and Snack Stack Safari in independently releasable stages using shared residents, paths, materials, and effects.

### Stage 8: Animal Kingdom Builder Defense, six to nine months

Reuse proven construction, pathing, combat, behavior, save, and rendering systems. Package for phones only after the web ecosystem meets its performance and lifecycle gates.

## Quality Gates for Every Release

### Gameplay

- All authored levels are completion-verified.
- Expert difficulty is based on reasoning or execution, not hidden information.
- Restart, pause, undo, resume, and result calculation are deterministic where applicable.
- No purchase or ad is required to complete a campaign level.

### Visuals

- Desktop and phone screenshots pass visual review at common and narrow viewports.
- Interactive objects remain readable against the background.
- Effects communicate cause and material.
- Reduced-motion and quality settings work.
- There is no overlap, clipped text, layout shift, blank canvas, or low-density primary art.

### Performance

- Initial shell becomes interactive quickly on repeat visits.
- Game assets load by route, not as one library-wide bundle.
- No unbounded texture, listener, timer, particle, or audio growth after repeated restarts.
- Quality mode and battery mode meet their frame targets.
- Tab hiding and app backgrounding pause simulation and audio immediately.

### Monetization trust

- Ads never appear during active play.
- No ad covers content or controls.
- Rewarded actions state the exact reward before playback.
- Failed ads do not consume an opportunity or corrupt state.
- Interstitial frequency is remotely configurable and defaults conservatively.

### Engagement

- First meaningful action occurs within ten seconds of pressing Play.
- The player sees a visible new mechanic or environment within the first session.
- Results explain performance and offer a clear next choice.
- Daily modes are identical for all players and archive cleanly.
- Collection rewards are cosmetic, visible, and connected to the game just played.

## Metrics That Protect the Product

Track:

- Start-to-first-action time.
- Tutorial completion and first three level completion.
- Per-level attempts, completion, undo, restart, and hint use.
- Failure reason and first causal mistake where available.
- Session length and number of distinct games played.
- Daily return, streak continuation, and share creation.
- Frame pacing, memory, crash, restore, and ad failure rates.
- Ad impressions per gameplay minute and exits within 15 seconds of an ad.

Do not optimize only for ad impressions. A rising ad count paired with shorter sessions, fewer next-day returns, or more exits after results is a product failure.

## Immediate Next Actions

1. Treat the Living Shelf ecosystem and six-game batch as approved working direction.
2. Finalize the Shelf Pack, ecosystem event, collectible, behavior, and world-state schemas.
3. Create the shared TypeScript/PixiJS application foundation and versioned IndexedDB save layer.
4. Build a Counter Cat test pack with three props and two behaviors.
5. Prove the full completion-to-unlock-to-placement-to-restore loop in gray box.
6. Produce one high-quality visual target for the six-zone Living Shelf room.
7. Establish target desktop and phone hardware profiles and performance budgets.
8. Port Counter Cat into the shared shell only after the event and save contracts pass tests.
9. Connect the five current games before beginning bulk production of new game art.
10. Begin Cozy Crochet Critters as the first new Shelf Pack production test.

## Research Sources

- Mob Control App Store reviews: https://apps.apple.com/au/app/1562817072?platform=iphone&see-all=reviews
- Block Craft 3D App Store reviews: https://apps.apple.com/us/app/block-craft-3d-building-games/id981633844?platform=watch&see-all=reviews
- Wool Frenzy App Store reviews: https://apps.apple.com/us/app/wool-frenzy-yarn-sort/id6747653014
- Yarn Fever App Store reviews: https://apps.apple.com/gb/app/yarn-fever-unravel-puzzle/id6747875092?platform=iphone&see-all=reviews
- Cozy Knitting App Store reviews: https://apps.apple.com/us/app/6451380839?platform=iphone&see-all=reviews
- Summoner's Greed App Store reviews: https://apps.apple.com/us/app/1258027083?platform=ipad&see-all=reviews
- Zombies vs. Towers App Store reviews: https://apps.apple.com/us/app/zombies-vs-towers/id1545660538?see-all=reviews
- Tiny Clash App Store reviews: https://apps.apple.com/us/app/tiny-clash/id6504737841
- Academic review of in-app advertising complaints: https://arxiv.org/abs/2008.12112
