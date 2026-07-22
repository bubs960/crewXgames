const CACHE_NAME = "crewmultiply-play-v2";
const FILES = [
  "./",
  "./index.html",
  "./site.webmanifest",
  "./assets/icon.svg",
  "./assets/site.css",
  "./assets/site.js",
  "./assets/screens/counter-cat.png",
  "./assets/screens/meadow.png",
  "./assets/screens/bento.png",
  "./assets/screens/tangle.png",
  "./assets/screens/parade.png",
  "./games/index.html",
  "./games/counter-cat/index.html",
  "./daily/index.html",
  "./about/index.html",
  "./privacy/index.html",
  "./terms/index.html",
  "./cookies/index.html",
  "./ads-and-rewards/index.html",
  "./accessibility/index.html",
  "./contact/index.html",
  "./waddle-home/index.html",
  "./mosaic-meadow/index.html",
  "./pup-purr-bento/index.html",
  "./paws-yarn-tangle/index.html",
  "./pet-parade-sort/index.html"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
