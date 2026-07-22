# Living Shelf Phase 1 — Counter Cat bridge

Date: 2026-07-19  
Ticket: LS-P1-01 — Counter Cat bridge adapter and provable legacy-progress import  
Status: complete and locally verified

## Boundary kept

- The legacy game remains at \`waddle-home/index.html\`; it was not edited.
- Its SHA-256 remains \`889F580D654387B32062FCE548244BDC73BEA4E7808683F64B408326C0C12628\`.
- The bridge is a new isolated workspace package at \`packages/counter-cat-bridge\`.
- There is no deployment, DNS, host, ad, or live-game-loop change.

## What imports safely

The adapter accepts a plain snapshot of legacy storage and never writes back to it.

- \`kio_done\` entries are accepted only when the JSON map contains the exact completion value \`1\`.
- A current \`kio_best:cat:<index>:<seed>:<rule>\` record can corroborate the same board and supply its move count.
- Every fixed ladder key is checked against the current static source:
  - 60 normal \`tilt\` keys map to \`case-01\` through \`case-60\`.
  - 28 expert \`lane\` keys map to \`expert-case-01\` through \`expert-case-28\`.
- A syntactically valid, calendar-valid \`daily:<YYYY-MM-DD>:<rule>\` completion becomes a \`daily.completed\` event rather than a fake normal case.
- Imported event ids are stable: \`legacy:counter-cat:v1:<legacy-board-key>\`. Re-running an import therefore reaches the existing event idempotency guard.
- Legacy saves do not provide an authentic completion timestamp or score. The adapter uses the import timestamp and score \`0\`; a corroborating best record provides its saved move count.

## What deliberately does not unlock anything

The import report supplies UI-ready fallback copy and leaves the original save untouched when it sees:

- malformed \`kio_done\` JSON or a value other than \`1\`;
- a board key absent from the source-locked coverage fixture;
- an invalid modern best-record value;
- a level pointer with no exact completion evidence;
- pre-seed prototype keys such as \`whc_best:*\`.

An ordinary \`kio_level:cat\` pointer does not generate noisy review state when exact completion proof is already present.

## Verification

- \`npm run typecheck:counter-cat-bridge\` — passed.
- \`npm test\` — 25 tests passed across 6 files.
- The bridge test locks its 88 keys and SHA-256 against \`waddle-home/index.html\`, verifies fallback behavior, and passes a real imported \`case-01\` event through \`receiveGameEvent\` to unlock the Blue Mug exactly once.
- \`npm run build\` — passed. Vite retains the pre-existing chunk-size warning only.
- A real browser loaded \`http://127.0.0.1:8765/waddle-home/\` with title **Counter Cat** and its live game controls. Temporary browser artifacts were removed afterward.

## Next bounded phase

Wire this snapshot-only adapter into a Living Shelf import entry point that can present \`summarizeCounterCatLegacyImport()\` to the player, persist accepted events through the existing local-first save flow, and leave \`waddle-home/index.html\` as a safe independent fallback until that end-to-end flow is proven.
