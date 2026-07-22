import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AdsterraDisplaySlot, AdsterraSocialBar } from "./AdsterraAds";
import { gameBySlug, games, type GameDefinition } from "./gameCatalog";
import {
  openPrivacyEvent,
  readPrivacyChoice,
  savePrivacyChoice,
  type PrivacyChoice
} from "./privacyPreferences";
import "./SiteApp.css";

type RouteKind = "home" | "games" | "detail" | "daily" | "about" | "privacy" | "terms" | "cookies" | "ads-and-rewards" | "accessibility" | "contact" | "not-found";

interface SiteRoute {
  kind: RouteKind;
  slug?: string;
}

interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPage {
  title: string;
  eyebrow: string;
  intro: string;
  sections: LegalSection[];
}

const legalPages: Record<"privacy" | "terms" | "cookies" | "ads-and-rewards" | "accessibility" | "contact", LegalPage> = {
  privacy: {
    title: "Privacy, in plain view.",
    eyebrow: "Privacy notice · working launch draft",
    intro: "This page describes what the current local-first build does today and the information that still must be finalized before any public launch.",
    sections: [
      {
        heading: "What this build stores",
        body: <p>Game progress, settings, completed patterns, and Living Shelf state can be saved in browser storage on the device you are using. Cozy Crochet Critters and the Shelf use IndexedDB for those local saves. Clearing browser site data can remove that progress.</p>
      },
      {
        heading: "What this build does not add",
        body: <p>This release does not ask players to create an account and does not load an analytics tag. There is no cloud-save, public profile, chat, payment flow, or leaderboard. Adsterra advertising is the only optional third-party integration in this starter release, and its scripts stay off unless you choose “Allow optional.”</p>
      },
      {
        heading: "Hosting and future services",
        body: <p>Cloudflare Pages is the intended host and may process ordinary delivery and security information such as requests, IP addresses, browser details, and security signals. Before public launch, CrewMultiply Play must finish the legal operator, retention, regional transfer, and verified contact details in this notice.</p>
      },
      {
        heading: "Advertising provider and data flow",
        body: <p>After “Allow optional,” eligible website pages can load Adsterra 300 × 250 or 728 × 90 display ads from highperformanceformat.com and an Adsterra Social Bar from effectivecpmnetwork.com. The provider, its advertising partners, and destination sites may receive an IP address, device and browser information, page/referrer details, identifiers, approximate location, and ad-view or click information, and may use cookies or similar storage. The exact advertiser domains and retention can vary by served campaign. No Adsterra script loads after “Necessary only.” Provider references: <a href="https://adsterra.com/privacy-policy-managed/" rel="noreferrer" target="_blank">Adsterra privacy policy</a>, <a href="https://adsterra.com/cookies/" rel="noreferrer" target="_blank">Adsterra cookies policy</a>, and <a href="https://adsterra.com/social-bar-ad/" rel="noreferrer" target="_blank">Social Bar format</a>.</p>
      },
      {
        heading: "Audience and choices",
        body: <p>CrewMultiply Play is being designed as a general-audience puzzle service for people 13 and older. It is not presented as a child-directed product. If the audience, data model, or advertising model changes, the product and this notice must be reviewed before collection begins.</p>
      }
    ]
  },
  terms: {
    title: "Terms built around fair play.",
    eyebrow: "Terms of use · working launch draft",
    intro: "These are the operating principles for the current local preview. They are not a substitute for the final operator details and counsel review needed before publication.",
    sections: [
      {
        heading: "Permission to play",
        body: <p>You may use the games for personal, non-commercial play. The games, artwork, names, and puzzle content remain the property of their respective owners. Do not copy, resell, automate, disrupt, or reverse-engineer the service beyond rights that cannot legally be limited.</p>
      },
      {
        heading: "Fair use of the service",
        body: <p>Do not use the site to probe for vulnerabilities, overload its infrastructure, bypass access controls, or misrepresent scores or game results. A game is allowed to be hard; it is not an invitation to be hostile to the people building it.</p>
      },
      {
        heading: "Advertising and third-party destinations",
        body: <p>The free service can contain clearly identified Adsterra display advertising and an Adsterra Social Bar on eligible content pages after optional advertising is allowed. Advertisements and their destination sites are controlled by third parties and may have separate terms and privacy practices. Never automate ad views or clicks. Our placement rules are described in <a href="/ads-and-rewards/">Ads &amp; Rewards</a>.</p>
      },
      {
        heading: "Availability",
        body: <p>Local saves, daily challenges, and experimental game features can change as the product evolves. Before public launch, this page must identify the governing law, legal entity, dispute process, contact address, and liability terms applicable to the chosen market.</p>
      }
    ]
  },
  cookies: {
    title: "Storage should earn its place.",
    eyebrow: "Cookies and local storage",
    intro: "The current build is intentionally small: it uses device-local storage for game state rather than an account system or optional tracking stack.",
    sections: [
      {
        heading: "Essential local storage",
        body: <p>Browser storage can retain game progress, settings, and durable Shelf state. That storage is needed for features such as exact undo/redo restoration and local progress after refresh. It is not a cross-device account.</p>
      },
      {
        heading: "Optional technologies",
        body: <p>Adsterra display and Social Bar scripts can load only after you select “Allow optional.” They are used to request, display, target, limit, and measure advertising. Selecting “Necessary only” keeps those requests off. If you withdraw a previous optional choice, the page reloads so injected third-party advertising is removed.</p>
      },
      {
        heading: "Provider inventory",
        body: <p>Necessary first-party record: <code>cm_privacy_choice_v1</code>, stored in localStorage until site data is cleared, records the choice and save time. Optional providers: highperformanceformat.com for 300 × 250 and 728 × 90 display units, and effectivecpmnetwork.com for Social Bar. Served ads can contact additional advertiser and measurement domains and can create provider-controlled cookies or identifiers with varying retention. Review Adsterra’s <a href="https://adsterra.com/cookies/" rel="noreferrer" target="_blank">cookies information</a> and <a href="https://adsterra.com/privacy-policy-managed/" rel="noreferrer" target="_blank">privacy policy</a>.</p>
      },
      {
        heading: "Your controls",
        body: <p>Open “Privacy choices” in any footer to allow or withdraw optional advertising. You can also clear browser cookies, cache, and site data; doing so may reset local game progress. The launch review still must confirm whether more granular consent, Global Privacy Control handling, or region-specific opt-outs are required.</p>
      }
    ]
  },
  "ads-and-rewards": {
    title: "Ads can fund play without becoming the game.",
    eyebrow: "Advertising and rewards standard",
    intro: "Adsterra display advertising and Social Bar are the approved starter formats. They load only after an optional privacy choice and stay outside active play.",
    sections: [
      {
        heading: "Starter provider and placement",
        body: <p>The approved Adsterra inventory is separated by surface for useful reporting. Home, Games, and Daily share a discovery batch; the six game-detail pages share a second batch. Each eligible page reserves one 728 × 90 unit on wider screens or one 300 × 250 unit on smaller screens, plus the matching optional Social Bar. No banner is mounted inside a game or the Living Shelf. See Adsterra’s <a href="https://adsterra.com/banner-ads/" rel="noreferrer" target="_blank">banner information</a> and <a href="https://adsterra.com/social-bar-ad/" rel="noreferrer" target="_blank">Social Bar information</a>.</p>
      },
      {
        heading: "What stays out",
        body: <p><strong>Popunders and clickunders are never allowed.</strong> Smartlinks, forced active-play interstitials, click disguises, and rewards required for campaign completion also stay out. The approved Social Bar may use floating in-page templates, so it is limited to eligible website content and excluded from active games, the Living Shelf, legal/support pages, offline pages, and error pages.</p>
      },
      {
        heading: "Choice and control",
        body: <p>Adsterra scripts remain absent until “Allow optional” is selected. “Necessary only” leaves every base game playable. Withdrawing optional advertising reloads the page to clear injected ad UI. Audience classification, category controls, real-device layout, provider behavior, and the final legal operator details still require launch review.</p>
      },
      {
        heading: "Reward integrity",
        body: <p>Game rewards come from player actions and versioned game events, not an advertising gate. If an optional rewarded format is ever considered, it must be clearly labelled, truly optional, and tested for failure and cancellation without taking away earned progress.</p>
      }
    ]
  },
  accessibility: {
    title: "More ways to read, move, and play.",
    eyebrow: "Accessibility statement · active work",
    intro: "The product target is WCAG 2.2 Level AA, backed by manual review—not a claim that every current prototype is finished.",
    sections: [
      {
        heading: "What is working now",
        body: <p>The Living Shelf and Cozy Crochet use labelled DOM controls alongside their visual stages. Cozy Crochet supports keyboard routing, visible yarn symbols and labels, reduced motion, high contrast, and live tension/legality text. The website uses semantic links, skip navigation, responsive layouts, and visible focus states.</p>
      },
      {
        heading: "How we test",
        body: <p>Automated checks are paired with keyboard-only navigation, 200% text sizing, narrow-width reflow, contrast measurements, reduced-motion review, and assistive-technology testing. Automated scores can find real problems, but they cannot establish ADA or WCAG conformance by themselves. CrewMultiply Play does not make a conformance claim while known barriers remain.</p>
      },
      {
        heading: "Known work before public launch",
        body: <p>Several legacy game boards remain pointer-first or need richer nonvisual board descriptions. Real-device and screen-reader validation remains required before any public accessibility claim is made. Each game page names its own current limitation rather than hiding it.</p>
      },
      {
        heading: "Feedback route",
        body: <p>A public launch must publish and monitor an accessibility contact method, along with a response process. This local build deliberately does not invent an unverified mailbox.</p>
      }
    ]
  },
  contact: {
    title: "Send the right case to the right desk.",
    eyebrow: "Contact and support readiness",
    intro: "There is no public support mailbox wired into this local build. That is intentional: a contact address is only useful when someone is actually accountable for it.",
    sections: [
      {
        heading: "Before public availability",
        body: <p>Publish a monitored support channel, privacy request channel, accessibility feedback channel, security-reporting channel, legal notice address, and advertising contact. Confirm their owners, response targets, and escalation path before linking them here.</p>
      },
      {
        heading: "Helpful issue details",
        body: <p>When support opens, include the game name, device and browser, approximate time, what happened, and a screenshot when safe to share. Do not send passwords, full payment details, or other sensitive information in a game report.</p>
      },
      {
        heading: "Security reports",
        body: <p>Do not publish a security mailbox until it is monitored. Until then, no security-response promise is made by this local preview.</p>
      }
    ]
  }
};

