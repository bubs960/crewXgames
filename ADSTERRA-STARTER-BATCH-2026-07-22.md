# Adsterra approved inventory — July 22, 2026

## Approved inventory

| Surface | Reporting batch | Wider screens | Smaller screens | Social Bar |
| --- | --- | --- | --- | --- |
| Home | Discovery | 728 × 90 | 300 × 250 | Discovery code · optional |
| Games index | Discovery | 728 × 90 | 300 × 250 | Discovery code · optional |
| Daily | Discovery | 728 × 90 | 300 × 250 | Discovery code · optional |
| Six game detail pages | Game detail | 728 × 90 | 300 × 250 | Game-detail code · optional |

One display unit is mounted per eligible page. The two approved batches separate discovery traffic from game-detail traffic without multiplying inventory across six games. `AdsterraAds.tsx` remains the single replacement point when more route-specific or game-specific placement codes become useful.

## Excluded surfaces

- Every active game build and puzzle board
- Living Shelf and its embedded games
- Privacy, terms, cookies, ads-and-rewards, accessibility, about, and contact
- Offline, error, and not-found views
- Popunders and clickunders everywhere, permanently
- Smartlinks, forced interstitials, disguised controls, and ad-gated game progress

## Consent and lifecycle

No Adsterra request is made until the visitor chooses **Allow optional**. **Necessary only** keeps the scripts absent and leaves all games playable. Withdrawing an earlier optional choice reloads the current page to remove provider-injected UI. Crossing between an eligible content route and an excluded route uses a full navigation for the same reason.

Adsterra’s supplied loaders dynamically add campaign-specific HTTPS scripts, frames, images, and measurement requests, including hosts that are not known at build time. The Cloudflare Content Security Policy therefore permits those HTTPS resource classes while continuing to block objects, outside framing, unapproved forms, and sensitive browser capabilities. The application mounts provider loaders only on monetized routes after consent; that gate—not a fixed provider-host allowlist—is the control that prevents third-party requests before permission.

## Future code batches

If Adsterra enables more placement codes, split the remaining shared discovery batch before creating one code per game:

1. Home discovery
2. Games index
3. Daily
4. Optional per-game detail codes only if reporting or advertiser performance justifies the added inventory

This keeps reporting useful without multiplying scripts unnecessarily. Social Bar reporting is currently separated into the same discovery and game-detail surface classes.

## Cloudflare and domain

- Pages project: `crewxgames`
- Pages URL: `https://crewxgames.pages.dev/`
- Intended custom domain: `play.crewmultiply.com`
- Namecheap DNS change: add only CNAME host `play` to `crewxgames.pages.dev` after the custom domain has first been associated in the Cloudflare Pages dashboard
- Preserve every existing apex `@` A record and the existing `www` CNAME

Provider behavior, ad categories, real-device layout, regional consent requirements, final legal-operator details, and monitored reporting contacts still require launch review.
