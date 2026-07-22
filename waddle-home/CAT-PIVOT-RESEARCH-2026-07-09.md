# KNOCK IT OFF! — cat-pivot research + design synthesis (2026-07-09)

Steve's direction after playtesting the duck prototype: mechanic works; the theme is
**a cat knocking things off the counter** — the internet's favorite feline crime.
This doc synthesizes an 11-agent research workflow (8 research lenses + 3 adversarial
critics, all Sonnet) plus the measured depth test that followed. It is the design
bible for the full build.

**Verdicts: comedy critic GO-WITH-CHANGES · mechanics critic GO-WITH-CHANGES ·
originality critic GO-WITH-CHANGES. No kills. All required changes are actionable
and most are already implemented in the prototype.**

---

## 1. The name

Working title **"Knock It Off!"** (Steve's pick, 7/9). The double meaning is the brand:
it's the game's instruction AND the human yelling at the cat.

Collisions found (deep search — corrects the earlier "clear" call from a shallow search):
- **Google Play exact match:** "Knock It Off" by Joongly (com.joongly.brickdown2) — a
  rebranded brick-knockdown ball-throwing arcade game. Low-profile, but occupies the
  exact title on the one store that matters most for hyper-casual.
- **SolidRoots physical cat toy** "Knock It Off" — a real-cat pom-pom table game.
  Same name, same concept space, different channel.
- USAopoly owns trademarks in the adjacent space: **"Cats Knocking Things Off Ledges™"**
  and **"Furry Foodies"** (5×5 tile-push board game). NEVER use those phrases in
  naming, level names, or marketing copy.

Decision: keep "Knock It Off!" as working title for local/web play. Before any store
release: real trademark class check (Steve/legal), and have differentiators ready
("Knock It Off, Cat!" or a subtitle). Fully-CLEAR alternates from the sweep:
**Off the Table · Paws Off · Counter Cat · Sweep the Counter · Table Tumble ·
One Swat Wonder**. Avoid the congested "Cat Slap(s)/Splat Cat" cluster and avoid
"Gravity Cat", "Table Manners", "Cat-tastrophe" (all collided).

## 2. What the research says the joke IS (build to these beats)

The canonical viral-clip structure, present in nearly every hit clip:
1. **Slow deliberate paw-tap** (approach/wind-up)
2. **Direct, unblinking eye contact with the human** — often a held pause mid-push;
   sometimes a "tease" where the caught cat nudges the item BACK to safety
3. **One decisive swipe → crash → the cat calmly walks off unbothered** while the
   human gasps/yells "NO"

Supporting science (authentic flavor-copy material):
- Real 2016 Kyoto University study (Takagi et al., Animal Cognition): cats stare longer
  at gravity-violating outcomes — the internet's "they're not jerks, they're
  scientists" caption has a factual backbone. (Cite hedged: the effect is contested.)
- Jackson Galaxy: cats aren't spiteful, they're bored — "once they figured out it makes
  a noise when it hits the ground? Game over." **The CRASH is the reward loop.**
- Behaviorists: ANY human reaction (even yelling) reinforces the loop — "even negative
  attention is better than being ignored."
- Edge items are maximally attractive to real cats: big visible payoff, minimal paw
  effort. (This is literally our mechanic.)
- Cornell: batting is a fixed predatory motor-sequence beat; paws are "diagnostic
  probes" (X-ray studies show structured digit use). "Pre-pounce wiggle" = wind-up.

Comedy theory (how to make squares funny):
- **Benign Violation Theory**: humor = violation (things break!) + safety (no real
  stakes). Design consequence: NEVER punish. No fail states, no guilt. The forbidden
  item near-miss must be a "whew" beat, not a loss.
- **Coyote Time**: the pause on the brink IS the joke — teeter beat before every fall.
- Anticipation/payoff mismatch is a comedy dial (big wind-up → tiny pen; lazy tap →
  catastrophic fruit-bowl cascade).
- **Sound is ~half the joke**: layered per-material crash audio (ceramic/glass/paper/
  metal/liquid). Must handle mobile Web Audio gesture-unlock from day one.
- Untitled Goose Game lessons: sparse art + setup/punchline level scenarios + adaptive
  tension; "about 1% QWOP" — keep the solver-grade determinism, add a thin cosmetic
  wobble garnish on top.
- Chain reactions read as Rube Goldberg comedy — a swat that dominoes A into B into C
  off the edge is the delight moment (50M-view real-cat domino video corroborates).

## 3. Mechanics — the measured redesign (critic was right)

The naive inversion ("all table edges open, targets fall anywhere") **collapses the
puzzle**. Measured 7/9 with the shipped simulator, 300 seeds per cell, matched piece
counts (tools/bench.mjs compare):

| ruleset | 6×6 median par | 7×7 | 8×8 | solvable% (6/7/8) |
|---|---|---|---|---|
| Duck (settle on nests) | 6 | 9 | 11 | 74 / 69 / 60 |
| Cat, open sides (naive) | **1** | **1** | **1** | 18 / 15 / 7 |
| **Cat, narrow gaps** | **5** | **6** | **8** | **93 / 94 / 89** |

**Design: narrow GAPS (3–5 open lanes) in an otherwise walled border.** Exiting needs
lane alignment — precision constraint restored at near-zero engine cost. Pars run
~1–3 below duck at matched piece counts; compensate with piece count/board size in the
ladder, which the distributions support (healthy tails to par 14–16).

Rules as implemented (prototype, 7/9):
- One unified simulator, both modes differ only in board data (duck: nests, sealed
  border; cat: no nests, gap lanes). One CORE block, extracted by the Node bench.
- Piece types: `D` target (the human's stuff — must exit), `A` forbidden (the cat's
  own stuff — must never exit), `N` neutral (junk; may exit, no effect).
- A swat that would drop a forbidden piece is **refused** — the whole swipe doesn't
  happen; shake + "whew — the cat caught it. That one's MINE." The solver prunes the
  same branches, so game and solver agree perfectly. (This replaced "instant fail"
  per the originality critic + Benign Violation.)
- Exit choreography: glide → **teeter on the brink (240ms)** → fall (rotate/scale/fade)
  → crash burst → debris lands on the **floor pile** strip (visible progress +
  trophy comedy). Board empties as you clear = the judges' visible-progress criterion.

Still to design (full build):
- **Required exit side per item** (multi-swat maneuvering) — depth lever, v1.1
- **Basket/box landing targets** (reuses duck's precise-stop machinery under cat skin —
  "knock the yarn INTO the laundry basket")
- Authored lane-overlap for ordering pressure; re-derive pars after any rules change
- Difficulty ladder obstacles: sticky placemat (stops anything crossing it), round
  items that never stop on open ice (roll to collision), the sleeping DOG on the floor
  zone, mixed wall/gap patterns

## 4. Comedy delivery — required changes from the critic (full-build spec)

1. **A real cat character** (hand-rolled SVG, not an emoji sticker) with ≥3 expressive
   states: pre-swat stare, teeter-watch, post-crash slow blink. Same cat every level —
   it's a character, not wallpaper.
2. **Human-presence proxy on screen**: a forearm/hand at the counter edge that flinches
   or withdraws on crash — the eye-contact beat needs an on-screen anchor.
3. **Wind-up beat** (~300–500ms) before the swipe resolves + the teeter beat (done) —
   with a **fast-forward/skip setting** so replays for par aren't friction.
4. **Per-material crash treatment**: ≥3–4 classes (motion curve + sound + particles).
5. **Score language reframe**: stars/par read as chore-optimization against the mischief
   fantasy. Rename toward the fantasy ("a perfect crime" = par) and keep par framing
   light on first plays.
6. **Web Audio unlock on first gesture** — a silent first crash kills the joke.

## 5. Originality position (what we can honestly claim)

- Every ingredient has prior art; the SYNTHESIS is white space. After a broad sweep
  (Catlateral Damage, Clumsy Cat, Cat Slaps, I Am Cat, Furry Foodies, Fling!, Move,
  SwipeOut, Ricochet Robots/ice-cave lineage, Sokoban/Demaine push-block literature,
  Stray Cat Falling, Neko Sliding, itch tag pages): **no game found that combines
  (a) whole-board simultaneous slide per gesture, (b) deterministic slide-until-
  collision, (c) selective removal via edge gaps as the WIN, (d) protect-forbidden
  constraint, (e) cat-swat theme.** Claim it as "no prior art found," never "provably
  first."
- Nearest neighbors to stay distinct from: **Catlateral Damage** (3D first-person
  sandbox — different genre; avoid its name/branding/"Remeowstered" puns),
  **Furry Foodies** (5×5 one-row-at-a-time push board game), **Fling!** (knock-off-edge
  goal but one-flick-at-a-time bumping). Off-edge-as-goal in digital grid puzzles is
  nearly virgin: Stray Cat Falling treats falling as the FAIL; Sokoban variants treat
  voids as hazards.
- Store-perception risk (critic): the solver novelty is invisible in a 5-second scroll;
  the shelf will read us as "another cat-chaos game" unless the icon/screenshots lead
  with the puzzle hook ("one perfect swat") and the crime-scene humor.
- The duck theme survives as the second skin of the same engine (hedge, zero IP shadow,
  already built). Cat is the flagship; ducks ride along free.

## 6. Engagement stack (research-backed, for full build)

- **The Floor Gallery**: collection album of everything ever knocked off (collectible
  albums are in 72% of top-100-grossing casual games, up from 21%; "a collection you
  can't show off is half the fun"). Rarity tiers + seasonal one-offs (ornaments —
  the cats-vs-Christmas-tree sub-genre is an annual meme moment). Precedent for
  destruction-as-collectible: Smash Hit Museum. Make it screenshot-shareable.
- **Daily Counter**: one curated table per day + streak flame (Wordle-model anticipation;
  "a fresh counter to clear each morning" fits the cozy-ritual framing directly).
- Keep the ethos: zero ads, zero timers, zero lives, unlimited undo — Neko Atsume's
  goodwill came from resisting monetization pressure.
- End-of-level **damage report receipt** (X items, $Y "damages", "you're still cute")
  as the win screen — comedy + share moment.
- Flavor-copy pools from research: "gravity: confirmed", "they're scientists",
  achievement "Rudimentary Understanding of Gravity" (Kyoto study), Scientist/Hunter/
  Researcher/Bored Genius as rotating loading-tip personas.

## 7. State of the build (end of 7/9 session)

- `index.html`: dual-mode prototype LIVE — 🐱 Knock It Off! (20 gap-ruleset levels,
  refusal mechanic, teeter+fall+crash, floor pile, cat win copy) + 🐤 Waddle Home
  (original 20 levels, byte-identical mechanics under the unified sim; all 20 pars
  re-verified after the merge). Grayscale on purpose — squares, no art yet.
- `tools/bench.mjs`: bench / bake / bake-cat / **compare** (the depth test) / **verify**
  (regression: re-solves all 40 embedded levels from scratch).
- Verified live in preview: refusal, crashes, floor pile 0/2→2/2, win "4 swats · par 4 ·
  a perfect crime" ★★★, mode toggle both directions.
- NOT yet built (full-build backlog, priority order): cat SVG character + hand proxy +
  wind-up; per-material crash audio (with unlock) + particles; damage-report win screen;
  score-language reframe; exit-side tags + basket targets + new obstacle types; Floor
  Gallery; Daily Counter + streak; 25+ authored-ramp levels; mid-level save slots;
  theme toggle; adversarial review workflow before v1 "done".

## 8. Cat-culture item & icon pass (Steve ask, 7/9 — "toward end product")

Steve's direction after playing v1: lean into cat people / cat culture / "cat lady"
references; make the icons feel relevant and ALIVE. Light research pass (sources at
bottom of section). IP rule stays: reference BEHAVIORS and tropes, never protected
characters (no Grumpy Cat/Nyan likenesses; "Keyboard Cat" the phrase is fine as
inspiration for a keyboard ITEM, not branding).

**The audience insight:** the "crazy cat lady" trope has been publicly RECLAIMED —
CatCon has drawn 78k+ attendees since 2015, Etsy is "awash" in proud cat-lady merch,
and the 2024 "childless cat lady" news cycle turned it into a badge of identity. Cat
people buy cat-person things proudly now. Design consequence: the human in our game
is not an adversary — she's a devoted cat parent whose stuff is simply forfeit. Long
arc idea: the hand's quips soften across the ladder ("NO—" → "...fine" → "I'll buy a
heavier vase" → a final receipt line: "worth it."). That's the cat-parent love story
told entirely in crash reactions.

**Meme-canon items to add (targets):**
- *the zoom-call laptop* ($1,200, tech) — "Zoom Call Cat-astrophe" was a 2025 viral
  staple (cat knocks mug/walks on keyboard mid-meeting); instantly legible
- *the keyboard* (tech) — Keyboard Cat lineage + the keyboard-ambush trope
- *the "World's Best Cat Mom" mug* ($9, ceramic) — cat-mom culture, self-referential
- *the emotional-support wine glass* (glass) · *the scented candle* (glass) ·
  *the 1000-piece jigsaw (3 missing)* (paper) · *a tiny cactus named Gerald* (ceramic)
- Personality lives in the NAMES — "a tiny cactus named Gerald" reads alive before a
  single animation frame.

**Cat-treasure items to add (forbidden):**
- *MY cardboard box* — "if it fits, I sits"; Maru's 300M-view legacy; the box is sacred
- *MY red dot machine* (laser pointer) — the cat would never risk the dot machine
- *MY fish friend* (fishbowl) — subversion: the cat PROTECTS the goldfish; peak
  cat-lady-core tenderness, and mechanically a big blue round blocker
- *MY treat bag (3AM zoomies fuel)*

**A designed obstacle for the ladder (v1.1+, introduce alone per the playbook):**
- *the cucumber* — cats-vs-cucumbers is a canonical viral genre. Mechanic sketch: the
  cat refuses to swat TOWARD the lane a cucumber sits in (fear) until something else
  knocks the cucumber off first. Teaches lane-denial; comedy is automatic.

**"Alive" icon treatments (CSS micro-animations, cheap, stagger the phases):**
- phone: occasional buzz-wiggle + screen glow (it's ringing — knock it off mid-call)
- mug: two tiny steam wisps · snow globe: shimmer on level start · keys: jingle rock
- yarn: a loose thread sway · box: flap twitch · all items: barely-there idle breathe
  with per-piece phase offset so the counter feels inhabited, not static
- Keep amplitude ~1% (the Goose Game rule: garnish on a rigid readable base)

**Level-pack/daily themes from the culture:** The Home Office (zoom chaos) · 3AM
Zoomies (night palette) · Boxing Day (everything cardboard) · the Christmas tree
(seasonal, already planned) · the cat-show trophy shelf.

**Copy hooks earned by research:** "dogs have owners; cats have staff" (loading tip),
"cat tax paid" (future share button), "loaf mode: engaged", receipt footer rotations.

Sources: [KQED cat-lady trope history](https://www.kqed.org/arts/13891913/how-the-crazy-cat-lady-became-one-of-pop-cultures-most-enduring-sexist-tropes) ·
[Modern Cat "Reclaiming Cat Lady"](https://moderncat.com/articles/reclaiming-cat-lady/) ·
[NPR on the 2024 cat-lady moment](https://www.npr.org/2024/07/29/nx-s1-5055616/jd-vance-childless-cat-lady-history) ·
[Keyboard Cat](https://en.wikipedia.org/wiki/Keyboard_Cat) ·
[Cats and the Internet](https://en.wikipedia.org/wiki/Cats_and_the_Internet) (Maru ~300M views, Nyan, lolcats) ·
[2025 meme roundups](https://felinefam.com/8-cat-memes-that-took-over-the-internet-in-2025-5-294050/) (zoom-call cat-astrophe, 3AM zoomies, loaf mode, cat tax, red-dot wars).

## 9. Open items for Steve

1. **Feel verdict on cat mode** — the gate for the full build (same gate as before,
   new skin).
2. Name: keep "Knock It Off!" knowing the Play-Store/toy collisions, or switch to a
   CLEAR alternate now before branding hardens.
3. The critic's 15-minute shelf test when convenient: search the actual App Store/Play
   for "cat knock table" / "swipe cat puzzle" and eyeball the top-20 — confirms the
   white-space claim against the real shelf.
