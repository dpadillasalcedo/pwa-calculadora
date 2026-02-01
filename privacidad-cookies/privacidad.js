(() => {
  // Año dinámico
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Botón "Configurar cookies" → abre el panel de Cookiebot
  const btn = document.getElementById("btn-cookie-settings");
  if (btn) {
    btn.addEventListener("click", () => {
      // Cookiebot expone métodos si el script cargó correctamente
      if (window.Cookiebot && typeof window.Cookiebot.renew === "function") {
        window.Cookiebot.renew();
        return;
      }

      // Fallback: si Cookiebot no está listo (por caché/red), avisar
      alert("El panel de cookies no está disponible en este momento. Por favor, recargá la página e intentá nuevamente.");
    });
  }

  // Asegurar que anchors no queden escondidos bajo header (si sumás header sticky en el futuro)
  // (opcional, no hace nada si no hay offset)
})();
