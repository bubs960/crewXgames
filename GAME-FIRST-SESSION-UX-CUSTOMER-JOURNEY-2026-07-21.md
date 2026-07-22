# CrewMultiply Play: First-Session UX and Customer Journey Standard

Date: 2026-07-21  
Workspace: `C:\Users\bubs9\apps\games`  
Status: required product standard for current-game retrofits and every future game build.

## Purpose

A player should not need to understand the whole game before making the first useful move. The interface must answer five questions in order:

1. What am I trying to accomplish?
2. What can I touch or select right now?
3. What happened because I acted?
4. Why was that action useful or invalid?
5. What should I try next?

The game should teach those answers through the board itself. Help text, settings, and full rules remain available, but they cannot carry the primary teaching burden.

## North-star outcome

On a clean browser profile, a new player should:

- Reach a playable board within two deliberate actions from the website.
- Understand the first objective within 10 seconds of the board appearing.
- Make a useful first action within 30 seconds.
- Complete the first lesson within 60 seconds.
- Complete a short unprompted challenge within five minutes.
- Understand what was unlocked and how to continue after the first win.
- Be able to leave and return without losing the lesson state.

These are usability targets, not analytics claims. They require observed first-time-player evidence before public launch.

## Customer journey

### 1. Discover

Player question: What kind of game is this?

The site card must show:

- The real game image.
- The core action in plain language.
- Difficulty and expected session length.
- A direct Play action.
- A Details action for players who want more context.

Avoid lore-first descriptions that hide the mechanic. Personality supports the rule; it does not replace it.

### 2. Evaluate

Player question: Is this for me, and will I be able to learn it?

The detail page must show:

- One-sentence objective.
- Three-step basic loop.
- Input support.
- Honest accessibility status.
- A first-visit promise such as `Starts with a guided one-move practice board` when that behavior is actually implemented.

Late-game mechanics belong below the basic loop or in a `What comes later` section. Do not make a first-time visitor parse expert systems before pressing Play.

### 3. Launch

Player question: Did the game open, and is my progress safe?

The launch experience must:

- Show a stable branded loading state only while necessary.
- Restore an interrupted session when reliable proof exists.
- Start a new player at the first lesson, never at Daily, Expert, or a crowded level book.
- Avoid stacking a privacy modal, game tutorial modal, update modal, and audio request.
- Request audio only after a player action.

A concise welcome panel is allowed when the controls are unusual. It should contain no more than three short steps, one primary `Start guided practice` action, and one secondary `Explore on my own` action.

### 4. Orient

Player question: What matters on this screen?

During the first lesson, visually prioritize:

1. The objective.
2. The current actionable object.
3. The destination or result.
4. Undo or safe correction.

Hide or collapse:

- Best score.
- Medal totals.
- Daily mode.
- Albums and collections.
- Expert systems.
- Advanced mechanic tags.
- Share actions.
- Nonessential counters.

The player can still reach accessibility and exit controls. Progressive disclosure must never trap the player.

### 5. First action

Player question: What do I do now?

The first lesson must provide:

- One highlighted source or control.
- One short action label placed near that target.
- A safe result that cannot create an unwinnable state.
- Immediate visual, textual, and optional audio feedback.

The first instruction should use a verb and object: `Tap the glowing cat tag`, not `Begin sorting`.

### 6. Guided repeat

Player question: Can I do that again?

After the first action:

- Highlight only the next destination or action.
- Explain why it is legal using visible state.
- Allow one repetition with less guidance.
- Adapt the coach to the actual state if the player makes a different legal move.
- If the player selects the wrong object, teach how to clear or correct it without punishment.

Never let tutorial guidance become stale after a legal alternate move.

### 7. Independent check

Player question: Did I actually learn it?

Within the first three to five lessons:

- Remove the target glow.
- Keep the objective visible.
- Ask the player to apply the learned verb independently.
- Introduce only one additional rule at a time.
- Restore contextual coaching after repeated hesitation or invalid actions.

