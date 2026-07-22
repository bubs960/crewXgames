# CrewMultiply Play: Living Shelf Ecosystem Production Plan

Date: 2026-07-17
Status: Approved product direction
Owner: CrewMultiply Play
Initial platform: Website and installable PWA
Later platform: iOS and Android through a shared web runtime

## 1. Executive Decision

CrewMultiply Play will not be a menu of unrelated animal games with a conventional badge collection.

It will be a connected puzzle ecosystem built around **The Living Shelf**: a persistent, playable animal environment that remembers what the player accomplishes across every game.

Each game remains complete and enjoyable by itself. It also contributes animals, objects, materials, room layers, behaviors, discoveries, sounds, and story moments to the shared environment through a standard **Shelf Pack**.

The ecosystem promise is:

> Play a puzzle. Bring something home. Watch the house remember.

The first release is site-first, local-first, and deliberately contained. It is not a social network, a giant open world, or a decoration economy.

## 2. Product Position

### 2.1 What CrewMultiply Play becomes

CrewMultiply Play is a collection of difficult, fair animal games set inside one evolving household.

The player is simultaneously:

- Puzzle solver.
- Caretaker.
- Builder.
- Collector.
- Investigator.
- Witness to recurring animal behavior.

Counter Cat is the flagship resident and unofficial lead. The cat is often the cause, occasionally the investigator, and never available for a remorse statement.

### 2.2 Why the Living Shelf matters

Most puzzle collections connect games through currency, streaks, generic achievements, or decorative screens. Those systems record activity but rarely create a place the player cares about.

The Living Shelf turns progression into a visible and interactive world:

- A solved puzzle can add a functional object.
- An expert result can add a mastery version of that object.
- A useful failure can reveal an animal behavior.
- A new game can open a new physical area of the house.
- The player's arrangement can cause a daily event.
- Animals can remember repeated interactions.
- A share card can show a world unique to that player.

This is harder to duplicate than a theme, mascot, or puzzle mechanic because the differentiation accumulates across every game and every content pack.

## 3. Experience Architecture

The ecosystem has four layers.

### 3.1 Standalone game layer

Each game has its own rules, campaign, daily challenge, expert track, tutorial, scoring, accessibility settings, and result screen.

No player must complete another game to understand or finish it.

### 3.2 Living Shelf layer

The Living Shelf is a full-screen interactive environment, not a grid of collection cards.

It contains:

- Entrances to installed or available games.
- Placeable objects earned from games.
- Resident and visiting animals.
- Behavior interactions between animals, objects, and room surfaces.
- A discovery journal.
- Daily Mischief Reports.
- Story packets and seasonal environment changes.
- A share camera.

### 3.3 Ecosystem progression layer

Progress is based on known accomplishments rather than random rarity.

The player grows the world through:

- Campaign completion.
- Expert mastery.
- Daily participation.
- Behavior discovery.
- Creative arrangement.
- Cross-game combinations.
- Optional seasonal stories.

### 3.4 Light narrative layer

The games tell related stories without becoming one rigid campaign.

The narrative is delivered through:

- Environmental changes.
- Animal arrivals.
- Short case files.
- Mischief Reports.
- Object provenance.
- Recurring relationships and jokes.
- Small story packets triggered by accomplishments.

The player should be able to ignore the story and still enjoy every puzzle. A player who notices details should find a coherent household history.

## 4. Story Foundation

### 4.1 Starting premise

The player takes responsibility for an unusual shared animal house whose rooms are incomplete and whose residents have strong ideas about object placement.

Counter Cat already occupies the kitchen and considers several human possessions incorrectly stored above floor level.

As games are played:

- The garden is restored.
- Pet residents arrive.
- Craft spaces fill with yarn and handmade animals.
- Lunch and care routines develop.
- New rooms are constructed.
- The household organizes a defense against increasingly theatrical nighttime problems.

### 4.2 Narrative rules

1. The player is never forced to consume story before playing.
2. Story beats must follow player accomplishment, not arbitrary waiting.
3. Missing a day does not remove story access or punish the player.
4. Animals communicate through behavior, reaction, short captions, and environmental evidence.
5. Functional controls use plain language even when surrounding copy is playful.
6. No game is framed as meaningless side content.
7. Every new game changes the shared world in a visible way.
8. Story unlocks remain available after the event that introduced them.

