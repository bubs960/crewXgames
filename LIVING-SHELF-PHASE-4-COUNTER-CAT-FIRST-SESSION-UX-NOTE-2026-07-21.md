# Living Shelf Phase 4 — Counter Cat first-session UX

Date: 2026-07-21  
Ticket: LS-P1-04 — First-session comprehension and control clarity  
Role: Builder chat  
Status: complete and locally verified

## Current state

- This workspace has no Git metadata: `git status --short --branch` returns `fatal: not a git repository`. There is therefore no branch or dirty-tree evidence to report.
- No deployment, DNS, account, advertising, or remote-sync action was taken.
- Counter Cat's canonical source, the web-app compatibility copy, and the final built `apps/web/dist/waddle-home/index.html` share SHA-256 `E70D3066F0E011C42E5E8CAE7410F1972F9925633910C5DFB863F1C22F830246`.

## Completed this phase

- New players now begin in whole-counter **Tilt** mode, the clearest version of the core interaction. Existing players retain their saved Expert/Tilt preference; historic players without that preference retain the previous Expert behavior.
- A true first-time player receives a focused **First case briefing** that explains the objective, swipe/arrow-key controls, Tilt behavior, protected yarn, and unlimited Undo/Reset before play begins.
- Case 01 keeps a compact progress-aware guide directly above the board. It names the exits, controls, and safety net; its status changes after a valid swat and after an object reaches the floor.
- The board visually calls out orange objectives, blue yarn, and arrow gaps only while the Case 01 guide is active. The guide disappears once Case 01 is filed, so it does not burden returning play.
- The win card for a first Case 01 completion closes the loop, explains Floor versus optional Shelf handoff, and labels the next action **Open Case 02**. It does not auto-send the player to the Shelf.
- The always-available instructions now lead with goal and controls, introduce Tilt before Expert, and preserve the safety, daily, Floor, and optional Shelf concepts.
- Fixed a discovered control hit-target defect: the decorative counter shadow no longer intercepts Reset taps on mobile or desktop.
- Canonical and compatibility copies remain byte-for-byte synchronized; source-lock and site tests now protect both the onboarding surface and that mirror contract.

## Files changed

- `waddle-home/index.html`
- `apps/web/public/waddle-home/index.html`
- `packages/counter-cat-bridge/src/coverage.ts`
- `packages/counter-cat-bridge/tests/legacy.test.ts`
- `apps/web/tests/site.test.ts`

## Verification

- `npm run typecheck` — passed.
- `npm run typecheck:counter-cat-bridge` — passed.
- `npm run lint` — passed.
- `npm test` — passed: 67 tests across 15 files.
- `node waddle-home/tools/bench.mjs verify` — passed: 20 legacy fixtures, 60 Counter Cat normal levels, and 28 expert levels.
- `npm run build` — passed.
- `SITE_URL=http://127.0.0.1:5173 npm run verify:site` — passed: 17 app routes, 5 legacy games, and 9 public artifacts.
- Browser proof in isolated local sessions:
  1. A fresh 390×844 player started at Level 1/60 in Tilt, received the First case briefing, and saw the Case 01 guide after dismissal with no console errors.
  2. A real ArrowRight input changed the guide to its post-swat coaching state; Reset returned the board and guide to zero swats, proving the repaired tap target.
  3. The real Case 01 solution `Up → Left → Up` produced the first-win card, optional **Bring case to Shelf**, and **Open Case 02**.
  4. A simulated historic player with `kio_level:cat` but no mode preference stayed in Expert at Level 4/28 and did not receive the beginner briefing.

## Open risks and boundaries

- Browser verification used desktop and 390×844 emulation; no physical-phone or production-host evidence exists yet.
- The new journey explains the first puzzle but does not add analytics or player research. The next adjustment should be driven by observed novice play rather than more instructional copy by default.
- Shelf remains optional and review-first; this phase does not change the Phase 3 relay contract or reward rules.

## Guardrails for the next chat

- Preserve the Tilt-first fresh-player path and the returning-player preference/history boundary.
- Keep Case 01 coaching compact and board-adjacent. Do not reintroduce an obstructive toast that covers the puzzle after briefing dismissal.
- Preserve `pointer-events: none` on the decorative `#stage::before` shadow so controls remain tappable.
- Keep the source hash update intentional and retain the canonical/compatibility mirror test whenever Counter Cat changes.

## Resume instruction

Resume from this file. First verify the no-Git workspace state, the three synchronized Counter Cat files, and the source-lock test before repeating claims. Next bounded action: observe or script a novice playthrough through Cases 01–03, then refine only the remaining comprehension break(s); keep Expert progressive and the Shelf handoff optional.
