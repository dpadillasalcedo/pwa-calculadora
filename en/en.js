/* =========================
   HOME · JS (ENGLISH VERSION)
   - Analytics tracking
   - Basic UX interactions
   - Ready for scaling
========================= */

document.addEventListener("DOMContentLoaded", () => {
  initHomeTracking();
});

/* =========================
   HOME NAVIGATION TRACKING
========================= */
function initHomeTracking() {
  const navigationItems = document.querySelectorAll(".menu article");

  navigationItems.forEach(item => {
    const link = item.querySelector("a");

    if (!link) return;

    link.addEventListener("click", () => {
      const sectionName = link.textContent.trim() || "unknown";

      if (typeof gtag === "function") {
        gtag("event", "home_navigation_click", {
          event_category: "homepage",
          event_label: sectionName,
          transport_type: "beacon"
        });
      }
    });
  });
}

/* =========================
   FUTURE FEATURES (READY)
   - Smooth animations
   - Scroll highlighting
   - Dynamic banners
   - Premium prompts
========================= */
