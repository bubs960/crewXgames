#!/usr/bin/env node
/* ============================================================
   KNOCK IT OFF! / WADDLE HOME — generator benchmark + level baker.
   Extracts the CORE block from ../index.html and evals it, so
   this harness drives the SAME simulator the game ships with.

   Usage:
     node bench.mjs bench          # duck tiers: accept-rate + BFS time
     node bench.mjs bake           # duck: emit levels.generated.json
     node bench.mjs compare        # DEPTH TEST: duck vs cat-open vs cat-gaps
     node bench.mjs bake-cat       # cat tilt: emit cat-levels.generated.json
     node bench.mjs bench-expert   # cat expert/lane tiers: accept-rate + BFS time
     node bench.mjs bake-expert    # cat expert/lane: emit cat-levels.expert.generated.json
     node bench.mjs verify         # regression: re-solve baked duck+cat JSONs
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "index.html"), "utf8");
const m = html.match(/\/\* CORE-START \*\/([\s\S]*?)\/\* CORE-END \*\//);
if (!m) { console.error("CORE block not found in index.html"); process.exit(1); }
const CORE = new Function(m[1] + "; return WADDLE_CORE;")();
const { genLayout, solveBFS, solveLaneBFS } = CORE;

/* Duck ladder (original, unchanged — regression reference) */
const DUCK_TIERS = [
  { name: "T1 6x6", n: 6, ducks: 2, acorns: 2, rocks: 5, minPar: 4,  maxPar: 8,  count: 8 },
  { name: "T2 7x7", n: 7, ducks: 3, acorns: 3, rocks: 7, minPar: 5,  maxPar: 10, count: 6 },
  { name: "T3 8x8", n: 8, ducks: 4, acorns: 4, rocks: 9, minPar: 6,  maxPar: 14, count: 6 },
];

/* Cat ladder — gap counts per the mechanics-critic redesign:
   narrow gaps (not open sides) so exiting needs lane alignment. */
const CAT_TIERS = [
  { name: "C1 6x6", mode: "cat", n: 6, targets: 2, forbidden: 2, neutrals: 0, rocks: 5,  gaps: 3, minPar: 3, maxPar: 8,  count: 12 },
  { name: "C2 7x7", mode: "cat", n: 7, targets: 3, forbidden: 2, neutrals: 1, rocks: 7,  gaps: 4, minPar: 5, maxPar: 10, count: 14 },
  { name: "C3 8x8", mode: "cat", n: 8, targets: 4, forbidden: 3, neutrals: 1, rocks: 9,  gaps: 5, minPar: 6, maxPar: 13, count: 16 },
  { name: "C4 8x8 endgame", mode: "cat", n: 8, targets: 5, forbidden: 3, neutrals: 2, rocks: 10, gaps: 4, minPar: 9, maxPar: 16, count: 18 },
];

const CAT_EXPERT_TIERS = [
  { name: "E1 6x6 lane", mode: "cat", n: 6, targets: 2, forbidden: 2, neutrals: 0, rocks: 6,  gaps: 3, minPar: 5,  maxPar: 10, count: 12, solver: "lane" },
  { name: "E2 7x7 lane", mode: "cat", n: 7, targets: 3, forbidden: 2, neutrals: 1, rocks: 8,  gaps: 4, minPar: 8,  maxPar: 14, count: 14, solver: "lane" },
  { name: "E3 8x8 lane", mode: "cat", n: 8, targets: 4, forbidden: 3, neutrals: 1, rocks: 10, gaps: 5, minPar: 10, maxPar: 17, count: 16, solver: "lane" },
  { name: "E4 8x8 lane endgame", mode: "cat", n: 8, targets: 5, forbidden: 3, neutrals: 2, rocks: 12, gaps: 4, minPar: 13, maxPar: 22, count: 18, solver: "lane" },
];

const MAX_DEPTH = 16;
const MAX_STATES = 300000;
const LANE_MAX_DEPTH = 22;
const LANE_MAX_STATES = 120000;

function trySeed(cfg, seed) {
  const { board, pieces } = genLayout(seed, cfg);
  const t0 = process.hrtime.bigint();
  const solver = cfg.solver === "lane" ? solveLaneBFS : solveBFS;
  const res = solver(board, pieces, cfg.solver === "lane" ? LANE_MAX_DEPTH : MAX_DEPTH, cfg.solver === "lane" ? LANE_MAX_STATES : MAX_STATES);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { ...res, ms };
}

