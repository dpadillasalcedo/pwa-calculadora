const CACHE_NAME = 'critical-care-tools-v5';

// =========================
// INSTALL
// =========================
self.addEventListener('install', event => {
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

  // ❌ No intercept HTML navigation
  if (event.request.mode === 'navigate') return;

  // ❌ Ignore Google services
  if (
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('googlesyndication.com')
  ) return;

  // ✅ Only cache local static assets (CSS, JS, images, icons)
  if (
    url.origin === location.origin &&
    (
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.webp')
    )
  ) {

    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          return cached || fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
  }

});
