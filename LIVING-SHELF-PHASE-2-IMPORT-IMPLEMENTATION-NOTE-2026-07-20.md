# Living Shelf Phase 2 — Counter Cat local import

Date: 2026-07-20  
Ticket: LS-P1-02 — Player-facing, review-first Counter Cat import  
Status: complete and locally verified

## Boundary kept

- The legacy game at `waddle-home/index.html` was not edited. Its SHA-256 remains `889F580D654387B32062FCE548244BDC73BEA4E7808683F64B408326C0C12628`.
- There is no deployment, DNS, ad, or legacy-game-loop change.
- The import reads only the current browser's same-origin storage snapshot. It does not open Counter Cat, cross origins, or write to the old game's save.
- The current Vite route setup serves the Shelf and `/waddle-home/` on the same site origin, which makes this voluntary local import possible without a remote transfer channel.

## What landed

- `packages/counter-cat-bridge/src/browser-storage.ts` adds a minimal storage reader. It examines only `kio_done`, the known Counter Cat level pointers, and Counter Cat best-record prefixes; unrelated browser keys are excluded.
- `packages/counter-cat-bridge/src/import-workflow.ts` turns a reviewed bridge report into existing `receiveGameEvent` calls. It returns accepted, duplicate, reward, and receipt information without persisting anything itself.
- `apps/web/src/counterCatLegacyImport.ts` applies every event in memory first, then calls the normal local-first Shelf save exactly once when there is new accepted progress. A failed save does not replace the displayed Shelf world.
- `apps/web/src/LivingShelfApp.tsx` now exposes an accessible two-step flow: **Review Counter Cat progress**, then an explicit import button only when exact completion proof exists. It clearly distinguishes no proof, verified progress, successful import, duplicate replay, and saved records that still need review.
- The old public fake-completion/demo control was removed from the Shelf surface.

## Player-facing behavior

- Exact legacy completion evidence can unlock the mapped Shelf reward through the existing provenance-preserving game-event boundary.
- The review panel states that only this same-browser snapshot was read and that Counter Cat and its save remain unchanged.
- A replay reaches the existing idempotency guard: it reports that the case is already in the Shelf record and adds no second reward.
- Ambiguous pointers, malformed data, and unsupported historical records stay as review-only fallback entries. They never become an unlock.

## Tests and local verification

- `packages/counter-cat-bridge/tests/import-workflow.test.ts` proves the storage snapshot is scoped, a verified case unlocks through the game-event boundary once, replay is safe, and absence of proof leaves the state untouched.
- `apps/web/tests/counter-cat-import.test.ts` uses the real IndexedDB-backed Shelf storage to prove one reviewed import persists the Blue Mug and replay does not duplicate it.
- `npm run typecheck` — passed.
- `npm run typecheck:counter-cat-bridge` — passed.
- `npm run lint` — passed.
- `npm test` — passed: 57 tests across 13 files.
- `npm run build` — passed.
- `SITE_URL=http://127.0.0.1:5173 npm run verify:site` — passed: 17 app routes, 5 legacy games, and 9 public artifacts.
- Browser verification at `/shelf/` covered no-data review, a seeded exact `kio_done` review, explicit import, duplicate replay, and refresh persistence. `/waddle-home/` still loads as **Counter Cat** with its independent game controls and no browser errors.

## Known local boundary

This phase can only see an eligible Counter Cat save when it is present in the current browser on the same site origin. It intentionally does not add cross-origin reads, file-upload import, remote sync, or outbound events from the legacy game.

## Next bounded phase

If desired, LS-P1-03 can add a carefully scoped live completion relay from Counter Cat to the Shelf. That would be the first phase that needs an explicit decision to touch the legacy game's completion path; it should retain the current source-lock, provenance, and replay-safety tests.
