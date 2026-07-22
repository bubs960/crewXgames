# Puzzle Game Roadmap - 2026-07-13

## Local inventory

1. `waddle-home/index.html` is currently **Knock It Off!**, not Waddle Home as the older kickoff says. It is a cat-themed whole-board slide puzzle: one swipe tilts the counter, objects slide, targets fall through edge gaps, and the cat's own objects are protected. Verification passed with `node tools/bench.mjs verify`: 20 older duck levels plus 30 cat levels re-solve against the shipped simulator.
2. `mosaic-meadow/index.html` is **Mosaic Meadow**, a tile-rotation edge-matching mural puzzle. Verification passed with `node tools/bake.mjs --check`: all 25 baked levels match their seeds, attempts, and par values. The 8x8 generation check is slow, but it is an offline bake path rather than a runtime blocker.

## Market read

- Daily puzzle ritual is the highest-confidence retention pattern. The New York Times Games suite reportedly had 11.2B plays in 2025, with Wordle alone at 4.2B plays, and NYT is expanding beyond word games into Pips and Crossplay.
- Block/placement puzzles remain mass-market. Apple's 2025 charts still showed Block Blast among top free games, and 2026 research papers describe Tetris-style block puzzle variants as having tens of millions of downloads.
- Match-3 is still the monetization king, but not the best solo-dev lane. Royal Match has stayed among the largest monthly-revenue mobile games since 2023, but that category requires enormous content, tuning, and user-acquisition muscle.
- Screw/sort/tactile disassembly games are hot but copycat-heavy. Zynga's Screw Jam lawsuit is a useful warning: use the trend of "untangle/unpack/clear the mess," not the exact look and UX of bolt boards.
- Cozy themes help small puzzle games punch above their mechanical weight. Current cozy-game coverage keeps pointing at low-stress, charming, non-farming experiences such as Unpacking, A Little to the Left, Dorfromantik, and Chants of Sennaar.
- Animal and meme-friendly subjects improve shareability. Cats remain evergreen internet fuel; capybaras are a recent social-media comfort symbol; cozy critters, frogs, snails, bees, desk clutter, food, and tiny household rituals all read quickly in screenshots.

## Top 5 build plan

### 1. Counter Cat / Off the Table

- Status: already built as `waddle-home`.
- Mechanic: simultaneous whole-board slide, targets exit through narrow gaps, protected cat objects block and create order constraints.
- Theme: one expressive housecat, human hand reaction, household objects with gag names.
- Why this is the flagship: cats are evergreen, the crash payoff is instantly legible, and the mechanic already verified.
- Key engagement points: Daily Counter, floor gallery, damage receipt share card, streak, item collection, material crash sounds, cat expressions, seasonal object packs.
- Next build work: final name check, screenshots, stronger first-time tutorial, share card, 100+ level ladder expansion.

### 2. Mosaic Meadow

- Status: built and verified as `mosaic-meadow`.
- Mechanic: rotate fixed tiles until every edge matches, producing a completed garden mural.
- Theme: procedural garden paths with bees, snails, hedgehogs, frogs, butterflies, streams, flowers.
- Why this belongs second: it is visually distinct from the cat game and has the strongest "finished puzzle as screenshot" angle.
- Key engagement points: daily mural, completed-mural PNG share, seasonal palettes, critter unlocks, Perfect Weave badge, hint that explains deduction rather than revealing.
- Next build work: speed up or isolate heavy 8x8 bake checks, add critter animation, make the share output beautiful.

### 3. Capybara Bento Blocks

- Mechanic: calm block-placement puzzle on an 8x8 lunch tray. Place three snack shapes at a time; clear rows, columns, or color-themed lunch groups.
- Theme: unbothered capybara lunch host packing fruit, rice balls, tea, pastries, and tiny spa towels.
- Why this is market-aligned: borrows the Block Blast placement loop without copying its expression, and capybaras currently signal calm social-media comfort.
- Key engagement points: Daily Bento, lunchbox sticker collection, "perfectly packed" combo animations, cozy sound, shareable tray image, weekly themed menus.
- Build lift: low. Pure grid placement, easy deterministic seeds, no physics.
- Risk: stochastic piece order needs careful fairness tuning; keep no-timer/no-lives for the library identity.

