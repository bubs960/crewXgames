# CrewMultiply Play Site Phase 1 — Implementation Note

Date: 2026-07-19  
Workspace: `C:\Users\bubs9\apps\games`  
Local preview: `http://127.0.0.1:4173/`

## Outcome

Phase 1 is implemented as a polished, mobile-first CrewMultiply Play destination on the existing Vite + React + TypeScript workspace. The site presents six truthful game entries, preserves the five legacy game URLs and mechanics, exposes the functional Living Shelf and Cozy Crochet Critters build, provides route-specific detail and legal pages, and includes a versioned offline-capable PWA shell.

No deployment, DNS change, live advertising, analytics, account creation, or cloud configuration was performed.

## Architecture used

- Extended the existing npm workspace and `apps/web` application rather than creating a competing app.
- Added a lightweight client-side site router for the marketing/catalog/legal surface.
- Preserved the existing Living Shelf application as a lazy-loaded `/shelf/` boundary.
- Preserved all five legacy games as standalone static documents at their original URLs. Vite development/preview middleware and the production build copy those documents into the matching route folders.
- Kept Living Shelf, save-data, ecosystem, bridge, shelf-pack, and game packages intact.
- Added a versioned service worker with network-first navigation, cache-first versioned assets, current-page offline recovery, and a dedicated offline fallback.

## CrewMultiply correction

- Every active public surface now uses `CrewMultiply Play` and the planned canonical host `play.crewmultiply.com`.
- SEO metadata, sitemap, robots, PWA labels, service-worker cache namespace, legal copy, Shelf labels, and retained static entry points were updated together.
- Existing internal `@teammultiply/*` workspace package scopes and durable IndexedDB identifiers remain compatibility-only implementation names; they are not exposed as the public brand.

## Homepage visual continuation — 2026-07-21

- Replaced the compressed gameplay-screenshot hero with original 1672 × 941 CrewMultiply Play key art: a black cat, tactile puzzle board, yarn, crochet, meadow, bento, and pet-parade details arranged as one connected animal-puzzle world.
- Kept the 1.97 MB PNG master at `apps/web/public/assets/hero/crewmultiply-play-hero-v2.png` and added a visually verified 160 KB WebP at `apps/web/public/assets/hero/crewmultiply-play-hero-v2.webp` for production delivery.
- Added a high-priority WebP preload and a `<picture>` fallback so modern browsers receive the optimized asset while the detailed source remains available.
- Added a truthful first-fold proof rail for six playable worlds, daily challenges, and local-first access, plus a desktop-only Counter Cat case card.
- Verified the responsive crop, text contrast, image load, case-card breakpoint, menu focus, and horizontal overflow at 1440 × 1000, 768 × 900, and 390 × 844.
- Captured `output/playwright/crewmultiply-home-v2-desktop.png` and `output/playwright/crewmultiply-home-v2-mobile.png`.
- Added a 22-second compositor-only camera drift to the hero art and a separate 15-second transform/opacity atmospheric drift, both gated behind `prefers-reduced-motion: no-preference`.
- Verified two active hero animations in normal desktop and mobile modes, a changing rendered transform over time, and zero active hero animations with `prefers-reduced-motion: reduce`.

## Routes completed

Site routes:

- `/`
- `/games/`
- `/games/counter-cat/`
- `/games/mosaic-meadow/`
- `/games/pup-purr-bento/`
- `/games/paws-yarn-tangle/`
- `/games/pet-parade-sort/`
- `/games/cozy-crochet-critters/`
- `/daily/`
- `/about/`
- `/privacy/`
- `/terms/`
- `/cookies/`
- `/ads-and-rewards/`
- `/accessibility/`
- `/contact/`
- `/shelf/` and `/shelf/#cozy-crochet`
- A useful SPA 404 for unknown routes, plus a production `404.html` fallback.

Preserved game launches:

- `/waddle-home/` — Counter Cat
- `/mosaic-meadow/`
- `/pup-purr-bento/`
- `/paws-yarn-tangle/`
- `/pet-parade-sort/`

## Main files added or migrated

- `apps/web/src/App.tsx` — site/Shelf route boundary.
- `apps/web/src/LivingShelfApp.tsx` — preserved Living Shelf application.
- `apps/web/src/site/SiteApp.tsx` — shared shell, routes, metadata, catalog, detail, daily, legal, consent, and 404 views.
- `apps/web/src/site/SiteApp.css` — responsive tabletop visual system, mobile navigation, filters, stable ad slots, focus, and reduced-motion treatment.
- `apps/web/src/site/gameCatalog.ts` — truthful six-game catalog and route data.
- `apps/web/tests/site.test.ts` — catalog, route, and legacy compatibility assertions.
- `apps/web/vite.config.ts` — legacy-route development middleware and production migration copy.
- `apps/web/index.html`, `apps/web/src/main.tsx`, and `apps/web/src/vite-env.d.ts` — metadata, PWA registration, and TypeScript support.
- `apps/web/public/` — real screenshots, social card, icons, manifest, robots, sitemap, offline page, redirects, service worker, and production copies of legacy games.
- `scripts/verify-site.mjs` — direct route, legacy game, and public artifact verification.
- `eslint.config.mjs`, root package scripts, and lockfile updates — repeatable typecheck/lint/test/build workflow.