### 4.3 First ecosystem story arc

Working title: **The House Has Rules**

Beat 1: Counter Cat establishes countertop jurisdiction.

Beat 2: The player discovers that objects brought home from puzzles behave differently around the cat.

Beat 3: A dog arrives and disrupts the cat's controlled experiment.

Beat 4: The craft corner opens, introducing yarn, soft objects, and repair behavior.

Beat 5: The garden entrance opens and begins attracting visiting animals.

Beat 6: A nighttime disturbance reveals that the household needs better structures and defenses.

The arc ends by introducing the later builder-defense game without making it necessary for the current games.

## 5. The Living Shelf Environment

### 5.1 First environment

The production MVP is one richly rendered room with connected zones:

- Kitchen counter.
- Wall shelf.
- Floor and rug.
- Window and garden view.
- Craft corner.
- Entryway.

The room is presented as a premium 2.5D cutaway with clear depth layers and phone-readable interaction zones.

### 5.2 Environment modes

#### Arrange mode

- Select an owned object.
- Preview valid surfaces.
- Place, rotate, move, stack, or store it.
- Undo and redo freely.
- Never consume an object through placement.
- Save automatically after a stable action.

#### Live mode

- Animals enter, idle, travel, inspect, and interact.
- The world uses deterministic behavior priorities.
- The player can tap an animal or object for a short state description.
- Important interactions are logged as discoveries.

#### Report mode

- Replays the most interesting recent interaction.
- Explains what triggered it.
- Offers a direct link to the related game or discovery.
- Produces a share image or short replay.

#### Quiet mode

- Pauses autonomous interactions.
- Allows decorating without interruption.
- Disables camera movement and nonessential effects.
- Preserves the same placement and inventory rules.

### 5.3 Environment layers

The Living Shelf supports several independent layers so new games can expand it without replacing the scene.

- Architecture: shelves, ramps, rooms, doors, perches, platforms.
- Surfaces: floor, rug, counter, wall, garden soil, water.
- Props: moveable objects with material and behavior tags.
- Residents: persistent animals with relationship state.
- Visitors: temporary animals triggered by games or events.
- Lighting: time, weather, chapter, and mood variations.
- Ambience: room loops, weather, animal sounds, object sounds.
- Story: evidence, notes, arrivals, room changes, and case files.
- Mastery: expert artifacts and visible accomplishment marks.
- Accessibility: labels, focus order, contrast, motion, and sound alternatives.

## 6. Collection Design

### 6.1 Collectibles are objects, not icons

Every primary collectible must do at least one of the following:

- React to an animal.
- Affect an animal route.
- Change another object's behavior.
- Produce a sound or animation.
- Open a game or story beat.
- Modify the environment visually.
- Record meaningful provenance.

An object that does none of these belongs in a journal, not the main environment.

### 6.2 Deterministic unlocks

Every collectible has a visible unlock rule.

Examples:

- Clear Counter Cat Case 5.
- Finish Daily Meadow without a hint.
- Complete three Bento line clears in one placement.
- Solve an expert Yarn Tangle below par.
- Discover what the dog does with a squeaky object.

No loot boxes, duplicate conversion systems, expiring ownership, or ad-required campaign collectibles.

### 6.3 Provenance

Every object stores where it came from:

- Source game.
- Level or discovery.
- Date earned.
- Normal, daily, expert, discovery, or story classification.
- Optional best result associated with it.

Example:

> Blue Mug, recovered from Counter Cat Case 12. Structural confidence remains low.

### 6.4 Duplicates and variants

Duplicates do not clutter the inventory.

- Exact duplicates stack as a count.
- Visual variants remain selectable under one object family.
- A duplicate can never be lost because another copy is placed.
- No object is consumed by an unfinished arrangement.

## 7. Animal Behavior System

### 7.1 Design objective

Animal behavior makes the collection playable and creates the shared story.

The engine should feel surprising without being arbitrary. Every interaction must be explainable from visible object and animal traits.

### 7.2 Initial animal traits

Counter Cat:

- Seeks height.
- Inspects new objects.
- Bats rolling, dangling, or fragile objects.
- Protects yarn, boxes, and preferred resting spots.
- Avoids wet surfaces unless story requires otherwise.

