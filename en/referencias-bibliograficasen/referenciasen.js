/* ==========================================
   Scientific References - EN Script
   Critical Care Tools
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const currentPath = window.location.pathname;
  const hostname = window.location.hostname;

  /* ==========================================
     1️⃣ Track Scroll Depth (Academic Engagement)
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
          gtag("event", "references_scroll_depth", {
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
     2️⃣ Track External Scientific Links
  ========================================== */

  document.querySelectorAll("a[href^='http']").forEach(link => {

    if (!link.href.includes(hostname)) {

      link.addEventListener("click", function () {

        if (typeof gtag === "function") {
          gtag("event", "scientific_reference_click", {
            event_category: "external_reference",
            event_label: link.href,
            page_path: currentPath,
            language: "en"
          });
        }

      });

    }

  });


  /* ==========================================
     3️⃣ Track Breadcrumb Navigation
  ========================================== */

  const breadcrumbLinks = document.querySelectorAll(".breadcrumb a");

  breadcrumbLinks.forEach(link => {
    link.addEventListener("click", function () {

      if (typeof gtag === "function") {
        gtag("event", "breadcrumb_click", {
          event_category: "navigation",
          event_label: link.getAttribute("href"),
          page_path: currentPath,
          language: "en"
        });
      }

    });
  });


  /* ==========================================
     4️⃣ Console Confirmation
  ========================================== */

  console.log("Scientific References EN script loaded successfully.");

});
