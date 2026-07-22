# TeamMultiply Play Brand and Launch Preparation

Date: 2026-07-17
Status: Working brand direction, local pre-launch build, and approved Living Shelf ecosystem

## Approved product spine

TeamMultiply Play is now organized around **The Living Shelf**, a persistent playable animal environment connecting every game through functional objects, residents, behaviors, discoveries, story packets, and daily Mischief Reports.

The authoritative production specification is `LIVING-SHELF-ECOSYSTEM-PRODUCTION-PLAN-2026-07-17.md`.

Every game remains independently playable and must also ship a versioned Shelf Pack. The former generic collection-page concept is retired.

## Domain finding

`teammultiply.com` is already live behind Cloudflare as a Singapore multichannel-commerce platform. Publishing this games folder to the root would replace or conflict with that business and its search identity.

Launch decision required:

1. Deliberately replace the current site and redirect or retire its existing commerce URLs.
2. Use `play.teammultiply.com` for the games while the current root remains intact. This is the recommended low-risk option.
3. Place the games at `teammultiply.com/play/`, which preserves the root but requires coordination with the existing deployment.

Until that choice is explicit, this games website stays local and no DNS or production deployment should change.

## Brand architecture

- Parent/domain: TeamMultiply
- Consumer games brand: TeamMultiply Play
- Working tagline: Small moves. Big mischief.
- Flagship: Counter Cat
- Library name in copy: the animal puzzle shelf
- Brand promise: premium-looking animal games with real puzzles, fair rules, and memorable physical reactions

TeamMultiply works when "multiply" describes the game effect: one small move creates several consequences. It also supports a cast of animals with distinct puzzle behaviors. The games should not imitate the typography, color, or business language of the existing commerce site if the two brands continue together.

## Audience

Primary audience:

- Puzzle players age 13 and older.
- Adults who enjoy daily games, cozy subjects, animals, and short sessions.
- Players who want more challenge and less manipulation than common hyper-casual games.

Do not market the service as a children’s game destination until legal counsel and every ad/data provider approve a child-directed model. Animated animals can attract children, but the visual language should remain sophisticated, tactile, and puzzle-first rather than preschool-coded.

## Voice

- Short, dry, observant, and affectionate.
- Animals have motives; they are not baby-talk mascots.
- The puzzle rule comes before the joke.
- Failure copy should clarify what happened, then add personality.
- Counter Cat remains the strongest voice: scientist, suspect, household authority, and unrepentant witness.

Examples:

- "The floor is accepting new evidence."
- "Same puzzle. Different alibi."
- "The counter will not clear itself."
- "Hard can still be fair."

Avoid:

- Excessive puns in functional controls.
- Generic "pawsome" copy on every page.
- Language implying random rewards are guaranteed.
- Childlike misspellings or baby talk.

## Visual system

Direction: premium tabletop playroom.

- Ink `#171714`: navigation, footer, serious contrast.
- Paper `#F7F4EE`: site background.
- Coral `#E9653F`: primary action and Counter Cat.
- Teal `#147A78`: navigation accents and trustworthy utility.
- Gold `#F0C843`: focus, achievement, daily signal.
- Green `#4D7D4C`: meadow and positive state.
- Berry `#BB4667`: yarn, collection, secondary energy.
- Sky `#A9D5DC`: air, water, and quiet backgrounds.

Use crisp system typography now, then license or self-host a distinctive display family after brand clearance. Avoid a one-color palette, excessive rounding, floating cards, dark-blue SaaS styling, or childish primary-color overload.

Use actual game frames as the primary site imagery. Future production art should show real gameplay or animal reactions, not generic atmospheric mascots.

## First page set

Implemented locally:

- `/` - branded homepage with Counter Cat hero and full shelf preview.
- `/games/` - complete game catalog.
- `/games/counter-cat/` - flagship product landing page.
- `/daily/` - shared daily challenge destination.
- `/about/` - product philosophy and roadmap summary.
- `/privacy/` - data and child-audience working draft.
- `/terms/` - use terms working draft.
- `/cookies/` - browser storage and consent working draft.
- `/ads-and-rewards/` - public advertising standard.
- `/accessibility/` - accessibility target and known work.
- `/contact/` - mailbox and support-routing plan.