House Dog:

- Seeks social contact.
- Carries toys.
- Creates tail and body impulses near loose objects.
- Prefers soft beds and food-scented objects.
- Interrupts carefully arranged cat routes.

Future traits include rabbit chewing and hopping, bird stealing and perching, hamster vibration, turtle stabilization, and sheep fiber interactions.

### 7.3 Object tags

Initial behavior tags:

- `fragile`
- `rolling`
- `stackable`
- `shiny`
- `dangling`
- `soft`
- `squeaky`
- `edible`
- `food_scented`
- `wet`
- `warm`
- `box_like`
- `climbable`
- `protected_by_cat`
- `dog_carryable`
- `bird_carryable`
- `yarn_related`
- `repairable`
- `blocks_route`
- `makes_noise`

### 7.4 Behavior recipe

A behavior recipe specifies:

- Actor traits.
- Required object tags.
- Required surface or adjacency.
- Exclusion conditions.
- Priority.
- Deterministic seed rule.
- Animation sequence.
- Audio sequence.
- Resulting world changes.
- Discovery journal entry.
- Accessibility narration.

### 7.5 Predictable surprise

The engine uses a daily seed and visible state. A player who recreates the same arrangement with the same residents and seed can reproduce the main event.

Randomness may choose among equivalent reactions but cannot:

- Delete progress.
- Consume items.
- Move mastery artifacts permanently without a recovery path.
- Change a scored puzzle.
- Trigger a purchase.

## 8. The Shelf Pack Contract

Every released game must ship a versioned Shelf Pack.

### 8.1 Required content

| Component | Minimum requirement |
|---|---|
| Game entrance | One world object or zone that opens the game |
| Resident or visitor | One animal or character behavior profile |
| Functional props | Three placeable, interactive objects |
| Mastery artifact | One expert-skill reward |
| Discovery artifact | One experimentation or behavior reward |
| Environment layer | One surface, lighting, architecture, or ambience addition |
| Behavior recipes | Five cross-object or cross-animal interactions |
| Story packet | One short household story beat |
| Daily event | One Mischief Report template |
| Share scene | One room composition or replay treatment |
| Accessibility data | Labels, cues, contrast state, reduced-motion behavior |

### 8.2 Proposed data shape

```ts
interface ShelfPack {
  schemaVersion: number;
  packId: string;
  gameId: string;
  title: string;
  entrance: EntranceDefinition;
  residents: ResidentDefinition[];
  collectibles: CollectibleDefinition[];
  environmentLayers: EnvironmentLayerDefinition[];
  behaviors: BehaviorRecipe[];
  storyBeats: StoryBeatDefinition[];
  dailyEvents: DailyEventDefinition[];
  shareScenes: ShareSceneDefinition[];
  accessibility: AccessibilityDefinition;
}
```

### 8.3 Collectible shape

```ts
interface CollectibleDefinition {
  id: string;
  familyId: string;
  displayName: string;
  source: UnlockRule;
  assetId: string;
  footprint: PlacementFootprint;
  validSurfaces: string[];
  tags: string[];
  states: ObjectStateDefinition[];
  provenanceCopy: string;
  accessibleLabel: string;
  reducedMotionState?: string;
}
```

### 8.4 Game event shape

Games communicate with the ecosystem through versioned events.

```ts
type EcosystemEvent =
  | { type: "game.completed"; gameId: string; levelId: string; result: ResultSummary }
  | { type: "expert.completed"; gameId: string; levelId: string; result: ResultSummary }
  | { type: "daily.completed"; gameId: string; date: string; result: ResultSummary }
  | { type: "discovery.triggered"; gameId: string; discoveryId: string }
  | { type: "story.completed"; gameId: string; beatId: string };
```

The game never edits world inventory directly. It emits an event. The ecosystem validates the event and applies deterministic unlock rules.

## 9. Shared World State

### 9.1 World data

```ts
interface LivingShelfState {
  schemaVersion: number;
  worldId: string;
  createdAt: string;
  updatedAt: string;
  unlockedPacks: string[];
  inventory: InventoryEntry[];
  placements: PlacementState[];
  residents: ResidentState[];
  relationships: RelationshipState[];
  discoveries: DiscoveryState[];
  completedStoryBeats: string[];
  pendingStoryBeats: string[];
  dailyReport: DailyReportState | null;
  eventLog: AppliedEvent[];
  settings: WorldSettings;
}
```