const legacyPaths = new Set(games.map((game) => game.playPath));

const readPath = () => {
  const pathname = window.location.pathname.replace(/\/+$/, "");
  return pathname || "/";
};

const parseRoute = (path: string): SiteRoute => {
  if (path === "/") return { kind: "home" };
  if (path === "/games") return { kind: "games" };
  if (path === "/daily") return { kind: "daily" };
  if (path === "/about") return { kind: "about" };
  if (path === "/privacy") return { kind: "privacy" };
  if (path === "/terms") return { kind: "terms" };
  if (path === "/cookies") return { kind: "cookies" };
  if (path === "/ads-and-rewards") return { kind: "ads-and-rewards" };
  if (path === "/accessibility") return { kind: "accessibility" };
  if (path === "/contact") return { kind: "contact" };
  const detail = /^\/games\/([^/]+)$/.exec(path);
  if (detail) return { kind: "detail", slug: detail[1] };
  return { kind: "not-found" };
};

const monetizedRouteKinds = new Set<RouteKind>(["home", "games", "detail", "daily"]);
const isMonetizedRoute = (route: SiteRoute) => monetizedRouteKinds.has(route.kind);
const adSurfaceForRoute = (route: SiteRoute): "content" | "game-detail" | null => {
  if (route.kind === "detail") return "game-detail";
  return route.kind === "home" || route.kind === "games" || route.kind === "daily" ? "content" : null;
};

