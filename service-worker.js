// Service Worker minimalista – Dominio nuevo
// Fuerza limpieza total de caches y control inmediato

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Elimina cualquier cache residual
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cache) => caches.delete(cache))
      );

      // Toma control inmediato
      await self.clients.claim();
    })()
  );
});
