# Living Shelf Phase 0 Implementation Note

Date: 2026-07-19

## Outcome

The first coherent Living Shelf production slice now runs locally as a separate TypeScript workspace inside the games folder. It proves a Counter Cat result can be validated, turn into one provenance-backed unlock, be placed in a PixiJS gray-box room, survive a refresh at its exact position and rotation, and trigger a deterministic discovery.

The existing static games, including Counter Cat at waddle-home/index.html, were not changed.

## Architecture created

- Root npm workspaces with an isolated web app at apps/web.
- packages/ecosystem-core for versioned contracts, placement validation, idempotent rewards, and deterministic behavior evaluation.
- packages/shelf-pack for runtime validation, the Counter Cat test pack, and invalid fixtures.
- packages/save-data for IndexedDB storage, migration, snapshot recovery, JSON export/import, and serialized writes.
- packages/game-bridge for the only game-to-ecosystem entry point. It validates an event before applying any unlock rule.
- React and TypeScript provide the shell and accessible controls. PixiJS renders the room gray-box; DOM provides semantic controls and narration.

## Contracts finalized

Version 1 content contracts are implemented for:

- ShelfPack
- CollectibleDefinition
- BehaviorRecipe
- EcosystemEvent
- LivingShelfState
- UnlockReceipt
- PlacementState

Runtime validation rejects missing required fields, unsupported content versions, duplicate collectible ids, missing residents, and invalid behavior object references with usable messages.

## Save and migration behavior

- IndexedDB is the durable local source of truth; no cloud account or localStorage world save is used.
- Stable actions are queued, validated, and written atomically.
- The prior stable world is retained as one recovery snapshot before the next primary save commits.
- Drag previews live only in UI memory. A cancelled or interrupted drag cannot enter durable state.
- JSON export validates the current version. JSON import parses, validates, migrates when eligible, then saves.
- A tested version-one migration converts owned object ids into counted inventory and preserves placements and settings.

## Counter Cat test pack

The versioned Counter Cat test pack contains:

- Blue Mug: unique Case 01 reward with provenance copy.
- Yarn Ball: protected rolling test fixture with a clear Case 02 unlock rule.
- Dented Can: noisy rolling test fixture with a clear Case 03 unlock rule.
- Counter Cat bats a rolling Blue Mug from shelf or counter to the floor.
- Counter Cat protects Yarn Ball and redirects Blue Mug toward it when both share a valid surface.

The Yarn Ball and Dented Can are starter fixtures in this narrow slice so placement, collision, and both behavior rules can be verified without connecting a second real game result. Blue Mug ownership is only granted through the fake Counter Cat completion event.

## Player loop verified

At local preview URL http://127.0.0.1:5173/:

1. The fake Counter Cat Case 01 event validated and unlocked Blue Mug exactly once with its receipt.
2. A mouse placement on the counter saved as x 0.46, y 0.54, rotation 0 degrees.
3. Reload restored Blue Mug ownership and that same placement.
4. Keyboard R rotated the selected mug to 90 degrees; undo and redo restored each stable state.
5. Live mode ran the deterministic bat behavior, moved the mug to floor x 0.62, y 0.30, rotation 180 degrees, and recorded Gravity department notified.
6. Quiet mode prevented a further autonomous behavior run.
7. A 390 by 844 narrow-phone viewport retained readable controls and single-column layout.

## Tests and validation

- npm test: 18 tests passed across 5 test files.
- npm run build: passed.
- Browser flow: passed for unlock, duplicate prevention through contract coverage, mouse placement, refresh restore, keyboard rotate, undo/redo, deterministic behavior, quiet mode, and narrow layout.

## Known limitations

- This is a deliberately gray-box three-surface room, not the approved final six-zone environment.
- Counter Cat remains a placeholder resident. No final art, audio, full room physics, report replay, or second resident is present.
- The fake completion proves the bridge contract but does not yet wire the existing static Counter Cat result screen to the bridge.
- Pointer input is implemented through Pointer Events for mouse and touch; it still needs physical-phone QA before production.
- The initial Pixi bundle is intentionally unoptimized for this small proof and emits a production bundle-size warning.
- The folder has no Git repository, so this implementation has no version-control safety net in this checkout.

## Deliberate scope divergence

The approved release-level Shelf Pack target calls for five behavior recipes. This Phase 0 test pack deliberately has the two behaviors specified for this request, because the goal was to prove the contract and full local loop before producing additional content. This does not change the production target.

The approved later gray-box plan includes House Dog and six zones. This slice intentionally contains only the Counter Cat placeholder plus wall shelf, kitchen counter, and floor, matching the requested contained foundation.

## Exact next implementation ticket

LS-P1-01 — Counter Cat bridge adapter and provable legacy-progress import.

Create a small adapter outside waddle-home/index.html that translates verified Counter Cat completion records into versioned game events with stable event ids. Build a key-to-case coverage fixture from the existing static save data, emit only provable rewards, show a clear fallback for ambiguous legacy progress, and prove the original game remains playable if the Living Shelf is unavailable. Do not modify the current Counter Cat game loop until that adapter test matrix is green.