## Existing-game compatibility

- No legacy game mechanic was rewritten.
- All five original URLs still load directly in the production preview.
- Counter Cat was launched from its new detail page into its real interactive board.
- Mosaic Meadow, Pup & Purr Bento, Paws & Yarn Tangle, and Pet Parade Sort were each directly loaded and identified in the browser with no console errors or warnings.
- The catalog and daily surfaces link directly to the real standalone games.
- Pet Parade Sort retains its approved name.

## Adsterra and privacy posture

- Adsterra is named as the intended future provider in Privacy, Cookies & Storage, and Ads & Rewards.
- Reserved display placements are clearly labelled `Advertisement`, size-stable, and outside active gameplay.
- No Adsterra script, iframe, identifier, cookie, ad response, analytics tag, or advertising-network request is present.
- Popunders, Social Bar, Smartlinks, overlays, forced redirects, and active-play interstitials are explicitly excluded.
- Privacy preferences persist in local storage under `cm_privacy_choice_v1`; a valid legacy `tm_privacy_choice_v1` choice is migrated once for continuity.
- Choosing either current preference does not activate optional code because provider configuration is intentionally absent.
- The policies retain visible pre-launch warnings and do not invent an operator name, address, mailbox, certification, or finalized processor inventory.

## Verification results

Automated gates:

- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — 15 test files passed; 63 tests passed.
- `npm run build` — passed; 502 modules transformed.
- `npm run verify:site` — 17 application routes, 5 legacy games, and 9 public/PWA artifacts verified.

Browser checks:

- Desktop: 1440 × 1000.
- Phone: 390 × 844.
- Homepage, catalog, Counter Cat detail, legal, functional Shelf/Cozy, preserved games, and custom 404 loaded directly.
- Mobile menu opens, moves focus into navigation, closes with Escape, and returns focus to the menu button.
- Keyboard Tab navigation reaches the direct Play and Browse actions with visible focus.
- Catalog filters work for positive, combined zero-result, clear, and reset states.
- Privacy preference persisted after a full reload.
- A valid legacy privacy choice migrated from `tm_privacy_choice_v1` to `cm_privacy_choice_v1` and removed the legacy key.
- Reduced-motion emulation reduced the site animation and transition duration to `0.00001s`.
- Desktop and phone checks reported no horizontal document overflow.
- All 14 homepage images loaded successfully after lazy-load scrolling; no blank image remained.
- Representative route titles, descriptions, and `https://play.crewmultiply.com/...` canonicals updated correctly.
- Homepage, mobile navigation, Privacy, and Terms rendered `CrewMultiply Play` with no retired public brand text; Terms and Privacy both rendered the planned-but-inactive Adsterra disclosure.
- No external script source or advertising-network request was observed.
- Browser console checks were clean on the final online and offline passes.
- The rebranded service worker cache restored the current homepage offline without stale hashed assets or console failures. An earlier stale-shell lookup was discovered during QA, fixed, and re-tested.

## Screenshots produced

- `output/playwright/crewmultiply-phase1-home-desktop.png`
- `output/playwright/crewmultiply-phase1-catalog-desktop.png`
- `output/playwright/crewmultiply-phase1-counter-cat-desktop.png`
- `output/playwright/crewmultiply-phase1-mobile-nav.png`

## Deferred features

- Cloudflare deployment and `play.crewmultiply.com` DNS mapping.
- Live Adsterra configuration, consent-vendor integration, category controls, and any ad activation.
- Analytics, accounts, cloud saves, public profiles, payments, and leaderboards.
- Final operator identity, jurisdiction, addresses, monitored mailboxes, retention language, and counsel approval.
- Physical-phone, Safari, screen-reader, 200%/400% zoom, assistive-technology, and production Core Web Vitals evidence.
- A final release-specific cache-version bump or automated build-version injection for each future public release.

## Risks and blockers

1. The workspace is not a Git repository. There is no verified commit history, rollback point, or branch protection for this build.
2. Legal drafts are deliberately incomplete until the real operator, jurisdiction, contact channels, and counsel review are supplied.
3. Browser emulation is not a substitute for physical iOS/Android and assistive-technology testing.
4. The user reports that the domain/site and a Cloudflare account are available, but no deployment or DNS authorization was inferred from that statement.
5. The in-app browser connector failed during initialization with `Cannot redefine property: process`; the full browser pass was completed with the local Playwright CLI fallback instead.

## Exact recommended next build phase

**Phase 2 — Controlled Cloudflare preview and launch readiness, with ads still off.**

First initialize and commit this workspace to a real Git repository. Then deploy the current production build to a non-production Cloudflare preview URL without changing DNS. Use that preview for physical-device, Safari, screen-reader, zoom, security-header, caching, and Core Web Vitals verification. In parallel, supply the real legal operator/contact fields and review the exact inactive Adsterra configuration and consent requirements. Only after those gates pass should a separately approved release map `play.crewmultiply.com`; Adsterra should remain disabled until its own activation review is complete.
