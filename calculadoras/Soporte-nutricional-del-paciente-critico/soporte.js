/* ======================================================
   Critical Care Tools – JS Base
   Seguro, liviano y orientado a analítica clínica
====================================================== */

(function () {
  "use strict";

  /* =========================
     Helpers
  ========================= */

  function isAnalyticsEnabled() {
    return typeof window.gtag === "function";
  }

  function trackEvent(eventName, params = {}) {
    if (!isAnalyticsEnabled()) return;

    gtag("event", eventName, {
      page_title: document.title,
      page_location: window.location.href,
      ...params
    });
  }

  /* =========================
     Page View Manual (fallback)
     Solo si GA4 no lo dispara
  ========================= */
  document.addEventListener("DOMContentLoaded", function () {
    trackEvent("page_loaded");
  });

  /* =========================
     Engagement básico real
     (sin inflar métricas)
  ========================= */

  let engaged = false;

  function markEngagement() {
    if (engaged) return;
    engaged = true;

    trackEvent("user_engagement", {
      engagement_time_msec: 10000
    });

    removeEngagementListeners();
  }

  function removeEngagementListeners() {
    window.removeEventListener("scroll", markEngagement);
    window.removeEventListener("click", markEngagement);
    window.removeEventListener("keydown", markEngagement);
  }

  window.addEventListener("scroll", markEngagement, { once: true });
  window.addEventListener("click", markEngagement, { once: true });
  window.addEventListener("keydown", markEngagement, { once: true });

  /* =========================
     Scroll clínico relevante
     (solo >75%)
  ========================= */

  window.addEventListener("scroll", function () {
    const scrollPercent =
      (window.scrollY + window.innerHeight) /
      document.documentElement.scrollHeight;

    if (scrollPercent > 0.75) {
      trackEvent("scroll_depth", {
        percent_scrolled: 75
      });
    }
  });

  /* =========================
     Clicks relevantes
     (extensible a calculadoras)
  ========================= */

  document.addEventListener("click", function (e) {
    const target = e.target.closest("[data-track]");

    if (!target) return;

    const eventName = target.getAttribute("data-track");

    trackEvent(eventName, {
      element_text: target.innerText.trim().slice(0, 100)
    });
  });

})();