### 4. Frog Choir Sort

- Mechanic: sort a row/grid of frogs by note, color, pond, or pattern using limited swaps or jumps. Think "arrange the choir before sunset," not generic color sort.
- Theme: frogs, lily pads, fireflies, rainy-window music.
- Why this is a good third new game: sorting puzzles are popular, frogs/cottagecore are highly readable, and the win state can sound musical.
- Key engagement points: Daily Chorus, unlockable frog voices, streak song, 3-star par, tiny concert share card, seasonal songs.
- Build lift: low to medium. Arrays, swap validation, solver for par.
- Risk: must avoid becoming just another bottle/color-sort clone. The music/choir feedback needs to be the hook.

### 5. Yarn Tangle Studio

- Mechanic: graph-untangle puzzle. Drag yarn knots until no lines cross; later add fixed pins, forbidden zones, and color-matched threads.
- Theme: cat craft room, yarn, string lights, friendship bracelets, cozy desk mess.
- Why this fits: untangle puzzles are simple to build, tactile, visually satisfying, and adjacent to the current screw/clear-the-mess trend without stepping into bolt-copycat territory.
- Key engagement points: Daily Tangle, before/after desk share, pattern collection, satisfying snap when crossings clear, craft-room upgrades, no-fail relaxation mode.
- Build lift: low. Canvas/SVG graph geometry plus generated solvable layouts.
- Risk: needs juicy feedback or it can feel dry. Make the theme do real work.

## Character and subject bank

- Cats: strongest universal hook; best for comedy, mischief, collection, and share clips.
- Capybaras: calm, meme-current, unusually brandable for cozy puzzles.
- Frogs: cottagecore, sound/music hooks, readable silhouettes, seasonal rain palette.
- Garden critters: bees, snails, hedgehogs, butterflies, ladybugs; ideal for Mosaic Meadow packs.
- Food and bento: universally legible, appetizing screenshots, easy collectible variety.
- Cozy desk/home clutter: strong for organization, sorting, hidden-object, and "before/after" share loops.
- Tiny ghosts/witchy cozy: good seasonal pack, but use as an October skin rather than a main identity unless the game needs it.

## Recommended production order

1. Finish and rename/polish **Counter Cat / Off the Table** as the flagship.
2. Polish **Mosaic Meadow** as the prettier daily/share-card counterweight.
3. Build **Capybara Bento Blocks** as the simplest third game and strongest trend fit.
4. Build **Yarn Tangle Studio** because it gives the library another tactile mechanic quickly.
5. Build **Frog Choir Sort** after we prove the sorting loop feels musical instead of generic.

## Sources checked

- AP on NYT Games, Crossplay, and 2025 play volume: https://apnews.com/article/4ab76097d6155a022f089d03e94807c3
- The Verge on NYT Crossplay, Pips, and 2024 play volume: https://www.theverge.com/games/682063/the-new-york-times-nyt-games-crossplay-scrabble-pips
- Tom's Guide on NYT Pips: https://www.tomsguide.com/gaming/nyts-new-game-pips-is-already-addictive-heres-how-to-play
- Lifewire summary of Apple's 2025 charts: https://www.lifewire.com/apple-year-end-charts-2025-11865878
- Polygon on Screw Jam copycat lawsuit: https://www.polygon.com/news/520256/screw-jam-zynga-lawsuit
- PC Gamer cozy games roundup: https://www.pcgamer.com/best-cozy-games-on-pc/
- AP on Cat Video Fest scale and cat-video appeal: https://apnews.com/article/b869e51783e7e8c39511d5082383b0ae
- Le Monde on capybara social-media popularity: https://www.lemonde.fr/en/our-times/article/2025/05/11/capybaras-are-the-new-social-media-stars_6741135_39.html
- 2026 Tetris block puzzle difficulty paper: https://arxiv.org/abs/2603.18994
