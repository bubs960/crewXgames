# CrewMultiply Play — Web Decisions and Release Gate

Date: 2026-07-19  
Status: implemented locally; not authorized for production publication

## Decisions

### Delivery surface

The intended public home is `play.crewmultiply.com`. This keeps the existing
`crewmultiply.com` property intact and gives the games their own
search, policy, and analytics boundary. This is a delivery target, not a DNS
or production deployment instruction. Do not publish or change DNS until the
domain owner confirms the subdomain, the legal operator, and the hosting
account.

### Identity and sign-in

**Do not use Clerk at launch.** CrewMultiply Play should be guest and
local-first:

- Games work without an account.
- Progress, settings, and Living Shelf state stay in browser storage on the
  current device.
- There is no profile, cloud save, payment entitlement, public leaderboard,
  chat, or user-generated content to protect with an identity system.

Adding Clerk now would add an account gate, an identity provider, a publishable
key, and new privacy/cookie/provider disclosures without a player-facing
benefit. Reconsider it only when a feature needs durable cross-device ownership:
cloud saves, an opt-in profile or leaderboard, account-based purchases, or a
player-created/social feature. At that point, use Clerk at the public auth
boundary, verify identities on the server for protected operations, and update
the privacy, cookie, retention, support, and deletion flows before enabling it.

## Public information architecture

The Vite site exposes and cross-links these public routes:

- `/` — product home and the flagship game handoff
- `/games/` and `/games/<slug>/` — all six games and their playable routes
- `/daily/` — daily puzzle handoff
- `/shelf/` and `/shelf/#cozy-crochet` — Living Shelf and Cozy Crochet
- `/about/` — product principles and the no-account posture
- `/privacy/`, `/terms/`, `/cookies/`, `/ads-and-rewards/`,
  `/accessibility/`, and `/contact/` — pre-launch legal and trust pages

The footer links every legal/trust page. Each direct legacy game route links
back to the product hub, where those pages remain one navigation step away.

## Legal launch gate

The linked legal pages accurately describe the current local build, but they
are intentionally not presented as finished public legal advice. Before any
public release, supply and review all of the following:

1. Legal entity name, physical address, country, jurisdiction, and governing
   law.
2. Monitored support, privacy, accessibility, security, advertising, and legal
   contact channels with named ownership and response targets.
3. Hosting provider, operational log/retention terms, and a complete inventory
   of analytics, advertising, consent, identity, storage, and payment providers.
4. A confirmed general-audience or other audience classification matching the
   actual marketing and providers.
5. Region-appropriate consent, opt-out, deletion, and data-request handling
   before any optional tracking or advertising technology loads.
6. Counsel review of the final privacy notice, terms, advertising policy, and
   accessibility/contact commitments.

Until those inputs exist, keep the site on the local/pre-release path, with no
advertising scripts, tracking tags, account system, payments, or public contact
promise enabled.

## Verification expectation

Before the release decision, verify a production build on phone and desktop,
all direct game handoffs, local-save recovery, keyboard and zoom behavior,
screen-reader status, and every footer/legal route. Treat a passing TypeScript
build as necessary but not sufficient evidence.
