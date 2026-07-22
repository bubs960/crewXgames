# CrewMultiply Play

CrewMultiply Play is a cozy, animal-first puzzle-game shelf. The repository contains the modern React/Vite site, shared game and save-data packages, and the playable game builds that feed the larger Living Shelf experience.

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

The development server prints the local URL when it starts.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:site
```

## Repository layout

- `apps/web/` — primary CrewMultiply Play web application
- `packages/` — shared game, bridge, ecosystem, and persistence packages
- `waddle-home/` — Counter Cat game build
- `pet-parade-sort/` — Pet Parade Sort game build
- `pup-purr-bento/`, `paws-yarn-tangle/`, and `mosaic-meadow/` — additional game prototypes
- Root Markdown files — product, implementation, and production handoff notes

## Deployment and advertising

The Git-connected Cloudflare Pages project is `crewxgames` and publishes at `https://crewxgames.pages.dev/`. Its production branch is `main`, build command is `npm run build`, and output directory is `apps/web/dist`. The intended custom domain is `play.crewmultiply.com`; the root domain and `www` remain on their existing GitHub Pages records.

The approved Adsterra starter batch contains one responsive display placement per eligible page plus the Social Bar. Every provider script is optional-consent gated. Active games, the Living Shelf, legal/support routes, offline/error pages, and not-found pages contain no ad mount. Popunder and clickunder formats are permanently excluded. See `ADSTERRA-STARTER-BATCH-2026-07-22.md` for the route map and replacement plan. Account credentials and provider secrets must never be committed.