const titleFor = (route: SiteRoute) => {
  if (route.kind === "home") return "CrewMultiply Play | Small moves. Big mischief.";
  if (route.kind === "detail") return (gameBySlug(route.slug ?? "")?.title ?? "Game") + " | CrewMultiply Play";
  if (route.kind in legalPages) return legalPages[route.kind as keyof typeof legalPages].title + " | CrewMultiply Play";
  const titles: Partial<Record<RouteKind, string>> = {
    games: "Games | CrewMultiply Play",
    daily: "Daily Puzzles | CrewMultiply Play",
    about: "About | CrewMultiply Play",
    "not-found": "Page not found | CrewMultiply Play"
  };
  return titles[route.kind] ?? "CrewMultiply Play";
};

const descriptionFor = (route: SiteRoute) => {
  if (route.kind === "home") return "A growing shelf of polished animal puzzle games led by Counter Cat.";
  if (route.kind === "detail") {
    const game = gameBySlug(route.slug ?? "");
    return game ? `${game.summary} Read the rules, controls, accessibility status, and play now.` : "Explore a CrewMultiply Play animal puzzle.";
  }
  if (route.kind in legalPages) return legalPages[route.kind as keyof typeof legalPages].intro;
  const descriptions: Partial<Record<RouteKind, string>> = {
    games: "Filter every available CrewMultiply Play puzzle by animal, mechanic, difficulty, and session length.",
    daily: "Open today’s date-seeded animal puzzle challenges without lives, paid continues, or an account.",
    about: "Why CrewMultiply Play builds fair, tactile, low-interruption animal puzzle games.",
    "not-found": "That page is not on the CrewMultiply Play shelf. Find a working game or today’s challenge."
  };
  return descriptions[route.kind] ?? "CrewMultiply Play animal puzzle games.";
};

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
};

