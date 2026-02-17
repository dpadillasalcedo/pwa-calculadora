/* ==========================================
   Clinical Variables Hub - EN Script
   Critical Care Tools
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const currentPath = window.location.pathname;
  const hostname = window.location.hostname;

  /* ==========================================
     1️⃣ Track Card Clicks (Main KPI)
  ========================================== */

  const cards = document.querySelectorAll(".menu a");

  cards.forEach(card => {
    card.addEventListener("click", function () {

      if (typeof gtag === "function") {
        gtag("event", "clinical_module_click", {
          event_category: "navigation",
          event_label: card.getAttribute("href"),
          page_path: currentPath,
          language: "en"
        });
      }

    });
  });

  /* ==========================================
     2️⃣ Scroll Depth (Hub Engagement)
  ========================================== */

  let scrollMarks = [25, 50, 75, 100];
  let triggered = [];

  window.addEventListener("scroll", function () {

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    scrollMarks.forEach(mark => {
      if (scrollPercent >= mark && !triggered.includes(mark)) {

        triggered.push(mark);

        if (typeof gtag === "function") {
          gtag("event", "clinical_hub_scroll", {
            event_category: "engagement",
            event_label: mark + "%",
            page_path: currentPath,
            language: "en"
          });
        }

      }
    });

  });

  /* ==========================================
     3️⃣ Breadcrumb Tracking
  ========================================== */

  document.querySelectorAll(".breadcrumb a").forEach(link => {

    link.addEventListener("click", function () {

      if (typeof gtag === "function") {
        gtag("event", "clinical_breadcrumb_click", {
          event_category: "navigation",
          event_label: link.getAttribute("href"),
          page_path: currentPath,
          language: "en"
        });
      }

    });

  });

  /* ==========================================
     4️⃣ Outbound Links
  ========================================== */

  document.querySelectorAll("a[href^='http']").forEach(link => {

    if (!link.href.includes(hostname)) {

      link.addEventListener("click", function () {

        if (typeof gtag === "function") {
          gtag("event", "clinical_outbound_click", {
            event_category: "external_link",
            event_label: link.href,
            page_path: currentPath,
            language: "en"
          });
        }

      });

    }

  });

  console.log("Clinical Variables EN script loaded.");

});
