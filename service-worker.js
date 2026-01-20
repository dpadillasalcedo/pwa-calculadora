// Service Worker minimo (opcional)
// Nota: En esta version NO se cachean archivos para evitar que veas estilos o JS viejos.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