### 9.2 Local-first storage

The website release uses IndexedDB for the shared state and local storage only for small preferences or migration flags.

Requirements:

- Versioned save migrations.
- Atomic writes.
- Backup snapshot before migration.
- Import and export of a local save file.
- Corruption detection and recovery to the latest valid snapshot.
- No account required.
- No loss when the tab closes during a placement or report.

Cloud sync is a later optional feature. It is not required for the first production release.

### 9.3 Event log

The world keeps a bounded event log for:

- Unlock provenance.
- Save recovery.
- Mischief Report generation.
- Debugging failed rewards.
- Future cloud merge logic.

The event log is not an analytics pipeline and remains on the device by default.

## 10. Current Game Ecosystem Map

| Game | Entrance | Initial resident | Functional props | Environment contribution | Story contribution |
|---|---|---|---|---|---|
| Counter Cat | Kitchen counter | Counter Cat | Blue mug, yarn ball, dented can, plant | Kitchen and evidence floor | Establishes household jurisdiction |
| Mosaic Meadow | Window garden | Bee or snail visitor | Flower pot, path tile, water dish | Garden view, weather, plants | Restores the outside route |
| Pup & Purr Bento | Lunch station | Pup visitor | Bento tray, fish snack, squeaky treat | Feeding corner and mood states | Introduces shared routines |
| Paws & Yarn Tangle | Craft basket | Craft-room cat | Yarn spool, pin cushion, crochet mat | Craft corner and repair behavior | Explains where soft residents come from |
| Pet Parade Sort | Entryway bench | Rotating rescue visitor | Leash rack, bench cushion, name tag | Entryway and arrival route | Brings new animals into the house |

## 11. New Game Ecosystem Map

| Game | Ecosystem contribution |
|---|---|
| Pawbrick Builder | Structural pieces, ramps, perches, room expansion, support behavior |
| Cozy Crochet Critters | Handmade residents, soft props, repair recipes, fiber interactions |
| Castle Cats: Gate Guard | Night lighting, blanket fort, guard residents, defense story arc |
| Pet Rescue Conveyor | New residents, care stations, temperament traits, adoption records |
| Snack Stack Safari | Food and toy materials, break states, balance events, animal tests |
| Animal Kingdom Builder Defense | New rooms, connected paths, household-wide night events |

## 12. Future Game: Walkies, Leash Tangle

Working title: **Walkies: Leash Tangle**

### 12.1 Product role

Walkies expands the existing untangle category into a higher-difficulty, multi-layer routing puzzle. It introduces the park and neighborhood layer to the ecosystem and creates a natural source of dogs, handlers, leash objects, gates, benches, and route behaviors.

### 12.2 Core fantasy

Several dogs have crossed paths around trees, benches, signposts, gates, puddles, and each other. The player must untangle every leash and create safe walking routes without releasing a dog or exceeding leash tension.

### 12.3 Mechanical layers

- Over and under leash order.
- Foreground, middle, and background depth lanes.
- Leash length and tension.
- Fixed posts and movable handlers.
- Dogs with predictable movement impulses.
- Gates that open or close route layers.
- Retractable leashes with changing length.
- Paired dogs controlled by one handle.
- Puddles or bushes that block specific paths.
- Timed pedestrian crossings in expert mode.
- Calm planning mode without a timer.
- Multi-stage walks in which one resolved area opens the next.

### 12.4 Fairness rules

- All leash endpoints and depth order are visible.
- Moving an endpoint previews affected tension.
- Illegal moves return cleanly without consuming a life.
- Undo restores the complete graph and depth state.
- Every authored puzzle has a verified solution trace.
- Expert difficulty comes from interdependent routes, not hidden leash colors or random dog movement.

### 12.5 Shelf Pack

- Entrance: leash rack at the entryway.
- Residents: four dogs with distinct route and toy preferences.
- Props: leash rack, retractable leash, park bench, water bottle, tennis ball.
- Environment: front path, park gate, weather layer.
- Behaviors: dogs request walks, carry leashes, tangle around furniture, react to weather.
- Daily event: Morning Walk Report.
- Story beat: the household needs a reliable walking schedule.

