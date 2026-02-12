const CACHE_NAME = 'critical-care-tools-v4';

/*
  Cache ONLY safe static assets
  (NO HTML, NO clinical data, NO dynamic calculations)
*/
const STATIC_ASSETS = [
  '/style.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// =========================
// INSTALL
// =========================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// =========================
// ACTIVATE
// =========================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// =========================
// FETCH
// =========================
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ❌ Do NOT intercept HTML navigation
  if (event.request.mode === 'navigate') {
    return;
  }

  // ❌ Do NOT touch Analytics, Ads or external Google services
  if (
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('googlesyndication.com')
  ) {
    return;
  }

  // ✅ Cache-first strategy ONLY for static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
