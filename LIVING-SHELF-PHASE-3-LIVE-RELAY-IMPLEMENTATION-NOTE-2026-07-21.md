# Living Shelf Phase 3 — Counter Cat live completion relay

Date: 2026-07-21  
Ticket: LS-P1-03 — Review-first same-origin completion relay  
Role: Builder chat  
Status: complete and locally verified

## Current state

- This workspace has no Git metadata: `git status --short --branch` returns `fatal: not a git repository`. There is therefore no branch or dirty-tree evidence to report.
- No deployment, DNS, account, advertising, or remote-sync action was taken.
- Counter Cat's canonical source, the web-app compatibility copy, and the final built `dist/waddle-home/index.html` now share SHA-256 `84A85F1F6277488F1FD34C7E5BB64221C1181513DD739B27187E86288CD67C80`.

## Completed this phase

- A Counter Cat win now writes a small version-one same-origin outbox record after its existing `kio_done` completion write. The record contains only the source-locked board key, stable event id, ISO completion time, and move count.
- The Counter Cat win card includes **Bring case to Shelf**, which routes to `/shelf/?counter-cat=relay` without changing the game result or requiring the Shelf to be available.
- `packages/counter-cat-bridge/src/live-relay.ts` strictly validates the outbox before creating an ecosystem event: schema version, exact ISO timestamp, nonnegative integer moves, source-locked case/daily identity, and the expected stable event id must all match.
- Legacy migration and live relay now share `counterCatEventFromLegacyRecord()`, so the same Counter Cat case always reaches the same idempotency key: `legacy:counter-cat:v1:<legacy-key>`.
- The Shelf reads queued cases at startup and listens for same-origin `storage` events from another open Counter Cat tab. It displays a distinct review panel and requires the player to press **Add completed case to Shelf**.
- The Shelf applies the batch in memory through the existing `receiveGameEvent` boundary, saves once only if there is new progress, then acknowledges only accepted or duplicate outbox ids. If acknowledgement fails, the handoff remains queued and retry stays safe.
- A duplicate live case is shown as already recorded and cannot create a second reward.
- The compatibility copy at `apps/web/public/waddle-home/index.html` was kept byte-for-byte synchronized with the canonical game source.

## Files changed or reviewed

- `waddle-home/index.html`
- `apps/web/public/waddle-home/index.html`
- `packages/counter-cat-bridge/src/legacy.ts`
- `packages/counter-cat-bridge/src/live-relay.ts`
- `packages/counter-cat-bridge/src/import-workflow.ts`
- `packages/counter-cat-bridge/src/index.ts`
- `packages/counter-cat-bridge/src/coverage.ts`
- `apps/web/src/LivingShelfApp.tsx`
- `apps/web/src/counterCatLegacyImport.ts`
- `packages/counter-cat-bridge/tests/live-relay.test.ts`
- `apps/web/tests/counter-cat-relay.test.ts`
- `packages/counter-cat-bridge/tests/legacy.test.ts`

## Verification

- `npm run typecheck` — passed.
- `npm run typecheck:counter-cat-bridge` — passed.
- `npm run lint` — passed.
- `npm test` — passed: 63 tests across 15 files.
- `node waddle-home/tools/bench.mjs verify` — passed: 20 legacy simulator fixtures, 60 Counter Cat normal levels, and 28 expert levels.
- `npm run build` — passed.
- `SITE_URL=http://127.0.0.1:5173 npm run verify:site` — passed: 17 app routes, 5 legacy games, and 9 public artifacts.
- Browser proof in an isolated same-origin session:
  1. A Counter Cat Case 01 result produced one relay record with `legacy:counter-cat:v1:cat:0:4128371639:tilt` and 3 swats.
  2. **Bring case to Shelf** opened the review panel, whose explicit confirmation unlocked one Blue Mug with provenance.
  3. A new relay sent from another Counter Cat tab surfaced live in the already-open Shelf tab.
  4. Confirming that duplicate showed **already recorded**, kept the Blue Mug count at one, removed the processed relay record, and left `kio_done` at `1`.
  5. Refreshing the Shelf restored the one Blue Mug and showed no pending relay.
- Browser console: no errors. The dev server still reports its existing unused hero-preload warning on the Shelf route.

## Open risks and boundaries

- This is deliberately same-browser and same-origin only. It does not add an account, remote sync, file upload, cross-origin read, or cross-device transfer.
- A malformed relay is retained for review and cannot unlock anything; this phase does not add a destructive clear action for unclear proof.
- No physical-phone or production-host evidence exists yet.
- Counter Cat currently has Shelf collectible rules for normal Cases 01–03. The relay can faithfully express normal, expert, and daily event shapes, but it does not invent rewards where the current Shelf Pack has no rule.

## Guardrails for the next chat

- Keep the live relay review-first. Do not auto-apply a game event merely because it is present in browser storage.
- Keep `legacy:counter-cat:v1:<legacy-key>` stable across migration and live delivery; changing it would defeat duplicate protection.
- Preserve the source-lock test whenever Counter Cat changes. Update its source hash only as part of an intentional reviewed game edit.
- Do not remove or overwrite malformed outbox records automatically.

## Resume instruction

Resume from this file. First verify that this remains a non-Git workspace, then inspect the canonical Counter Cat source, `live-relay.ts`, `LivingShelfApp.tsx`, and the relay tests before repeating claims. Next bounded action: define explicit Counter Cat Shelf Pack unlock rules for expert and daily completions (and their player-facing object/provenance treatment) before expanding live relay rewards beyond the existing normal Cases 01–03.
