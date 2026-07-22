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

Cloudflare deployment and the production domain will be connected as a separate release step. Adsterra advertising must remain aligned with the site’s consent, privacy, cookie, terms, and ads-and-rewards disclosures; account credentials and provider secrets must never be committed.
