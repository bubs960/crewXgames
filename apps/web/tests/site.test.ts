import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { gameBySlug, games, legacyGameRoutes, requiredSiteRoutes } from "../src/site/gameCatalog";

const contrastRatio = (foreground: string, background: string) => {
  const luminance = (hex: string) => {
    const channels = hex.match(/[a-f\d]{2}/gi)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? [];
    const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

describe("CrewMultiply Play Phase 1 catalog", () => {
  it("preserves the five legacy games while accepting the newer Shelf-backed game", () => {
    expect(games).toHaveLength(6);
    expect(new Set(games.map((game) => game.slug)).size).toBe(6);
    expect(new Set(legacyGameRoutes).size).toBe(5);
    for (const game of games.filter((candidate) => legacyGameRoutes.includes(candidate.playPath))) {
      expect(game.status).toBe("Available");
      expect(game.playPath.endsWith("/")).toBe(true);
      const canonicalPath = resolve(process.cwd(), game.playPath.slice(1), "index.html");
      const publicPath = resolve(process.cwd(), "apps/web/public", game.playPath.slice(1), "index.html");
      expect(existsSync(canonicalPath)).toBe(true);
      expect(readFileSync(publicPath, "utf8")).toBe(readFileSync(canonicalPath, "utf8"));
    }
    expect(gameBySlug("cozy-crochet-critters")?.playPath).toBe("/shelf/#cozy-crochet");
    expect(gameBySlug("pet-parade-sort")?.playPath).toBe("/shelf/#pet-parade-sort");
    const legacyPetLauncher = readFileSync(resolve(process.cwd(), "pet-parade-sort/index.html"), "utf8");
    expect(legacyPetLauncher).toContain('/shelf/#pet-parade-sort');
    expect(legacyPetLauncher).not.toContain('const levels = [');
  });

  it("publishes honest detail metadata for filters, controls, daily status, and accessibility", () => {
    for (const game of games) {
      expect(game.animal.length).toBeGreaterThan(0);
      expect(game.mechanic.length).toBeGreaterThan(0);
      expect(game.session.length).toBeGreaterThan(0);
      expect(game.rules.length).toBeGreaterThanOrEqual(4);
      expect(game.controls.length).toBeGreaterThanOrEqual(3);
      expect(game.accessibility.length).toBeGreaterThan(80);
      expect(game.daily).toBe(true);
      expect(gameBySlug(game.relatedSlug)).toBeDefined();
    }
  });

  it("includes every required Phase 1 site route and the functional Shelf mount", () => {
    const uniqueRoutes = new Set(requiredSiteRoutes);
    expect(uniqueRoutes.size).toBe(requiredSiteRoutes.length);
    expect(requiredSiteRoutes).toContain("/");
    expect(requiredSiteRoutes).toContain("/games/counter-cat/");
    expect(requiredSiteRoutes).toContain("/games/pet-parade-sort/");
    expect(requiredSiteRoutes).toContain("/games/cozy-crochet-critters/");
    expect(requiredSiteRoutes).toContain("/ads-and-rewards/");
    expect(requiredSiteRoutes).toContain("/shelf/");
  });

  it("keeps Counter Cat's first-case coaching and compatibility source synchronized", () => {
    const canonical = readFileSync(resolve(process.cwd(), "waddle-home/index.html"), "utf8");
    const compatibility = readFileSync(resolve(process.cwd(), "apps/web/public/waddle-home/index.html"), "utf8");

    expect(compatibility).toBe(canonical);
    expect(canonical).toContain('id="starterGuide"');
    expect(canonical).toContain("Start Case 01");
    expect(canonical).toContain("Case 01 uses Tilt");
  });

  it("publishes CrewMultiply branding and the planned CrewMultiply canonical domain", () => {
    const index = readFileSync(resolve(process.cwd(), "apps/web/index.html"), "utf8");
    const manifest = readFileSync(resolve(process.cwd(), "apps/web/public/site.webmanifest"), "utf8");
    const serviceWorker = readFileSync(resolve(process.cwd(), "apps/web/public/sw.js"), "utf8");

    expect(index).toContain("CrewMultiply Play");
    expect(index).toContain("https://play.crewmultiply.com/");
    expect(manifest).toContain('"name": "CrewMultiply Play"');
    expect(manifest).toContain('"short_name": "CM Play"');
    expect(serviceWorker).toContain('const VERSION = "crewmultiply-play-phase1-2026-07-22-v3"');
    expect(`${index}\n${manifest}\n${serviceWorker}`).not.toContain("TeamMultiply");
  });

  it("ships the detailed high-resolution homepage hero without preloading it on every game route", () => {
    const index = readFileSync(resolve(process.cwd(), "apps/web/index.html"), "utf8");
    const source = readFileSync(resolve(process.cwd(), "apps/web/src/site/SiteApp.tsx"), "utf8");
    const heroPng = resolve(process.cwd(), "apps/web/public/assets/hero/crewmultiply-play-hero-v2.png");
    const heroWebp = resolve(process.cwd(), "apps/web/public/assets/hero/crewmultiply-play-hero-v2.webp");

    expect(index).not.toContain('href="/assets/hero/crewmultiply-play-hero-v2.webp"');
    expect(source).toContain('<source srcSet="/assets/hero/crewmultiply-play-hero-v2.webp" type="image/webp" />');
    expect(source).toContain('width="1672" height="941" fetchPriority="high"');
    expect(existsSync(heroPng)).toBe(true);
    expect(existsSync(heroWebp)).toBe(true);
    expect(statSync(heroPng).size).toBeGreaterThan(1_000_000);
    expect(statSync(heroWebp).size).toBeLessThan(statSync(heroPng).size);
  });

  it("animates the hero background without bypassing reduced-motion preferences", () => {
    const styles = readFileSync(resolve(process.cwd(), "apps/web/src/site/SiteApp.css"), "utf8");

    expect(styles).toContain("@keyframes tp-hero-camera-drift");
    expect(styles).toContain("@keyframes tp-hero-atmosphere-drift");
    expect(styles).toContain("@media (prefers-reduced-motion: no-preference)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("animation: none !important");
  });

  it("keeps the site shell on its WCAG 2.2 AA accessibility baseline", () => {
    const source = readFileSync(resolve(process.cwd(), "apps/web/src/site/SiteApp.tsx"), "utf8");
    const styles = readFileSync(resolve(process.cwd(), "apps/web/src/site/SiteApp.css"), "utf8");
    const counterCat = readFileSync(resolve(process.cwd(), "waddle-home/index.html"), "utf8");
    const meadow = readFileSync(resolve(process.cwd(), "mosaic-meadow/index.html"), "utf8");
    const bento = readFileSync(resolve(process.cwd(), "pup-purr-bento/index.html"), "utf8");
    const parade = readFileSync(resolve(process.cwd(), "apps/web/src/PetParadeGame.tsx"), "utf8");
    const crochetStage = readFileSync(resolve(process.cwd(), "apps/web/src/CrochetStage.tsx"), "utf8");

    expect(contrastRatio("#ffffff", "#bd452d")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#bd452d", "#f7f4ee")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#72d8d2", "#2d2924")).toBeGreaterThanOrEqual(4.5);
    expect(styles).toContain(".play-site :focus-visible { outline: 3px solid #fff;");
    expect(styles).toContain("box-shadow: 0 0 0 6px var(--tp-ink) !important;");
    expect(styles).toContain(".tp-nav > a { display: inline-flex; min-height: 2.75rem;");
    expect(source).toContain('<a className="tp-skip-link" href="#site-main">Skip to content</a>');
    expect(source).toContain('<main id="site-main" tabIndex={-1}>');
    expect(source).toContain("headingLevel={2}");
    expect(source).toContain("CrewMultiply Play does not make a conformance claim while known barriers remain.");
    expect(source).toContain("if (open && focusOnOpenRef.current)");
    expect(counterCat).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    expect(counterCat).not.toContain("user-scalable=no");
    expect(counterCat).toContain("<main>");
    expect(meadow).toContain("--accent-text: #ffffff;");
    expect(meadow).toContain("<main>");
    expect(bento).toContain('div.setAttribute("aria-label", `Empty tray cell at row ${r + 1}, column ${c + 1}`);');
    expect(parade).toContain('role="progressbar" aria-label="Guided practice progress"');
    expect(parade).toContain('<h2 id="parade-coach-title">');
    expect(crochetStage).toContain('aria-label={node.symbol + ", " + node.label');
  });

  it("ships only the approved consent-gated Adsterra starter batch", () => {
    const ads = readFileSync(resolve(process.cwd(), "apps/web/src/site/AdsterraAds.tsx"), "utf8");
    const site = readFileSync(resolve(process.cwd(), "apps/web/src/site/SiteApp.tsx"), "utf8");
    const privacy = readFileSync(resolve(process.cwd(), "apps/web/src/site/privacyPreferences.ts"), "utf8");

    expect(ads).toContain('key: "6fdbf640fe1300e9f3f4f31c3eb48dd2"');
    expect(ads).toContain('key: "841bc3e48da39de5799b6955712cee8b"');
    expect(ads).toContain("https://pl30490413.effectivecpmnetwork.com/1f/03/55/1f03554e30d399a741a4d96f44ade128.js");
    expect(ads).toContain('if (!enabled || choice !== "optional") return;');
    expect(ads).toContain('if (!frame || choice !== "optional")');
    expect(ads.toLowerCase()).not.toContain("popunder");
    expect(site).toContain('const monetizedRouteKinds = new Set<RouteKind>(["home", "games", "detail", "daily"])');
    expect(site).toContain('<AdsterraDisplaySlot placement="game-detail" />');
    expect(site).toContain('<AdsterraSocialBar enabled={isMonetizedRoute(route)} />');
    expect(site).toContain("Popunders and clickunders are never allowed.");
    expect(privacy).toContain('export const privacyPreferenceKey = "cm_privacy_choice_v1"');
  });

  it("includes Cloudflare headers for the approved providers and preserves Pages SPA routing", () => {
    const headers = readFileSync(resolve(process.cwd(), "apps/web/public/_headers"), "utf8");
    const redirects = readFileSync(resolve(process.cwd(), "apps/web/public/_redirects"), "utf8");
    const viteConfig = readFileSync(resolve(process.cwd(), "apps/web/vite.config.ts"), "utf8");

    expect(headers).toContain("Content-Security-Policy:");
    expect(headers).toContain("script-src 'self' 'unsafe-inline' https:");
    expect(headers).toContain("upgrade-insecure-requests");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(redirects.trim()).toBe("/* /index.html 200");
    expect(viteConfig).not.toContain('resolve(outputRoot, "404.html")');
  });
});
