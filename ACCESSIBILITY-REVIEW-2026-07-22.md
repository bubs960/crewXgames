# CrewMultiply Play accessibility review — July 22, 2026

## Outcome

CrewMultiply Play uses WCAG 2.2 Level AA as its product target. After the fixes in this review, Lighthouse reports an accessibility score of 100 for every audited website and playable-game state listed below. This is useful regression evidence, not an ADA or WCAG conformance certification.

Automated testing cannot find every barrier. A public conformance claim still requires real assistive-technology testing, real-device testing, a monitored accessibility-feedback route, and legal review appropriate to the business and jurisdictions served.

## Automated route coverage

| Surface | Audit state | Accessibility score |
| --- | --- | ---: |
| Homepage | Desktop navigation | 100 |
| Homepage | Mobile navigation | 100 |
| Games index | Desktop navigation | 100 |
| Counter Cat detail | Desktop navigation | 100 |
| Accessibility statement | Desktop navigation | 100 |
| Living Shelf | Mobile navigation | 100 |
| Counter Cat playable game | Mobile navigation | 100 |
| Mosaic Meadow playable game | Mobile navigation | 100 |
| Pup & Purr Bento playable game | Mobile navigation | 100 |
| Paws & Yarn Tangle playable game | Mobile navigation | 100 |
| Pet Parade Sort guided practice | Mobile snapshot | 100 |
| Cozy Crochet guided practice | Mobile snapshot | 100 |

The reports were generated from the local production build. Agentic-browsing and legacy-game SEO scores are separate audit categories and are not included in the accessibility result.

## Manual and source checks completed

- Keyboard: the skip link is the first tab stop and moves focus to the main content.
- Keyboard: the mobile navigation opens with Enter, focuses its first link, closes with Escape, and returns focus to the menu button.
- Keyboard: opening privacy choices from the footer moves focus to the first choice and returns focus to the opener after a selection. The first-visit panel no longer steals focus on page load.
- Focus appearance: interactive controls use a two-tone light/dark focus ring that remains visible across the site palette.
- Reflow: the website shell and playable routes were checked at a 320 CSS-pixel viewport without user-scrollable page-level horizontal overflow. Purpose-built two-dimensional boards keep any required overflow inside their board container.
- Text resize: homepage, games index, and accessibility statement were checked at 200% root text size without page-level horizontal overflow or undersized visible controls.
- Target size: primary navigation, filters, game-card actions, daily actions, menu controls, privacy controls, and footer actions meet or exceed the 24 by 24 CSS-pixel WCAG 2.2 target baseline or provide sufficient spacing.
- Motion: decorative homepage motion only runs under `prefers-reduced-motion: no-preference`; the reduce rule removes animation and hover transforms.
- Content structure: landmarks, page titles, headings, button names, image alternatives, status regions, and route focus management were inspected in the accessibility tree.

## Defects corrected in this review

- Raised coral, teal, and muted-text contrast to meet the 4.5:1 normal-text baseline where applicable.
- Replaced a skipped game-index heading level and removed a mismatched brand-link accessible name.
- Restored browser zoom on Counter Cat by removing `maximum-scale` and `user-scalable=no`.
- Added missing main landmarks to Counter Cat and Mosaic Meadow.
- Added row, column, and contents names to every Pup & Purr Bento tray-cell button.
- Added proper progressbar semantics and corrected a guided-practice heading level in Pet Parade Sort.
- Included visible stitch symbols in Cozy Crochet target names and removed low-opacity completed-state text.
- Preserved Counter Cat's source-lock provenance by updating its checked SHA-256 only after the canonical and public copies were verified identical.

## Known limits before a public conformance claim

- Several legacy visual boards still need richer whole-board descriptions and a structured screen-reader usability pass. Their public game-detail pages disclose those limits.
- NVDA with Firefox/Chrome, VoiceOver with Safari, switch control, voice control, and high-contrast operating-system modes have not yet been exercised by a human tester in this review.
- Real iOS and Android browser testing remains required; desktop emulation is not a substitute for device behavior.
- Adsterra campaign creatives are third-party and can vary after launch. They remain optional, outside active game boards, and require ongoing creative/category monitoring and a way to report inaccessible ads.
- A verified, monitored accessibility contact and response process must be published before launch. The site intentionally does not invent an unattended mailbox.
- Counsel should review the final public accessibility statement, legal operator details, and jurisdiction-specific obligations. No source file or automated report can eliminate legal risk by itself.

## Recommended release gate

Before removing the pre-launch label, complete one keyboard plus screen-reader pass per game family, test representative iPhone and Android devices at enlarged text settings, verify the optional ad experience with real served creatives, publish the monitored accessibility contact, and log any remaining exception with an owner and target date.
