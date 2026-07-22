# TeamMultiply Deployment Note - 2026-07-13

The animal puzzle shelf is a static site rooted at `C:\Users\bubs9\apps\games`.

## Local Preview

Run from `C:\Users\bubs9\apps\games`:

```powershell
py -m http.server 8765
```

Open:

```text
http://127.0.0.1:8765/index.html
```

## Phone / PWA Readiness

The shelf now includes:

- `site.webmanifest`
- `sw.js`
- `assets/icon.svg`
- mobile theme metadata on every page
- service worker registration on every page
- `All games` navigation from each game back to the shelf

When hosted over HTTPS, phones can install it from the browser:

- iPhone Safari: Share -> Add to Home Screen
- Android Chrome: menu -> Install app or Add to Home screen

## TeamMultiply URL Recommendation

Use TeamMultiply as the umbrella URL and keep the game shelf name animal-forward.

Best options:

1. `games.teammultiply...` -> points directly at this shelf.
2. `teammultiply.../animal-puzzles/` -> if TeamMultiply will host more products later.
3. `play.teammultiply...` -> good if this becomes a broader casual-games hub.

Preferred: `games.teammultiply...` if DNS/subdomains are available.

## Deployment Shape

This folder needs no build step. Upload the contents of `C:\Users\bubs9\apps\games` as the web root.

Required files to include:

- `index.html`
- `site.webmanifest`
- `sw.js`
- `assets/icon.svg`
- all five game folders

## Current Local Verification

- `http://127.0.0.1:8765/index.html` returned 200.
- `http://127.0.0.1:8765/site.webmanifest` returned 200.
- `http://127.0.0.1:8765/sw.js` returned 200.
- Counter Cat solver verification passed: 80 embedded levels.
