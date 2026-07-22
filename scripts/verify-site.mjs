const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:4173";

const siteRoutes = [
  "/",
  "/games/",
  "/games/counter-cat/",
  "/games/mosaic-meadow/",
  "/games/pup-purr-bento/",
  "/games/paws-yarn-tangle/",
  "/games/pet-parade-sort/",
  "/games/cozy-crochet-critters/",
  "/daily/",
  "/about/",
  "/privacy/",
  "/terms/",
  "/cookies/",
  "/ads-and-rewards/",
  "/accessibility/",
  "/contact/",
  "/shelf/"
];

const legacyRoutes = [
  ["/waddle-home/", "Counter Cat"],
  ["/mosaic-meadow/", "Mosaic Meadow"],
  ["/pup-purr-bento/", "Pup & Purr Bento"],
  ["/paws-yarn-tangle/", "Paws & Yarn Tangle"],
  ["/pet-parade-sort/", "Pet Parade Sort"]
];

const publicFiles = [
  "/site.webmanifest",
  "/sw.js",
  "/robots.txt",
  "/sitemap.xml",
  "/offline.html",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/social-card.png"
];

const expectedHeaders = [
  "content-security-policy",
  "permissions-policy",
  "x-frame-options"
];

const failures = [];
for (const route of siteRoutes) {
  const response = await fetch(baseUrl + route, { redirect: "manual" });
  const body = await response.text();
  if (response.status !== 200 || !body.includes('id="root"')) failures.push(`${route}: expected app shell, got ${response.status}`);
}

for (const [route, title] of legacyRoutes) {
  const response = await fetch(baseUrl + route, { redirect: "manual" });
  const body = await response.text();
  if (response.status !== 200 || !body.includes(`<title>${title}</title>`)) failures.push(`${route}: legacy game did not load as ${title}`);
}

for (const route of publicFiles) {
  const response = await fetch(baseUrl + route, { redirect: "manual" });
  if (response.status !== 200) failures.push(`${route}: public artifact returned ${response.status}`);
}

const homeResponse = await fetch(baseUrl + "/", { redirect: "manual" });
if (baseUrl.startsWith("https://")) {
  for (const header of expectedHeaders) {
    if (!homeResponse.headers.has(header)) failures.push(`/: missing production ${header} header`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${siteRoutes.length} app routes, ${legacyRoutes.length} legacy games, and ${publicFiles.length} public artifacts at ${baseUrl}.`);
}