const imageFor = (game: GameDefinition) => {
  const images: Record<GameDefinition["imageKey"], string> = {
    "counter-cat": "/assets/screens/counter-cat.png",
    meadow: "/assets/screens/meadow.png",
    bento: "/assets/screens/bento.png",
    tangle: "/assets/screens/tangle.png",
    parade: "/assets/pet-parade/park-photo-lineup-v1.webp",
    crochet: "/assets/crochet/kitten-wakes.png"
  };
  return images[game.imageKey];
};

const pathForGame = (game: GameDefinition) => "/games/" + game.slug + "/";

export const SiteApp = () => {
  const [path, setPath] = useState(readPath);
  const [menuOpen, setMenuOpen] = useState(false);
  const route = useMemo(() => parseRoute(path), [path]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sync = () => setPath(readPath());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    const title = titleFor(route);
    const description = descriptionFor(route);
    const canonicalPath = path === "/" ? "/" : `${path}/`;
    const canonicalUrl = `https://play.crewmultiply.com${canonicalPath}`;
    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: "https://play.crewmultiply.com/social-card-2026-07-19.png" });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    setMenuOpen(false);
  }, [path, route]);

  useEffect(() => {
    if (!menuOpen) return;
    navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navigate = (to: string) => {
    window.history.pushState(null, "", to);
    setPath(readPath());
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => document.getElementById("site-main")?.focus({ preventScroll: true }));
  };

  const onLink = (event: MouseEvent<HTMLAnchorElement>) => {
    const to = event.currentTarget.getAttribute("href");
    if (!to || !to.startsWith("/") || to.startsWith("/shelf/") || legacyPaths.has(to) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const targetPath = to.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
    if (isMonetizedRoute(route) !== isMonetizedRoute(parseRoute(targetPath))) return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <div className="play-site">
      <a className="tp-skip-link" href="#site-main">Skip to content</a>
      <header className="tp-header">
        <div className="tp-shell tp-nav-shell">
          <a className="tp-brand" href="/" onClick={onLink}>
            <span>Crew</span><span className="tp-brand-mark">×</span><span>Multiply</span><small>Play</small>
          </a>
          <button ref={menuButtonRef} className="tp-menu-button" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="tp-primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <span /><span /><span />
          </button>
          <nav ref={navRef} id="tp-primary-navigation" className="tp-nav" aria-label="Primary navigation" data-open={menuOpen}>
            <a href="/games/" onClick={onLink} aria-current={route.kind === "games" || route.kind === "detail" ? "page" : undefined}>Games</a>
            <a href="/daily/" onClick={onLink} aria-current={route.kind === "daily" ? "page" : undefined}>Daily</a>
            <a href="/about/" onClick={onLink} aria-current={route.kind === "about" ? "page" : undefined}>About</a>
            <a href="/shelf/">Shelf <small>Prototype</small></a>
            <a className="tp-nav-cta" href="/games/counter-cat/" onClick={onLink}>Start a puzzle</a>
          </nav>
        </div>
      </header>
      <main id="site-main" tabIndex={-1}>
        {route.kind === "home" && <HomePage onLink={onLink} />}
        {route.kind === "games" && <GamesPage onLink={onLink} />}
        {route.kind === "detail" && <GameDetailPage slug={route.slug ?? ""} onLink={onLink} />}
        {route.kind === "daily" && <DailyPage onLink={onLink} />}
        {route.kind === "about" && <AboutPage onLink={onLink} />}
        {route.kind in legalPages && <LegalPageView page={legalPages[route.kind as keyof typeof legalPages]} />}
        {route.kind === "not-found" && <NotFoundPage onLink={onLink} />}
      </main>
      <SiteFooter onLink={onLink} onOpenPrivacy={() => window.dispatchEvent(new Event(openPrivacyEvent))} />
      <PrivacyPreferences />
      <AdsterraSocialBar surface={adSurfaceForRoute(route)} />
    </div>
  );
};

const HomePage = ({ onLink }: { onLink: (event: MouseEvent<HTMLAnchorElement>) => void }) => {
  const featured = games[0];
  const shelfGame = games.find((game) => game.slug === "cozy-crochet-critters")!;
  return (
    <>
      <section className="tp-hero">
        <picture className="tp-hero-media" aria-hidden="true">
          <source srcSet="/assets/hero/crewmultiply-play-hero-v2.webp" type="image/webp" />
          <img className="tp-hero-background" src="/assets/hero/crewmultiply-play-hero-v2.png" alt="" width="1672" height="941" fetchPriority="high" />
        </picture>
        <div className="tp-hero-shade" aria-hidden="true" />
        <div className="tp-shell tp-hero-grid">
          <div className="tp-hero-copy">
            <p className="tp-hero-brand"><span aria-hidden="true">●</span> CrewMultiply Play <small>Animal puzzle shelf</small></p>
            <p className="tp-eyebrow">Flagship case · Counter Cat / Knock It Off!</p>
            <h1>Small moves.<br /><em>Big mischief.</em></h1>
            <p className="tp-lede">Bap one lane. Rearrange the evidence. Keep the yarn. Counter Cat turns a kitchen counter into a fair, difficult puzzle with a suspect who is not available for comment.</p>
            <div className="tp-actions">
              <a className="tp-button tp-button-coral" href={featured.playPath}>Play Counter Cat</a>
              <a className="tp-button tp-button-quiet" href="/games/" onClick={onLink}>Browse the shelf</a>
            </div>
            <ul className="tp-hero-facts" aria-label="CrewMultiply Play highlights">
              <li><strong>06</strong><span>Playable worlds<small>Every card opens a working build</small></span></li>
              <li><strong>Daily</strong><span>Shared challenges<small>Date-seeded boards, no paid edge</small></span></li>
              <li><strong>Local</strong><span>No account wall<small>Progress stays on this device</small></span></li>
            </ul>
          </div>
        </div>
        <aside className="tp-hero-case-card" aria-label="Featured Counter Cat case details">
          <span>Featured case</span>
          <strong>Counter Cat</strong>
          <p>Clear the human clutter. Preserve the protected yarn.</p>
          <div><small>5–15 min</small><small>Daily</small><small>Expert</small></div>
        </aside>
        <a className="tp-hero-next" href="#current-games">More trouble is already on the shelf <span aria-hidden="true">↓</span></a>
      </section>

      <section id="current-games" className="tp-section tp-section-paper">
        <div className="tp-shell">
          <div className="tp-section-heading">
            <div><p className="tp-eyebrow">On the shelf now</p><h2>Six games. Zero filler.</h2></div>
            <p>Each game has one understandable rule set, a distinct animal point of view, and enough room for a clever mistake.</p>
          </div>
          <div className="tp-feature-grid">
            {games.map((game) => <GameCard game={game} key={game.id} onLink={onLink} priority={game.id === featured.id} />)}
          </div>
          <div className="tp-inline-link"><a href="/games/" onClick={onLink}>See every game <span aria-hidden="true">→</span></a></div>
          <AdsterraDisplaySlot placement="content" />
        </div>
      </section>

      <section className="tp-section tp-home-daily">
        <div className="tp-shell">
          <div className="tp-section-heading tp-heading-light"><div><p className="tp-eyebrow">Today’s challenge</p><h2>Same puzzle. Different alibi.</h2></div><p>Every available game has a truthful date-seeded daily mode. Open a game, choose Daily, and solve without lives, a paid continue, or a required streak.</p></div>
          <div className="tp-home-daily-grid">{games.map((game) => <a href={game.playPath} key={game.id}><img src={imageFor(game)} alt="" loading="lazy" /><span><strong>{game.shortTitle}</strong><small>Daily available now · {game.session}</small></span><b aria-hidden="true">→</b></a>)}</div>
          <div className="tp-inline-link tp-inline-link-light"><a href="/daily/" onClick={onLink}>How daily play works <span aria-hidden="true">→</span></a></div>
        </div>
      </section>

      <section className="tp-section tp-shelf-callout">
        <div className="tp-shell tp-shelf-grid">
          <div className="tp-shelf-copy"><p className="tp-eyebrow">Now on the Living Shelf</p><h2>A craft table with consequences.</h2><p>{shelfGame.summary} Completed patterns can send versioned, provenance-backed events to a shared local Shelf—without turning a calm puzzle into a social feed.</p><a className="tp-button tp-button-gold" href={shelfGame.playPath}>Open Cozy Crochet</a></div>
          <div className="tp-shelf-art"><img src={imageFor(shelfGame)} alt={shelfGame.imageAlt} /><div className="tp-shelf-note">New · 24 campaign patterns · 6 expert remixes</div></div>
        </div>
      </section>

      <section className="tp-section tp-section-ink">
        <div className="tp-shell">
          <div className="tp-section-heading tp-heading-light"><div><p className="tp-eyebrow">The house rules</p><h2>Hard can still be fair.</h2></div><p>The challenge belongs in the puzzle—not in hidden timers, surprise lives, forced ads, or a maze of account gates.</p></div>
          <div className="tp-promise-grid">
            <article><strong>No account wall</strong><span>Play locally, then decide later if a cloud feature is worth signing into.</span></article>
            <article><strong>No forced ads</strong><span>Optional display and Social Bar ads stay outside active play; popunders are never allowed.</span></article>
            <article><strong>Same daily puzzle</strong><span>Daily modes are made for a shared solve, not a spending race.</span></article>
            <article><strong>Visible rules</strong><span>Color, movement, tension, and objective state remain readable while you play.</span></article>
          </div>
        </div>
      </section>
    </>
  );
};

const GamesPage = ({ onLink }: { onLink: (event: MouseEvent<HTMLAnchorElement>) => void }) => {
  const [animal, setAnimal] = useState("All");
  const [mechanic, setMechanic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [session, setSession] = useState("All");
  const options = (values: string[]) => ["All", ...Array.from(new Set(values))];
  const filteredGames = games.filter((game) =>
    (animal === "All" || game.animal === animal) &&
    (mechanic === "All" || game.mechanic === mechanic) &&
    (difficulty === "All" || game.difficulty === difficulty) &&
    (session === "All" || game.sessionBand === session)
  );
  const resetFilters = () => { setAnimal("All"); setMechanic("All"); setDifficulty("All"); setSession("All"); };

  return (
    <PageIntro eyebrow="The full shelf" title="Choose your next problem." copy="Six compact puzzle worlds, each with a real rule to learn and an animal who is entirely too certain about it.">
      <div className="tp-shell">
        <div className="tp-filter-bar" aria-label="Game filters">
          <div><strong>Filter the shelf</strong><span role="status">{filteredGames.length} of {games.length} games</span></div>
          <label>Animal<select value={animal} onChange={(event) => setAnimal(event.target.value)}>{options(games.map((game) => game.animal)).map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Mechanic<select value={mechanic} onChange={(event) => setMechanic(event.target.value)}>{options(games.map((game) => game.mechanic)).map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{options(games.map((game) => game.difficulty)).map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Session length<select value={session} onChange={(event) => setSession(event.target.value)}>{options(games.map((game) => game.sessionBand)).map((value) => <option key={value}>{value}</option>)}</select></label>
          <button type="button" onClick={resetFilters}>Reset</button>
        </div>
        {filteredGames.length ? <div className="tp-game-grid">{filteredGames.map((game) => <GameCard game={game} headingLevel={2} key={game.id} onLink={onLink} />)}</div> : <div className="tp-filter-empty"><h2>No game matches that combination.</h2><p>The animals deny coordinating their schedules.</p><button type="button" onClick={resetFilters}>Clear filters</button></div>}
        <AdsterraDisplaySlot placement="content" />
      </div>
    </PageIntro>
  );
};

const GameCard = ({ game, onLink, priority = false, headingLevel = 3 }: { game: GameDefinition; onLink: (event: MouseEvent<HTMLAnchorElement>) => void; priority?: boolean; headingLevel?: 2 | 3 }) => {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="tp-game-card" data-accent={game.accent}>
      <div className="tp-game-image"><img src={imageFor(game)} alt={game.imageAlt} loading={priority ? "eager" : "lazy"} /><div className="tp-card-tags"><span className="tp-status-available">{game.status}</span><span>{game.difficulty}</span>{game.daily && <span>Daily</span>}</div></div>
      <div className="tp-game-body"><p className="tp-card-eyebrow">{game.eyebrow}</p><Heading>{game.title}</Heading><p>{game.summary}</p><div className="tp-card-meta"><span>{game.mechanic}</span><span>{game.session}</span></div><div className="tp-card-actions"><a href={pathForGame(game)} onClick={onLink}>Details <span aria-hidden="true">→</span></a><a href={game.playPath}>Play</a></div></div>
    </article>
  );
};

const GameDetailPage = ({ slug, onLink }: { slug: string; onLink: (event: MouseEvent<HTMLAnchorElement>) => void }) => {
  const game = gameBySlug(slug);
  if (!game) return <NotFoundPage onLink={onLink} />;
  const related = gameBySlug(game.relatedSlug);
  return (
    <>
      <section className="tp-detail-hero" data-accent={game.accent}>
        <div className="tp-shell tp-detail-grid"><div><a className="tp-back-link" href="/games/" onClick={onLink}>← All games</a><p className="tp-eyebrow">{game.eyebrow}</p><h1>{game.title}</h1><p className="tp-lede">{game.summary}</p><div className="tp-detail-pills"><span>{game.difficulty}</span><span>{game.session}</span><span>{game.daily ? "Daily included" : "Open play"}</span></div>{game.firstPlay && <p className="tp-first-play"><strong>First visit</strong><span>{game.firstPlay}</span></p>}<a className="tp-button tp-button-coral" href={game.playPath}>{game.firstPlay ? "Start guided practice" : `Play ${game.shortTitle}`}</a></div><div className="tp-detail-image"><img src={imageFor(game)} alt={game.imageAlt} /></div></div>
      </section>
      <section className="tp-section tp-section-paper"><div className="tp-shell tp-detail-copy"><p className="tp-detail-personality">{game.personality}</p><div className="tp-detail-columns"><article><p className="tp-eyebrow">How it works</p><h2>Rules you can see.</h2><ol>{game.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol></article><article><p className="tp-eyebrow">Controls</p><h2>Made for a real screen.</h2><ul>{game.controls.map((control) => <li key={control}>{control}</li>)}</ul></article></div><aside className="tp-access-note"><strong>Accessibility status</strong><p>{game.accessibility}</p></aside>{related && <div className="tp-related"><span>Try next</span><a href={pathForGame(related)} onClick={onLink}>{related.title} <span aria-hidden="true">→</span></a></div>}<AdsterraDisplaySlot placement="game-detail" /></div></section>
    </>
  );
};

const DailyPage = ({ onLink }: { onLink: (event: MouseEvent<HTMLAnchorElement>) => void }) => (
  <PageIntro eyebrow="The daily board" title="Same puzzle. Different alibi." copy="A daily challenge is a clean shared question: no lives to buy, no account required, and no advantage for arriving with a wallet.">
    <div className="tp-shell"><div className="tp-daily-note"><strong>How daily play works</strong><p>Each participating game owns its own date-seeded challenge. Open the game you want, choose its Daily mode, and solve the same board other players receive that day.</p></div><div className="tp-daily-grid">{games.filter((game) => game.daily).map((game) => <article key={game.id} data-accent={game.accent}><span className="tp-daily-dot" aria-hidden="true" /><p>{game.eyebrow}</p><h2>{game.title}</h2><span>{game.mechanic} · {game.session}</span><div><a href={pathForGame(game)} onClick={onLink}>Read the rules</a><a href={game.playPath}>Open game</a></div></article>)}</div><AdsterraDisplaySlot placement="content" /></div>
  </PageIntro>
);

const AboutPage = ({ onLink }: { onLink: (event: MouseEvent<HTMLAnchorElement>) => void }) => (
  <PageIntro eyebrow="A small studio standard" title="Puzzle games should respect the person solving them." copy="CrewMultiply Play is a growing shelf of animal puzzle games with a bias for readable systems, short dry humor, and physical feedback that helps you understand what happened.">
    <div className="tp-shell tp-about-grid"><article><p className="tp-eyebrow">The principles</p><h2>Rules first. Joke second.</h2><p>Every puzzle should make its important information visible, let a player recover from a mistake, and keep the satisfaction attached to a decision—not a random gate.</p></article><article><p className="tp-eyebrow">Why animals</p><h2>They have motives.</h2><p>Animals give each world a point of view. The cat is a household authority, the meadow has opinions about loose paths, and the crochet kitten knows a clean stitch when it sees one.</p></article><article className="tp-auth-card"><p className="tp-eyebrow">Account decision</p><h2>No sign-in at launch.</h2><p>Progress is stored locally because there is no player benefit yet in making an account. We will reconsider only when a player-facing feature needs cross-device ownership—such as cloud saves, a profile, or an opt-in leaderboard.</p><a href="/privacy/" onClick={onLink}>Read the privacy posture <span aria-hidden="true">→</span></a></article></div>
  </PageIntro>
);

const LegalPageView = ({ page }: { page: LegalPage }) => (
  <PageIntro eyebrow={page.eyebrow} title={page.title} copy={page.intro}>
    <div className="tp-shell tp-legal-layout"><aside className="tp-legal-callout"><strong>Pre-launch legal checkpoint</strong><p>Before public release, add the legal entity, physical address, jurisdiction, verified contact channels, live provider inventory, and counsel review. Do not publish a placeholder as a finished policy.</p></aside><div className="tp-prose">{page.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.body}</section>)}</div></div>
  </PageIntro>
);

const PrivacyPreferences = () => {
  const [choice, setChoice] = useState<PrivacyChoice | null>(() => readPrivacyChoice());
  const [open, setOpen] = useState(() => readPrivacyChoice() === null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const focusOnOpenRef = useRef(false);

  useEffect(() => {
    const show = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusOnOpenRef.current = true;
      setOpen(true);
    };
    const syncAcrossTabs = () => {
      const next = readPrivacyChoice();
      if (choice === "optional" && next !== "optional") {
        window.location.reload();
        return;
      }
      setChoice(next);
      if (next === null) setOpen(true);
    };
    window.addEventListener(openPrivacyEvent, show);
    window.addEventListener("tm-open-privacy", show);
    window.addEventListener("storage", syncAcrossTabs);
    return () => {
      window.removeEventListener(openPrivacyEvent, show);
      window.removeEventListener("tm-open-privacy", show);
      window.removeEventListener("storage", syncAcrossTabs);
    };
  }, [choice]);

  useEffect(() => {
    if (open && focusOnOpenRef.current) {
      firstButtonRef.current?.focus();
      focusOnOpenRef.current = false;
    }
  }, [open]);

  const save = (next: PrivacyChoice) => {
    const withdrawingOptional = choice === "optional" && next === "necessary";
    savePrivacyChoice(next);
    setChoice(next);
    setOpen(false);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    if (withdrawingOptional) window.setTimeout(() => window.location.reload(), 0);
  };

  if (!open) return <span className="tp-privacy-state" aria-live="polite">Privacy preference: {choice === "optional" ? "optional allowed" : "necessary only"}</span>;
  return (
    <aside className="tp-privacy-panel" role="dialog" aria-modal="false" aria-labelledby="tp-privacy-title">
      <p className="tp-eyebrow">Privacy choices</p>
      <h2 id="tp-privacy-title">Your game, your choice.</h2>
      <p>Necessary storage keeps local progress, settings, and this preference working. “Allow optional” enables Adsterra display ads and Social Bar on eligible website pages. Active games remain playable either way, and popunders are never used.</p>
      <div><button ref={firstButtonRef} type="button" onClick={() => save("necessary")}>Necessary only</button><button type="button" onClick={() => save("optional")}>Allow optional</button><a href="/cookies/">Read details</a></div>
    </aside>
  );
};

const NotFoundPage = ({ onLink }: { onLink: (event: MouseEvent<HTMLAnchorElement>) => void }) => (
  <section className="tp-not-found"><div className="tp-shell"><p className="tp-eyebrow">Lost object report</p><h1>This puzzle piece is not on the shelf.</h1><p>The page may have moved, or the cat may be sitting on it.</p><a className="tp-button tp-button-coral" href="/games/" onClick={onLink}>Browse games</a></div></section>
);

const PageIntro = ({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: ReactNode }) => <><section className="tp-page-intro"><div className="tp-shell"><p className="tp-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div></section>{children}</>;

const SiteFooter = ({ onLink, onOpenPrivacy }: { onLink: (event: MouseEvent<HTMLAnchorElement>) => void; onOpenPrivacy: () => void }) => (
  <footer className="tp-footer"><div className="tp-shell tp-footer-grid"><div><a className="tp-brand tp-brand-footer" href="/" onClick={onLink}><span>Crew</span><span className="tp-brand-mark">×</span><span>Multiply</span><small>Play</small></a><p>Small moves, big mischief, and a growing shelf of animal puzzles.</p><span className="tp-footer-status">Adsterra · Optional only · No popunders</span></div><div><h2>Play</h2><a href="/games/" onClick={onLink}>All games</a><a href="/daily/" onClick={onLink}>Daily puzzles</a><a href="/shelf/">Living Shelf</a></div><div><h2>Studio</h2><a href="/about/" onClick={onLink}>About</a><a href="/accessibility/" onClick={onLink}>Accessibility</a><a href="/contact/" onClick={onLink}>Contact readiness</a></div><div><h2>Legal</h2><a href="/privacy/" onClick={onLink}>Privacy</a><a href="/terms/" onClick={onLink}>Terms</a><a href="/cookies/" onClick={onLink}>Cookies & storage</a><a href="/ads-and-rewards/" onClick={onLink}>Ads & rewards</a><button className="tp-footer-privacy" type="button" onClick={onOpenPrivacy}>Privacy choices</button></div></div><div className="tp-shell tp-footer-bottom">© {new Date().getFullYear()} CrewMultiply Play · Pre-launch build · Legal review required before public release</div></footer>
);
