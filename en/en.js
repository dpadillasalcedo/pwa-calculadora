/* ==========================================
   Critical Care Tools - EN Main Script
   Version: 1.0
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ==========================================
     1️⃣ Highlight Active Navigation
  ========================================== */

  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("a");

  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active-link");
    }
  });


  /* ==========================================
     2️⃣ Track Calculator Clicks (GA4 Events)
  ========================================== */

  const calculatorLinks = document.querySelectorAll(".menu a");

  calculatorLinks.forEach(link => {
    link.addEventListener("click", function () {

      if (typeof gtag === "function") {
        gtag("event", "calculator_click", {
          event_category: "navigation",
          event_label: link.href,
          language: "en"
        });
      }

    });
  });


  /* ==========================================
     3️⃣ Outbound Link Tracking
  ========================================== */

  const externalLinks = document.querySelectorAll("a[href^='http']");

  externalLinks.forEach(link => {
    if (!link.href.includes(window.location.hostname)) {
      link.addEventListener("click", function () {

        if (typeof gtag === "function") {
          gtag("event", "outbound_click", {
            event_category: "external_link",
            event_label: link.href,
            language: "en"
          });
        }

      });
    }
  });


  /* ==========================================
     4️⃣ Smooth Scroll (Optional Enhancement)
  ========================================== */

  document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  });


  /* ==========================================
     5️⃣ Debug Mode (disable in production if needed)
  ========================================== */

  console.log("Critical Care Tools EN script loaded correctly.");

});