function statsRun(cfg, N, seedSalt) {
  let solvable = 0, accepted = 0, overflow = 0, totalMs = 0, maxMs = 0, totalStates = 0;
  const parDist = {};
  const pars = [];
  for (let s = 1; s <= N; s++) {
    const seed = ((s * 0x9e3779b1) ^ seedSalt) >>> 0;
    const r = trySeed(cfg, seed);
    totalMs += r.ms;
    if (r.ms > maxMs) maxMs = r.ms;
    totalStates += r.states || 0;
    if (r.overflow) overflow++;
    if (r.optimal > 0) {
      solvable++;
      pars.push(r.optimal);
      parDist[r.optimal] = (parDist[r.optimal] || 0) + 1;
      if (cfg.minPar && r.optimal >= cfg.minPar && r.optimal <= cfg.maxPar) accepted++;
    }
  }
  pars.sort((a, b) => a - b);
  const median = pars.length ? pars[Math.floor(pars.length / 2)] : -1;
  return { solvable, accepted, overflow, avgMs: totalMs / N, maxMs, avgStates: totalStates / N, parDist, median, N };
}

function printStats(label, st) {
  console.log(`${label}`);
  console.log(`  solvable ${(100 * st.solvable / st.N).toFixed(1)}%  median par ${st.median}  overflow ${st.overflow}`);
  console.log(`  BFS avg ${st.avgMs.toFixed(1)}ms  max ${st.maxMs.toFixed(1)}ms  avg states ${Math.round(st.avgStates)}`);
  console.log(`  par distribution: ` + Object.entries(st.parDist).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(" "));
}

function bench() {
  for (const tier of DUCK_TIERS) {
    const st = statsRun(tier, 300, 0xD00C0000);
    printStats(`\n${tier.name}  (300 seeds)`, st);
    console.log(`  accepted[${tier.minPar}-${tier.maxPar}] ${(100 * st.accepted / st.N).toFixed(1)}%`);
  }
}

function benchExpert() {
  for (const tier of CAT_EXPERT_TIERS) {
    const st = statsRun(tier, 24, 0xE7700000);
    printStats(`\n${tier.name}  (24 seeds)`, st);
    console.log(`  accepted[${tier.minPar}-${tier.maxPar}] ${(100 * st.accepted / st.N).toFixed(1)}%`);
  }
}

/* THE DEPTH TEST (mechanics critic's cheapest test): matched piece
   counts + rock density, three rulesets. If cat-open pars collapse
   vs duck while cat-gaps holds, narrow gaps are the design.       */
function compare() {
  const N = 300;
  const PAIRS = [
    {
      label: "6x6, 2 goal + 2 other movers, 5 rocks",
      duck:    { n: 6, ducks: 2, acorns: 2, rocks: 5 },
      catOpen: { mode: "cat", n: 6, targets: 2, forbidden: 2, neutrals: 0, rocks: 5, gaps: "all" },
      catGaps: { mode: "cat", n: 6, targets: 2, forbidden: 2, neutrals: 0, rocks: 5, gaps: 3 },
    },
    {
      label: "7x7, 3 goal + 3 other movers, 7 rocks",
      duck:    { n: 7, ducks: 3, acorns: 3, rocks: 7 },
      catOpen: { mode: "cat", n: 7, targets: 3, forbidden: 2, neutrals: 1, rocks: 7, gaps: "all" },
      catGaps: { mode: "cat", n: 7, targets: 3, forbidden: 2, neutrals: 1, rocks: 7, gaps: 4 },
    },
    {
      label: "8x8, 4 goal + 4 other movers, 9 rocks",
      duck:    { n: 8, ducks: 4, acorns: 4, rocks: 9 },
      catOpen: { mode: "cat", n: 8, targets: 4, forbidden: 3, neutrals: 1, rocks: 9, gaps: "all" },
      catGaps: { mode: "cat", n: 8, targets: 4, forbidden: 3, neutrals: 1, rocks: 9, gaps: 5 },
    },
  ];
  for (const pair of PAIRS) {
    console.log(`\n=== ${pair.label} (${N} seeds each) ===`);
    printStats("DUCK (settle on nests):", statsRun(pair.duck, N, 0xD00C0000));
    printStats("CAT open sides (naive):", statsRun(pair.catOpen, N, 0xCA7B0A2D));
    printStats("CAT narrow gaps:", statsRun(pair.catGaps, N, 0xCA7B0A2D));
  }
}

