import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { gameBySlug, games, legacyGameRoutes, requiredSiteRoutes } from "../src/site/gameCatalog";

describe("CrewMultiply Play Phase 1 catalog", () => {
  it("preserves the five legacy games while accepting the newer Shelf-backed game", () => {
    expect(games).toHaveLength(6);
    expect(new Set(games.map((game) => game.slug)).size).toBe(6);
    expect(new Set(legacyGameRoutes).size).toBe(5);
    for (const game of games.filter((candidate) => legacyGameRoutes.includes(candidate.playPath))) {
      expect(game.status).toBe("Available");
      expect(game.playPath.endsWith("/")).toBe(true);
      expect(existsSync(resolve(process.cwd(), game.playPath.slice(1), "index.html"))).toBe(true);
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
    expect(serviceWorker).toContain('const VERSION = "crewmultiply-play-phase1-2026-07-19-v1"');
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
});