### 12.6 Production placement

Walkies should be built after the Living Shelf MVP and shared behavior engine, but before the largest builder-defense capstone. It is a strong test that the ecosystem can support multiple dogs, route state, and environment transitions without requiring full open-world movement.

## 13. Mischief Reports

### 13.1 Purpose

Mischief Reports create a daily reason to revisit the shared world without using punishment, energy, or expiring ownership.

### 13.2 Report generation

A report uses:

- The date seed.
- Current residents.
- Current placements.
- Unseen valid behavior recipes.
- Recent game accomplishments.
- Unfinished story beats.
- Accessibility and motion settings.

### 13.3 Report types

- Behavior discovery.
- Object movement.
- Resident arrival.
- Room change.
- Short deduction question.
- Repair request.
- Invitation to a daily puzzle.
- Quiet character moment.

### 13.4 Report constraints

- One primary report per date.
- Reports can be viewed later.
- No broken streak for not opening the environment.
- No item deletion or permanent damage.
- No advertisement before the report is understood.
- Replays last no more than 15 seconds unless the player expands them.

## 14. Site Integration

### 14.1 Route structure

```text
/
  New visitor: product homepage
  Returning visitor: Living Shelf preview plus today's report
/games/
  Complete game catalog
/shelf/
  Full Living Shelf environment
/shelf/journal/
  Discoveries, provenance, residents, and story archive
/daily/
  Shared daily board and report status
/games/{game-slug}/
  Game landing page
/play/{game-slug}/
  Focused game runtime
/settings/
  Audio, motion, contrast, controls, save export, privacy
```

### 14.2 Returning-player homepage

After the first successful game, the homepage should acknowledge world state:

- Today's Mischief Report status.
- Last placed or unlocked object.
- Current resident activity.
- One recommended game tied to a visible world need.
- Direct entry to the full Living Shelf.

This must not become a dense dashboard. The Living Shelf remains the visual center.

### 14.3 Advertising boundaries

The Living Shelf itself contains no popunder, Social Bar, sticky overlay, or active-scene advertising.

Permitted placements:

- Before entering the environment, below useful page content.
- After leaving arrange or report mode.
- On game landing pages outside the runtime.
- After acknowledged game results under the shared site policy.

No collectible, resident, behavior recipe, story beat, or daily report requires an ad.

## 15. Technical Architecture

### 15.1 Recommended packages

```text
packages/
  ecosystem-core/
    world state, event validation, unlock rules
  shelf-pack/
    schemas, pack loader, version compatibility
  behavior-engine/
    actor priorities, recipes, deterministic scheduling
  shelf-renderer/
    2.5D scene, placement, animation, quality modes
  save-data/
    IndexedDB, migrations, snapshots, import/export
  daily-events/
    date seeds, report selection, archive
  game-bridge/
    game events, result validation, reward receipts
  audio/
    ambience, material sounds, animal voices
  accessibility/
    labels, state narration, controls, visual modes
  share-renderer/
    room images and short replay export
```

### 15.2 Rendering approach

- PixiJS for the 2.5D room and sprite batching.
- DOM overlays for text, settings, navigation, and assistive semantics.
- Fixed logical coordinate system with responsive camera framing.
- Layered sprites and authored animation for most behavior.
- Limited Matter.js use only where an interaction genuinely needs physics.
- Pooled effects and sprites.
- Quality and battery modes.

The MVP should not simulate the entire room with unconstrained physics. Deterministic authored reactions are easier to understand, reproduce, test, and run on phones.

### 15.3 Asset requirements

Every placeable prop requires:

- High-resolution base art.
- Contact shadow.
- Placement footprint.
- At least one reaction state where applicable.
- Phone-readable silhouette.
- Anchor points for carrying, stacking, hanging, or impact.
- Accessible label.
- Reduced-motion presentation.

Every resident requires:

- Idle.
- Walk or travel.
- Inspect.
- Positive reaction.
- Negative or surprised reaction.
- Sleep or quiet state.
- One game-specific signature behavior.

## 16. Production Phases

The estimates assume a small focused team using shared engineering and art systems. They are planning ranges, not fixed commitments.

### Phase 0: Product lock and contract, one to two weeks

Deliverables:

