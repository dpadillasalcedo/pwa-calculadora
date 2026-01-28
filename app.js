/* =========================
   HOME · JS
   - Analytics
   - UX mínima
   - Preparado para expansión
========================= */

document.addEventListener("DOMContentLoaded", () => {
  initHomeTracking();
});

/* =========================
   TRACKING HOME
========================= */
function initHomeTracking() {
  const cards = document.querySelectorAll(".nav-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const section = card.dataset.section || "unknown";

      if (typeof gtag === "function") {
        gtag("event", "home_navigation_click", {
          event_category: "home",
          event_label: section
        });
      }
    });
  });
}

/* =========================
   FUTURO
   - animaciones suaves
   - highlight por scroll
   - banners dinámicos
========================= */