function bakeTiers(tiers, salt, outfile) {
  const out = [];
  for (const tier of tiers) {
    const found = [];
    for (let s = 1; found.length < tier.count * 4 && s < 6000; s++) {
      const seed = ((s * 0x9e3779b1) ^ salt) >>> 0;
      const r = trySeed(tier, seed);
      if (r.optimal >= tier.minPar && r.optimal <= tier.maxPar && !r.overflow) {
        const { name, minPar, maxPar, count, solver, ...cfg } = tier;
        found.push({ ...cfg, seed, par: r.optimal });
      }
    }
    if (found.length < tier.count) {
      console.error(`${tier.name}: only found ${found.length}/${tier.count} boards — widen the band or scan more seeds`);
      process.exit(1);
    }
    /* ramp: sort by par, take an even spread across the range */
    found.sort((a, b) => a.par - b.par);
    const picked = [];
    const seen = new Set();
    for (let i = 0; i < tier.count; i++) {
      const cand = found[Math.floor(i * (found.length - 1) / Math.max(tier.count - 1, 1))];
      if (!seen.has(cand.seed)) { seen.add(cand.seed); picked.push(cand); }
    }
    for (const f of found) {
      if (picked.length >= tier.count) break;
      if (!seen.has(f.seed)) { seen.add(f.seed); picked.push(f); }
    }
    picked.sort((a, b) => a.par - b.par);
    out.push(...picked);
    console.log(`${tier.name}: baked ${picked.length} boards, pars ${picked.map(o => o.par).join(",")}`);
  }
  /* final sanity: re-verify every baked board from scratch */
  for (const lv of out) {
    const { board, pieces } = genLayout(lv.seed, lv);
    const r = lv.expert ? solveLaneBFS(board, pieces, LANE_MAX_DEPTH, LANE_MAX_STATES) : solveBFS(board, pieces, MAX_DEPTH, MAX_STATES);
    if (r.optimal !== lv.par) {
      console.error(`RE-VERIFY FAILED seed ${lv.seed}: baked par ${lv.par}, got ${r.optimal}`);
      process.exit(1);
    }
  }
  writeFileSync(join(here, outfile), JSON.stringify(out));
  console.log(`\nWrote ${out.length} verified levels to ${outfile}`);
}

/* regression: every level embedded in index.html must still solve
   to its recorded par with the current simulator                  */
function verify() {
  let checked = 0;
  for (const marker of ["LEVELS-JSON", "CAT-LEVELS-JSON", "CAT-EXPERT-LEVELS-JSON"]) {
    const match = html.match(new RegExp(marker.replace("-", "\\-") + "\\*\\/(\\[.*?\\]);", "s"));
    if (!match) { console.error(`${marker} marker not found`); process.exit(1); }
    const list = JSON.parse(match[1]);
    for (const lv of list) {
      const { board, pieces } = genLayout(lv.seed, lv);
      const r = marker === "CAT-EXPERT-LEVELS-JSON"
        ? solveLaneBFS(board, pieces, LANE_MAX_DEPTH, LANE_MAX_STATES)
        : solveBFS(board, pieces, MAX_DEPTH, MAX_STATES);
      if (r.optimal !== lv.par) {
        console.error(`REGRESSION ${marker} seed ${lv.seed} (${lv.n}x${lv.n}): embedded par ${lv.par}, solver now says ${r.optimal}`);
        process.exit(1);
      }
      checked++;
    }
    console.log(`${marker}: ${list.length} levels re-verified OK`);
  }
  console.log(`verify PASS — ${checked} embedded levels match the current simulator`);
}

const mode = process.argv[2] || "bench";
if (mode === "bench") bench();
else if (mode === "bake") bakeTiers(DUCK_TIERS, 0x00d0c000, "levels.generated.json");
else if (mode === "compare") compare();
else if (mode === "bake-cat") bakeTiers(CAT_TIERS, 0xCA7F00D5, "cat-levels.generated.json");
else if (mode === "bench-expert") benchExpert();
else if (mode === "bake-expert") bakeTiers(CAT_EXPERT_TIERS.map(t => ({ ...t, expert: true })), 0xE770CA75, "cat-levels.expert.generated.json");
else if (mode === "verify") verify();
else { console.error("unknown mode " + mode); process.exit(1); }
