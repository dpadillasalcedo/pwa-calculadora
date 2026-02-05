const CACHE_NAME = "criticalcaretools-v2";

const ASSETS = [
  "/", 
  "/index.html",

  // Manifest
  "/manifest.webmanifest",

  // Farmacoteca UCI
  "/calculadoras/infusion-farmacos/farmacoteca.html",
  "/calculadoras/infusion-farmacos/farmacoteca.css",
  "/calculadoras/infusion-farmacos/farmacoteca.js"
];

// =========================================================
// INSTALL
// =========================================================
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// =========================================================
// ACTIVATE
// =========================================================
self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// =========================================================
// FETCH
// Network first, fallback cache
// =========================================================
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
