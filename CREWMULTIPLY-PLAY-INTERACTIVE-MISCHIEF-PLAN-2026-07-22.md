# CrewMultiply Play — Interactive Mischief Plan

**Status:** Approved for a later production phase

**Created:** July 22, 2026

**Purpose:** Add small, memorable cat interactions that reward curiosity without interrupting play, accessibility, or trust.

## Product Direction

Interactive mischief should make CrewMultiply Play feel alive. These moments are optional delight, not progression gates, hidden rewards, ad triggers, or required instructions.

The first pack should appear on the Counter Cat home/detail experience after the current deployment, legal, advertising, and accessibility readiness gates are complete. It can later expand into the Living Shelf and other cat-led games.

## First Mischief Pack

### 1. Suspicious Cucumber

- Place a small illustrated cucumber where an observant player can discover it near Counter Cat.
- Hover or keyboard focus gives a silent clue: the cat notices it, widens its eyes, or flicks its tail.
- Click, tap, Enter, or Space triggers one short cartoon reaction: a hop, arched pose, and cucumber roll-away.
- The sequence runs once, then enters a cooldown so it cannot become distracting.
- Keep the joke clearly fictional and playful; it must not suggest that people should frighten real animals.

### 2. Pet the Cat

- Hover or keyboard focus may trigger a silent ear twitch, slow blink, or tail swish.
- Click, tap, Enter, or Space triggers a purr or soft chirp only after an intentional user action and only when sound is enabled.
- Pair audio with visible feedback such as a contented pose and the accessible status message “Counter Cat purrs.” Sound must never be the only response.
- Allow a few rare visual variants later, such as loaf mode, a gentle paw tap, or a sleepy stretch. These are cosmetic and do not use random-reward mechanics.

## Interaction and Accessibility Contract

- Never make hover the only way to discover or activate an interaction. Mouse, touch, and keyboard receive equivalent outcomes.
- Build the interactive cat and cucumber as native buttons or equally correct semantic controls with clear accessible names.
- Keep focus indicators visible against every background and preserve the existing high-contrast palette.
- Never play sound on page load, on hover, or on focus. Load and play audio only after deliberate activation, and honor the site's mute setting.
- Announce meaningful non-audio feedback through a short polite live region without repeatedly interrupting screen-reader users.
- Respect `prefers-reduced-motion`. Replace hops, shakes, and rolls with a near-instant pose or copy change that preserves the joke.
- Do not flash, strobe, trap focus, shift the page layout, or interfere with zoom and text resizing.
- Keep each reaction brief, cancellable, and non-looping. Decorative ambient motion remains independently suppressible.

## Technical Shape

- Use CSS transitions or short keyframes for `transform` and `opacity`; avoid layout-triggering animation properties.
- Reuse current character art where possible. Any new cucumber or reaction asset should be a small optimized SVG or WebP with meaningful or deliberately empty alternative text as appropriate.
- Lazy-load the tiny audio asset after the first intentional interaction. The experience must remain complete when audio is unavailable.
- Prevent overlapping reactions, clear timers on teardown, and apply a local cooldown.
- Keep the feature isolated from game state, saves, analytics consent, ad placement, and progression.

## Delivery Sequence

1. Finish the current Cloudflare deployment, custom-domain, legal, contact, advertising-consent, and accessibility readiness gates.
2. Prototype both interactions on the Counter Cat home or game-detail surface without changing the active puzzle loop.
3. Test mouse, keyboard, touch, screen-reader labeling, mute behavior, reduced motion, high contrast, and 200% zoom.
4. Confirm no layout shift, long task, accidental audio, ad collision, or gameplay input conflict on desktop and phone.
5. Release the first pack behind a simple feature flag, observe it, then consider extending the reaction system to the Living Shelf.

## Acceptance Gates

- Both interactions work with mouse, touch, Enter, and Space.
- Hover and focus feedback is silent; audio requires a deliberate activation and respects mute.
- Reduced-motion users receive an equivalent static reaction.
- No reaction causes cumulative layout shift or blocks navigation and play.
- No Easter egg changes score, rewards, save data, ad behavior, or consent state.
- The experience remains understandable with images, sound, CSS animation, or JavaScript audio unavailable.
- Phone and desktop verification shows smooth, short reactions with no console errors.

## Future Backlog

- Cat-specific reaction personalities across games.
- A quiet “find the loaf” shelf moment.
- Seasonal props with the same accessibility and no-surprise-audio contract.
- Optional reaction journal entries only if they remain cosmetic and deterministic.