Completion of an autoplay demonstration does not count as learning.

### 8. First win

Player question: What did I accomplish?

The first result should explain:

- The solved objective.
- The skill just learned.
- Any Living Shelf reward and where it came from.
- One recommended next lesson.

Do not lead with score, par, ads, sharing, or a catalog of unrelated modes. Celebration should be short enough that the player remains connected to the action they just learned.

### 9. Continue

Player question: What is the obvious next step?

The result screen should offer, in order:

1. Continue learning or Next level.
2. Replay.
3. Visit the Shelf reward, when relevant.
4. Level book or other modes.

Only one action receives primary emphasis.

### 10. Return

Player question: Where was I?

A returning player should see:

- Resume current board when an exact save exists.
- Continue next incomplete lesson when the previous board was completed.
- Daily and expert shortcuts only after the basic interaction is learned.
- A replayable `How to play` control.

Do not replay the welcome panel on every visit. Do not skip a partially completed tutorial without explicit player choice.

## Teaching pattern

Every new mechanic follows this six-beat pattern:

1. **Context:** state the immediate goal.
2. **Cue:** mark one actionable control or object.
3. **Action:** let the player perform it.
4. **Consequence:** show the board changing.
5. **Reason:** connect the outcome to a visible rule.
6. **Transfer:** ask for the same idea without the cue.

Do not teach two new verbs in one step. Do not explain a rule several levels before the player can use it.

## Progressive disclosure matrix

| Surface | First lesson | Guided lessons | Independent campaign | Expert/Daily |
| --- | --- | --- | --- | --- |
| Objective | Always visible | Always visible | Compact | Compact |
| Current action | Strong coach | Contextual coach | On request | On request |
| Undo/restart | Visible | Visible | Visible | Visible |
| Best/par/medals | Hidden or secondary | Secondary | Visible | Visible |
| Level book | Exit path only | Visible | Visible | Visible |
| Daily | Hidden | Hidden or secondary | Visible after skill gate | Primary option |
| Album/collection | Hidden | Result-only | Visible | Visible |
| Advanced settings | Collapsed but reachable | Reachable | Visible in pause/settings | Visible |
| Ads | None | None | Outside active play only | Outside active play only |

## Error and recovery language

An invalid action must state:

- What was attempted.
- Which visible rule blocked it.
- How to recover.

Preferred:

`That run needs three spaces; this post has two. Choose the taller post or undo.`

Avoid:

`Invalid move.`

Errors appear beside the action or in a stable live region. They must not open a blocking modal. Repeating the same error may increase visual guidance, but it cannot mock the player.

## Input teaching

- Detect the first successful pointer, touch, or keyboard input.
- Present one input method at a time during coaching.
- Do not display desktop keyboard shortcuts as equal-weight content on a phone.
- Every drag interaction needs a tap or button alternative.
- Every spatial keyboard mode needs visible focus and a spoken current target.
- Minimum touch target is 44 by 44 CSS pixels.

## Mobile first-session rules

- Keep the objective and active board within the first viewport whenever practical.
- Do not place the active coach below a tall HUD.
- Avoid horizontal toolbar discovery during the first lesson.
- Collapse secondary settings and collections.
- Keep coach labels inside safe stage bounds.
- Prevent the page from scrolling while a deliberate board drag is active.
- Verify portrait and landscape, including browser chrome and safe-area changes.

## Accessibility

The tutorial is part of the game, so it must be accessible too:

- Coach changes use a polite live region.
- Focus does not jump after every move.
- Highlighted targets receive an equivalent accessible label.
- Reduced motion replaces pulse or travel animation with a static border and label.
- High contrast preserves source and destination differences through text and pattern.
- A screen-reader player receives objective, current action, visible rule, and result in that order.
- Guidance can be replayed without deleting progress.
- Accessibility settings never lower score or rewards.

## Local journey evidence

Before optional analytics exist, use a local QA event timeline in development builds:

