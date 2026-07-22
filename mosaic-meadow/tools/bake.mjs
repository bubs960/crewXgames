// Offline ladder-level baker for Mosaic Meadow.
// Regex-extracts the CORE block from ../index.html (generator + backtracking
// uniqueness solver + par calculator) so bake-time logic can never drift from
// what ships in the browser, evals it in Node, then searches seeds for each
// ladder level until a uniquely-solvable board is found. countSolutions() is
// expensive at large N (measured 13.7s avg / 49s worst-case at 8x8) — that
// cost is fine here (one-time, offline) and is exactly why the game itself
// never calls countSolutions for ladder play; see buildBakedBoard() in
// index.html, which just replays the winning attempt found here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(indexPath, "utf8");

const coreMatch = html.match(/\/\* CORE-START[^*]*\*\/([\s\S]*?)\/\* CORE-END \*\//);
if (!coreMatch) throw new Error("CORE-START/CORE-END markers not found in index.html");
const coreSrc = coreMatch[1];

const core = new Function(`${coreSrc}\nreturn { mulberry32, buildSolvedTuples, countSolutions, generateVerified, computePar, validRotSet };`)();

const VINE_BIAS = 0.55;

// level index -> grid size: 4x4x4, 5x5x5, 6x5, 7x5, 8x6 = 25 levels total
const SIZES = [
  ...Array(4).fill(4),
  ...Array(5).fill(5),
  ...Array(5).fill(6),
  ...Array(5).fill(7),
  ...Array(6).fill(8),
];

const NODE_BUDGET = 3_000_000;
const MAX_ATTEMPTS = 200;

const levels = [];
for (let i = 0; i < SIZES.length; i++) {
  const n = SIZES[i];
  let outerSeed = (i + 1) * 1000003 + 17;
  let result = null;
  for (let outerTry = 0; outerTry < 20; outerTry++) {
    const t0 = Date.now();
    const res = core.generateVerified(n, VINE_BIAS, outerSeed, MAX_ATTEMPTS, NODE_BUDGET);
    const ms = Date.now() - t0;
    if (res.ok) {
      const par = core.computePar(res);
      levels.push({ n, seed: outerSeed, attempt: res.attempt, par });
      console.log(`level ${i + 1}: n=${n} seed=${outerSeed} attempt=${res.attempt} par=${par} (${ms}ms)`);
      result = res;
      break;
    }
    console.log(`level ${i + 1}: n=${n} seed=${outerSeed} FAILED after ${MAX_ATTEMPTS} attempts (${ms}ms), trying next seed`);
    outerSeed += 104729;
  }
  if (!result) throw new Error(`Could not bake level ${i + 1} (n=${n}) after 20 outer seed retries`);
}

const markerRe = /\/\* LADDER-LEVELS-START \*\/[\s\S]*?\/\* LADDER-LEVELS-END \*\//;
if (!markerRe.test(html)) throw new Error("LADDER-LEVELS-START/END markers not found in index.html");
const literal = "const LADDER_LEVELS = " + JSON.stringify(levels, null, 2) + ";";
const newHtml = html.replace(markerRe, `/* LADDER-LEVELS-START */\n  ${literal}\n  /* LADDER-LEVELS-END */`);
if (newHtml === html) {
  console.log(`\nAll ${levels.length} levels matched the seeds/attempts/par already baked into index.html — nothing to write.`);
} else {
  fs.writeFileSync(indexPath, newHtml, "utf8");
  console.log(`\nBaked ${levels.length} levels into ${indexPath}`);
}