1. Approve The Living Shelf name or select its final replacement.
2. Freeze MVP zones, residents, prop count, and non-goals.
3. Finalize Shelf Pack, collectible, event, and world-state schemas.
4. Define Counter Cat's first 20 props and 25 behaviors.
5. Define the first story arc and six beats.
6. Define desktop and phone performance targets.
7. Create wireframes for arrange, live, report, journal, and settings modes.

Exit gate:

- Every required data shape is versioned.
- One Counter Cat completion event can be traced to one world unlock on paper.
- No unresolved decision changes storage, rendering, or content scope.

### Phase 1: Shared foundation, two to four weeks

Deliverables:

1. Create the TypeScript application and shared packages.
2. Implement IndexedDB save, migration, snapshot, import, and export.
3. Implement Shelf Pack loading and validation.
4. Implement ecosystem event validation and deterministic unlock receipts.
5. Implement settings, input abstraction, audio manager, and accessibility hooks.
6. Create test fixtures for corrupt saves, duplicate events, and pack upgrades.

Exit gate:

- Automated tests prove duplicate completion events do not duplicate unique rewards.
- Interrupted writes recover to the latest valid state.
- A version-one save migrates through at least one test schema change.
- Packs with missing or invalid fields fail safely and identify the problem.

### Phase 2: Living Shelf gray-box vertical slice, three to five weeks

Deliverables:

1. Render the six-zone room in gray box.
2. Implement arrange mode with placement, rotation, inventory, undo, and redo.
3. Implement Counter Cat and House Dog travel and idle states.
4. Implement object tags and ten behavior recipes.
5. Implement the discovery journal.
6. Implement autosave and exact restore.
7. Test mouse, touch, keyboard, phone framing, and reduced motion.

Exit gate:

- Twenty objects can be placed without overlap or lost input.
- The same seed and arrangement reproduce the same primary interaction.
- Closing during placement restores the last stable state.
- Both residents can navigate every valid zone.
- The scene meets the gray-box frame target on desktop and phone profiles.

### Phase 3: Counter Cat production vertical slice, four to six weeks

Deliverables:

1. Produce final room, prop, resident, lighting, and material art.
2. Complete 20 Counter Cat props and 25 behavior recipes.
3. Connect Counter Cat game completion, expert, daily, and discovery events.
4. Implement the first six story beats.
5. Implement one Mischief Report and replay format.
6. Implement share image rendering.
7. Add sound, ambience, quality mode, and battery mode.

Exit gate:

- A new player can complete Counter Cat, receive an object, place it, trigger a behavior, and view its report without a broken transition.
- Every reward has visible provenance.
- No ad or purchase exists inside the loop.
- The vertical slice passes fresh desktop and phone visual review.
- Memory, frame pacing, and repeated-entry tests meet targets.

### Phase 4: Connect the existing five-game shelf, four to seven weeks

Deliverables:

1. Create Shelf Packs for all five current games.
2. Add each entrance and three functional props.
3. Add one visitor or resident contribution per game.
4. Add five behavior recipes per pack.
5. Add one story beat and one report template per pack.
6. Migrate existing local progress where a reliable mapping exists.
7. Add clear fallback treatment where old progress cannot prove an unlock.

Exit gate:

- All five games emit events through the same bridge.
- All rewards survive restart and version migration.
- Playing any game creates a visible but non-blocking change in the world.
- Existing game progress is never silently erased.

### Phase 5: Daily ritual and ecosystem depth, three to five weeks

Deliverables:

1. Add daily report selection and archive.
2. Add behavior discovery chains.
3. Add relationship state for residents.
4. Add room lighting, weather, and ambience layers.
5. Add returning-player homepage state.
6. Add journal filters by game, resident, object, and story.
7. Add no-timer quiet mode and complete reduced-motion treatment.

Exit gate:

- Missing a day creates no punishment or inaccessible story.
- Reports do not repeat until the valid pool is exhausted.
- Report generation remains deterministic and debuggable.
- The environment offers a meaningful next action without a notification trap.

### Phase 6: Production readiness, three to five weeks

Deliverables:

