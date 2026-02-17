/* ==========================================
   Neurocritical Care - EN Script
   Critical Care Tools
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const currentPath = window.location.pathname;

  /* ==========================================
     1️⃣ CAM-ICU
  ========================================== */

  const camSelects = [
    document.getElementById("cam_step1"),
    document.getElementById("cam_step2"),
    document.getElementById("cam_step3"),
    document.getElementById("cam_step4")
  ];

  camSelects.forEach(sel => {
    if (sel) sel.addEventListener("change", evaluateCAM);
  });

  function evaluateCAM() {

    const step1 = Number(document.getElementById("cam_step1").value);
    const step2 = Number(document.getElementById("cam_step2").value);
    const step3 = Number(document.getElementById("cam_step3").value);
    const step4 = Number(document.getElementById("cam_step4").value);

    const resultBox = document.getElementById("resultadoCAMICU");

    if (
      document.getElementById("cam_step1").value === "" ||
      document.getElementById("cam_step2").value === ""
    ) {
      resultBox.innerHTML = "";
      return;
    }

    if (step1 === 0) {
      resultBox.innerHTML =
        "<strong>CAM-ICU Negative</strong> — Delirium ruled out.";
      sendGA("camicu_negative");
      return;
    }

    if (step1 === 1 && step2 === 1 && (step3 === 1 || step4 === 1)) {
      resultBox.innerHTML =
        "<strong>CAM-ICU Positive</strong> — Delirium likely present.";
      sendGA("camicu_positive");
    } else {
      resultBox.innerHTML =
        "<strong>CAM-ICU Negative</strong> — Criteria not fulfilled.";
      sendGA("camicu_negative");
    }
  }

  /* ==========================================
     2️⃣ NIHSS
  ========================================== */

  const nihssSelects = document.querySelectorAll("#nihss select");

  nihssSelects.forEach(sel => {
    sel.addEventListener("change", calculateNIHSS);
  });

  function calculateNIHSS() {

    let total = 0;
    let filled = 0;

    nihssSelects.forEach(sel => {
      if (sel.value !== "") {
        total += Number(sel.value);
        filled++;
      }
    });

    const resultBox = document.getElementById("nihss_result");

    if (!resultBox) return;

    if (filled === 0) {
      resultBox.innerHTML = "";
      return;
    }

    resultBox.innerHTML =
      `<strong>Total NIHSS:</strong> ${total}`;

    let interpretation = "";

    if (total <= 4) interpretation = "Minor stroke.";
    else if (total <= 15) interpretation = "Moderate stroke.";
    else if (total <= 20) interpretation = "Moderate to severe stroke.";
    else interpretation = "Severe stroke.";

    resultBox.innerHTML += `<br><span class="note">${interpretation}</span>`;

    sendGA("nihss_calculated");
  }

  /* ==========================================
     3️⃣ Scroll Tracking
  ========================================== */

  let marks = [50, 90];
  let triggered = [];

  window.addEventListener("scroll", function () {

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollPercent =
      Math.round((window.scrollY / docHeight) * 100);

    marks.forEach(mark => {
      if (scrollPercent >= mark && !triggered.includes(mark)) {
        triggered.push(mark);
        sendGA("neuro_scroll_" + mark);
      }
    });

  });

  /* ==========================================
     Helper GA
  ========================================== */

  function sendGA(eventName) {
    if (typeof gtag === "function") {
      gtag("event", eventName, {
        event_category: "neuro_module",
        page_path: currentPath,
        language: "en"
      });
    }
  }

});
