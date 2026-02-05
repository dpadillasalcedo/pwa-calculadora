/* =========================
   PRIVACIDAD · JS
   Página legal / contenido
========================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     Año dinámico en footer
  ========================= */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* =========================
     Botón Configurar cookies
  ========================= */
  const cookieBtn = document.getElementById("btn-cookie-settings");

  if (cookieBtn) {
    cookieBtn.addEventListener("click", () => {
      if (window.Cookiebot) {
        // Abre el panel de configuración de Cookiebot
        Cookiebot.show();
      } else {
        console.warn("Cookiebot no está disponible todavía.");
      }
    });
  }

  /* =========================
     Foco por hash (TOC)
     Mejora UX al navegar #secciones
  ========================= */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }
});