1. Complete legal operator, privacy, cookie, accessibility, and contact pages.
2. Confirm the approved CrewMultiply custom domain and deployment route.
3. Complete offline behavior and service-worker versioning.
4. Add analytics limited to product health and consented usage.
5. Integrate one conservative display-ad placement outside gameplay and the shelf.
6. Run security, save integrity, accessibility, performance, and interruption tests.
7. Add sitemap, canonical metadata, social image, robots, and custom 404.

Exit gate:

- Consent rejection leaves every base game and shelf feature working.
- No ad overlaps, interrupts, impersonates, or changes the environment.
- Save import/export and recovery are verified.
- Legal and support contacts are active.
- The release candidate passes the complete launch matrix.

### Phase 7: Web soft launch, two to four weeks

Deliverables:

1. Launch to a limited audience without active ads for the first observation window.
2. Measure first action, game completion, shelf return, object placement, behavior discovery, cross-game play, next-day return, and failure rates.
3. Fix save, control, performance, and comprehension issues before adding traffic.
4. Activate one display placement only after baseline engagement is known.
5. Compare engagement and exits before and after advertising.

Exit gate:

- No unresolved critical save, reward, or progression defect.
- Players understand that games change the shelf without tutorial coaching.
- At least one cross-game route is used organically.
- Advertising does not materially reduce return play or completion.

### Phase 8: New-game production and phone packaging, ongoing

Deliverables:

1. Require a validated Shelf Pack during every new game's vertical slice.
2. Build Walkies: Leash Tangle after the ecosystem APIs stabilize.
3. Build the five approved new games in the revised order.
4. Package the proven website runtime through Capacitor.
5. Add native lifecycle, safe areas, haptics, share sheet, and store compliance.
6. Add optional account and cloud sync only after local-first behavior is proven.
7. Ship the first accessible Interactive Mischief pack described in `CREWMULTIPLY-PLAY-INTERACTIVE-MISCHIEF-PLAN-2026-07-22.md` after the launch and readiness gates pass.

Exit gate:

- New games add ecosystem content without bespoke core changes.
- Web saves migrate cleanly into the phone package where technically permitted.
- Native ads remain behind the same strict placement and consent policy.
- Easter eggs remain optional, keyboard- and touch-accessible, reduced-motion safe, and free of unexpected audio.

## 17. Recommended Production Order

1. Living Shelf contracts and shared save system.
2. Living Shelf gray-box with Counter Cat and House Dog.
3. Counter Cat production vertical slice.
4. Existing five-game Shelf Packs.
5. Daily Mischief Reports and journal depth.
6. Website production readiness and soft launch.
7. Cozy Crochet Critters.
8. Pawbrick Builder.
9. Walkies: Leash Tangle.
10. Pet Rescue Conveyor.
11. Castle Cats: Gate Guard.
12. Snack Stack Safari.
13. Animal Kingdom Builder Defense.

This order establishes the ecosystem before producing many assets that would otherwise require later rework.

## 18. Quality Gates

### 18.1 World integrity

- No earned unique object can duplicate, disappear, or be consumed unexpectedly.
- Every unlock has a validated event receipt.
- Every placement can be restored exactly.
- Every migration has rollback evidence.
- Invalid packs cannot corrupt valid world state.

### 18.2 Behavior fairness

- Major interactions have visible causes.
- Daily events are deterministic and reproducible.
- Surprise never changes a scored game result.
- Permanent world changes require clear player confirmation.
- Quiet mode prevents autonomous rearrangement.

### 18.3 Cross-game integrity

- A game works when the Living Shelf is unavailable.
- The Living Shelf works when one optional game pack fails.
- A reward event is idempotent.
- Removing a game entrance does not delete owned objects.
- Pack upgrades preserve provenance and placements.

### 18.4 Visual quality

- Primary art is high-density and material-specific.
- Objects have clear phone silhouettes.
- Depth does not hide interaction state.
- Text never overlaps the scene or controls.
- Effects communicate cause and respect reduced motion.
- The environment remains visually rich without becoming one-tone or cluttered.

### 18.5 Performance

- Route assets load on demand.
- Resident animation and particles are pooled.
- No unbounded event, texture, audio, or listener growth.
- Backgrounding pauses simulation and audio immediately.
- Quality and battery modes meet their target frame pacing.

### 18.6 Accessibility