- `game_detail_viewed`
- `play_selected`
- `game_ready`
- `welcome_started`
- `welcome_skipped`
- `first_action_attempted`
- `first_valid_action`
- `first_invalid_action`
- `tutorial_step_completed`
- `tutorial_completed`
- `first_result_viewed`
- `next_level_selected`
- `session_resumed`

These events are development evidence only unless a future privacy-approved analytics implementation is explicitly authorized. Do not send them to a provider in the current local build.

## Usability test script

Test with clean storage and no verbal coaching from the observer.

1. Open the game detail page.
2. Ask the participant what they think the game does.
3. Ask them to start playing.
4. Remain silent for 60 seconds.
5. Record time to board, time to first useful action, invalid actions, and help openings.
6. After Lesson 1, ask: `What can move, and where can it go?`
7. After the independent lesson, ask the participant to explain the objective.
8. Close the browser mid-board, reopen it, and ask them to continue.
9. Run the same flow at a phone viewport.

Launch gate for each game:

- At least 4 of 5 new participants complete Lesson 1 without observer intervention.
- Median useful first action is under 30 seconds.
- Median Lesson 1 completion is under 60 seconds.
- At least 4 of 5 can explain the core rule after the independent check.
- No participant becomes trapped by a modal, selection, hidden toolbar, or lost save.

## Game-specific first lessons

| Game | Lesson 1 | Lesson 2 | Independent check |
| --- | --- | --- | --- |
| Counter Cat | Bap one highlighted lane and watch one evidence object move | Protect one visible yarn object | Choose the useful lane without a glow |
| Mosaic Meadow | Rotate one highlighted tile to close one obvious path | Match a tile to two neighbors | Complete a small corner independently |
| Pup & Purr Bento | Place one snack into a matching tray silhouette | Complete one row with two choices | Place the next snack without a target outline |
| Paws & Yarn Tangle | Move one endpoint to remove one crossing | Read the crossing counter and repeat | Resolve a three-node tangle independently |
| Cozy Crochet Critters | Start the named spool and follow one glowing pin | Tighten one valid route | Complete the next stitch without a node glow |
| Pet Parade Sort | Move one misplaced top tag home | Move one matching run | Read capacity and complete the third practice board |
| Pawbrick Builder | Place one highlighted platform | Rotate and support one ramp | Build a two-piece route without a ghost |
| Walkies: Leash Tangle | Move one handler to remove one crossing | Change one over/under order | Resolve two leashes without a target glow |
| Castle Cats: Gate Guard | Aim through one +3 gate | Compare +2 and x2 with live totals | Build the first squad and defense independently |
| Pet Rescue Conveyor | Change one paused switch and preview the route | Respect one station capacity | Complete a short forgiving shift |
| Snack Stack Safari | Place one broad object in a safe zone | Rotate and balance two objects | Build for one previewed animal test |
| Animal Kingdom Builder Defense | Place one cat tower and read its range | Run one slow night and use one ability | Choose a valid two-structure plan |

## Current retrofit priority

1. Pet Parade Sort: replace the static practice note with state-aware source/destination coaching and simplify the first board.
2. Counter Cat: make its first lane action and protected-yarn rule visible before exposing the full case-file interface.
3. Mosaic Meadow: add keyboard-capable guided tile rotation and one-corner practice.
4. Pup & Purr Bento: create a finite guided tray before procedural free play.
5. Paws & Yarn Tangle: add a guided one-crossing board and keyboard movement model.
6. Cozy Crochet Critters: preserve its current action-aware coach and audit the journey into the first result and next lesson.

## Release evidence checklist

- Clean-profile desktop recording or screenshot sequence.
- Clean-profile phone recording or screenshot sequence.
- Time-to-first-action observation.
- Tutorial state-machine tests.
- Invalid-action recovery tests.
- Keyboard-only tutorial completion.
- Reduced-motion tutorial completion.
- Save/close/restore during the tutorial.
- First-win result with one obvious next action.
- Honest note of unresolved human, device, and screen-reader evidence.

The product rule is: teach the meaning of one action before asking the player to plan several actions ahead.