Next pages:

- Individual landing pages for the remaining four released games.
- `/shelf/` for the full interactive Living Shelf environment.
- `/shelf/journal/` for residents, object provenance, discoveries, and story history.
- `/new/` or release notes for discoverability.
- Custom 404 page that routes back to Games and Daily.
- Press/brand assets only after the wordmark and mascot art are final.

## Advertising launch rule

Adsterra can supply display, native, popunder, Social Bar, and interstitial formats. TeamMultiply Play should use only reserved display or carefully reviewed native units at launch.

Explicitly exclude at launch:

- Popunders and clickunders.
- Social Bar or notification-like overlays.
- Active-play interstitials.
- Sticky units over game content.
- Smartlinks disguised as game controls.
- Reward ads required for campaign completion.

Ads remain disabled until:

1. The domain and legal operator are final.
2. Privacy and cookie pages list the actual providers and data.
3. Consent blocks optional scripts before choice where required.
4. The ad account can enforce appropriate content categories.
5. Child-audience classification is complete.
6. Failed and closed ad flows are tested.
7. Mobile placements have no overlap or layout shift.

## Legal completion list

The current legal pages are working drafts, not legal advice. Before launch:

1. Insert the legal entity name, physical address, country, and registration details where required.
2. Select governing law and have counsel review Terms and liability language.
3. Activate and secure `privacy@`, `support@`, `ads@`, `accessibility@`, `legal@`, and `security@` mailboxes or replace them with confirmed addresses.
4. Decide whether the service is general-audience, mixed-audience, or child-directed based on the full FTC factors and actual marketing.
5. Inventory every cookie, local-storage key, cache, analytics event, ad identifier, provider, purpose, and retention period.
6. Implement region-appropriate consent and withdrawal before optional scripts load.
7. Implement applicable US state privacy request and opt-out handling even if current statutory revenue/data thresholds are not met.
8. Add provider agreements, data-processing terms, and child-suitability restrictions.
9. Test that rejecting optional technology leaves the games fully playable.
10. Preserve dated versions of every published legal page.

## Search and social prep

- Canonical brand: TeamMultiply Play.
- Homepage title: `TeamMultiply Play | Small moves. Big mischief.`
- Homepage description: `A growing shelf of polished animal puzzle games led by Counter Cat.`
- Counter Cat title: `Counter Cat | TeamMultiply Play`.
- Prepare one 1200 by 630 social image using the final game artwork and wordmark.
- Add canonical URLs and Open Graph metadata only after the final host path is chosen.
- If the root commerce site remains, prevent keyword and title overlap between commerce and games.

## Launch sequence

1. Confirm root replacement versus `play.teammultiply.com`.
2. Confirm legal operator and working contact addresses.
3. Finalize Living Shelf contracts and the versioned local save model.
4. Build the Counter Cat Living Shelf vertical slice.
5. Connect the five existing games through Shelf Packs and one shared event bridge.
6. Finish landing pages for all released games and the `/shelf/` experience.
7. Perform keyboard, screen-reader, phone, zoom, reduced-motion, save-recovery, and performance testing.
8. Integrate test ads behind consent and outside games and the Living Shelf.
9. Run an ad-category and destination review.
10. Add social artwork, canonical metadata, sitemap, robots, and custom 404.
11. Soft launch without active ads to validate games, rewards, and saves.
12. Activate one display placement, observe exits and return play, then decide whether a second placement is justified.

## Research references

- FTC COPPA guidance: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- EU cookie guidance: https://europa.eu/youreurope/business/dealing-with-customers/data-protection/online-privacy/index_en.htm
- California Privacy Protection Agency FAQ: https://cppa.ca.gov/faq
- Adsterra format overview: https://adsterra.com/ad-formats/
- Adsterra placement overview: https://adsterra.com/blog/ad-placement-strategies/