- Arrange mode supports pointer, touch, and keyboard.
- Object and resident state can be read without color alone.
- Reduced motion removes camera impulse and autonomous flourishes.
- Quiet mode allows uninterrupted arrangement.
- Every report has text equivalent to its animation.

## 19. Metrics

Primary ecosystem metrics:

- Percentage of completed game sessions that return to the shelf.
- Percentage of new unlocks placed within the first session.
- Number of meaningful interactions discovered per player.
- Percentage of players who enter a second game from the environment.
- Daily report open and completion rate.
- Next-day and seven-day return.
- Save restore and reward failure rate.
- Average frame pacing and memory by quality mode.

Guardrail metrics:

- Exits immediately after an ad.
- Repeated accidental placements.
- Undo frequency caused by control errors.
- Reports skipped before content is visible.
- Inventory search without placement.
- Players unable to locate an earned reward.
- Reduced-motion or quiet-mode abandonment.

Do not optimize for total items owned. Optimize for objects placed, behaviors discovered, games crossed, and worlds revisited.

## 20. Staffing Shape

Minimum sustained team shape:

- Product and creative lead.
- Senior gameplay and platform engineer.
- Frontend and accessibility engineer.
- 2D or 2.5D environment and character artist.
- Technical animator or effects artist.
- Game and systems designer with level-design responsibility.
- Part-time audio support.
- Part-time QA with phone coverage.
- Legal and privacy review before production advertising.

For a very small team, the work must remain sequential. Do not produce several full games while the shared save, behavior, and Shelf Pack contracts are still changing.

## 21. Principal Risks and Controls

### Risk: the environment becomes a second giant game

Control: keep the MVP to one room, two residents, six zones, 20 props, and authored behavior recipes.

### Risk: decorative clutter reduces readability

Control: surface limits, object families, inventory stacking, placement outlines, quiet mode, and a clear store action.

### Risk: autonomous behavior annoys players

Control: deterministic reports, recoverable movement, no item loss, quiet mode, and explicit restoration.

### Risk: every game requires bespoke ecosystem code

Control: the versioned Shelf Pack and event contract are Phase 0 requirements and release gates.

### Risk: old local progress cannot migrate reliably

Control: preserve old keys, map only provable accomplishments, provide a transparent legacy starter pack, and never pretend inferred mastery.

### Risk: phone heat and memory

Control: bounded residents, authored reactions, sprite batching, pooled effects, route-based assets, battery mode, and long-session tests.

### Risk: advertising breaks trust

Control: no ads in the Living Shelf, no active-play ads, one conservative external display placement at launch, and engagement guardrails.

### Risk: the story blocks puzzle access

Control: all story is optional, brief, replayable, and subordinate to direct Play actions.

## 22. Explicit Non-Goals for Version One

- No open-world house.
- No multiplayer room visits.
- No public user-generated content.
- No chat or social feed.
- No trading economy.
- No random loot boxes.
- No energy or lives.
- No cloud account requirement.
- No real-time full-room physics simulation.
- No animal breeding or care timers.
- No expiring objects.
- No required daily streak.
- No ads inside the environment.

## 23. First Production Ticket Group

The first implementation batch should be the smallest coherent foundation:

1. Create `ShelfPack`, `CollectibleDefinition`, `EcosystemEvent`, and `LivingShelfState` TypeScript schemas.
2. Add schema validation fixtures.
3. Implement versioned IndexedDB storage with one snapshot and export.
4. Implement idempotent event receipt handling.
5. Create a Counter Cat test pack containing three props and two behaviors.
6. Build a gray-box shelf with three placement surfaces.
7. Complete the loop: Counter Cat test completion to unlock receipt to inventory to placement to save restore.

Do not begin final environment art until this end-to-end loop is proven.

## 24. Production Definition of Success

The Living Shelf is ready for production launch when a player can:

1. Discover CrewMultiply Play through Counter Cat.
2. Solve a fair, difficult puzzle.
3. Earn a clearly explained object.
4. Return to a rich shared room.
5. Place the object precisely on desktop or phone.
6. Watch an animal react for a visible reason.
7. Record the discovery in a journal.
8. Receive a later Mischief Report without punishment or pressure.
9. Enter another game because something in the room made it relevant.
10. Leave and return with the complete world intact.

When that loop feels delightful without currency, forced ads, or random rewards, CrewMultiply Play has its ecosystem advantage.
