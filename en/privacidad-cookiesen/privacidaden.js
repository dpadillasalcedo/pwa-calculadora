/* ==========================================
   Privacy & Cookies - EN Script
   Critical Care Tools
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const currentPath = window.location.pathname;

  /* ==========================================
     1️⃣ Cookie Settings Button
  ========================================== */

  const cookieBtn = document.getElementById("btn-cookie-settings");

  if (cookieBtn) {
    cookieBtn.addEventListener("click", function () {

      if (typeof Cookiebot !== "undefined") {
        Cookiebot.renew(); // Opens consent dialog
      }

      if (typeof gtag === "function") {
        gtag("event", "cookie_settings_opened", {
          event_category: "privacy",
          page_path: currentPath,
          language: "en"
        });
      }

    });
  }


  /* ==========================================
     2️⃣ Scroll Depth (Legal Engagement)
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
          gtag("event", "privacy_scroll_depth", {
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
     3️⃣ Internal Link Tracking (TOC)
  ========================================== */

  document.querySelectorAll(".toc a").forEach(link => {

    link.addEventListener("click", function () {

      if (typeof gtag === "function") {
        gtag("event", "privacy_section_navigation", {
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

  console.log("Privacy & Cookies EN script loaded.");

});
