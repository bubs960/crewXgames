const VERSION = "crewmultiply-play-phase1-2026-07-22-v2";
const SHELL_CACHE = `${VERSION}:shell`;
const PAGE_CACHE = `${VERSION}:pages`;
const ASSET_CACHE = `${VERSION}:assets`;
const CORE = [
  "/offline.html",
  "/site.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

const networkFirstPage = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const pageCache = await caches.open(PAGE_CACHE);
    return (await pageCache.match(request)) || (await pageCache.match("/")) || caches.match("/offline.html");
  }
};

const cacheFirstAsset = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstPage(event.request));
    return;
  }
  if (["style", "script", "image", "font"].includes(event.request.destination)) {
    event.respondWith(cacheFirstAsset(event.request));
  }
});
