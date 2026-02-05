const CACHE_NAME = 'critical-care-tools-v3';

/*
  Cache SOLO de assets estáticos seguros
  (NO HTML, NO cálculos, NO datos clínicos)
*/
const STATIC_ASSETS = [
  '/style.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
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

// Fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ❌ No interceptar navegación (HTML siempre desde red)
  if (event.request.mode === 'navigate') {
    return;
  }

  // ❌ No tocar Analytics ni Google
  if (
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com')
  ) {
    return;
  }

  // ✅ Cache-first SOLO para assets estáticos
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
