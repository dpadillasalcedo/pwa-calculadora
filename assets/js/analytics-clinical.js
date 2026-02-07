(function () {
  "use strict";

  // =========================
  // Config
  // =========================
  const DEFAULT_CATEGORY = "uci";
  const VIEW_EVENT = "calculator_viewed";
  const START_EVENT = "calculator_started";
  const COMPLETE_EVENT = "calculator_completed";
  const RESET_EVENT = "calculator_reset";
  const RESULT_EVENT = "result_viewed";

  // Flags anti-duplicados (por sesión de página)
  let viewedSent = false;
  let startedSent = false;
  let completedSent = false;
  let resetSent = false;
  let resultSent = false;

  // =========================
  // Helpers
  // =========================
  function canTrack() {
    return typeof window.gtag === "function";
  }

  function getCalculatorName() {
    // 1) Meta explícita (recomendado)
    const meta = document.querySelector('meta[name="calculator-name"]');
    if (meta && meta.content) return meta.content.trim();

    // 2) Fallback: path
    const path = (location.pathname || "/")
      .replace(/\/$/, "")
      .split("/")
      .filter(Boolean)
      .slice(-2)
      .join("_");

    return path || "unknown_calculator";
  }

  function track(eventName, params = {}) {
    if (!canTrack()) return;

    gtag("event", eventName, {
      calculator_name: getCalculatorName(),
      category: DEFAULT_CATEGORY,
      page_location: location.href,
      page_title: document.title,
      ...params
    });
  }

  function normalizeText(t) {
    return (t || "").toLowerCase().trim();
  }

  function isCalcButton(el) {
    const haystack = `
      ${normalizeText(el.textContent)}
      ${normalizeText(el.getAttribute("aria-label"))}
      ${normalizeText(el.id)}
      ${normalizeText(el.className)}
    `;

    return (
      haystack.includes("calcular") ||
      haystack.includes("calcula") ||
      haystack.includes("calculate") ||
      haystack.includes("compute") ||
      haystack.includes("score") ||
      haystack.includes("result") ||
      el.type === "submit"
    );
  }

  function isResetButton(el) {
    const haystack = `
      ${normalizeText(el.textContent)}
      ${normalizeText(el.getAttribute("aria-label"))}
      ${normalizeText(el.id)}
      ${normalizeText(el.className)}
    `;

    return (
      haystack.includes("reset") ||
      haystack.includes("limpiar") ||
      haystack.includes("borrar") ||
      haystack.includes("reiniciar") ||
      el.type === "reset"
    );
  }

  // =========================
  // 1) Viewed — SOLO cuando la página es visible
  // =========================
  function sendViewedOnce() {
    if (viewedSent) return;
    if (document.visibilityState !== "visible") return;

    viewedSent = true;
    track(VIEW_EVENT);
  }

  document.addEventListener("DOMContentLoaded", sendViewedOnce);
  document.addEventListener("visibilitychange", sendViewedOnce);

  // =========================
  // 2) Started — primer input HUMANO y VISIBLE
  // =========================
  document.addEventListener(
    "input",
    (e) => {
      if (startedSent) return;

      const el = e.target;
      if (!el) return;

      // Solo inputs visibles (evita autocompletado, SW, hidden, etc.)
      if (
        el.matches("input:not([type='hidden']), select, textarea") &&
        el.offsetParent !== null
      ) {
        startedSent = true;
        track(START_EVENT, {
          first_input_type: el.tagName.toLowerCase()
        });
      }
    },
    { passive: true }
  );

  // =========================
  // 3) Completed / Reset — click explícito
  // =========================
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target && e.target.closest(
        "button, input[type='submit'], input[type='button'], a"
      );
      if (!btn) return;

      if (!completedSent && isCalcButton(btn)) {
        completedSent = true;
        track(COMPLETE_EVENT, { trigger: "click" });
      }

      if (!resetSent && isResetButton(btn)) {
        resetSent = true;
        track(RESET_EVENT, { trigger: "click" });
      }
    },
    { passive: true }
  );

  // =========================
  // 4) Completed — submit (fallback)
  // =========================
  document.addEventListener("submit", () => {
    if (completedSent) return;
    completedSent = true;
    track(COMPLETE_EVENT, { trigger: "submit" });
  });

  // =========================
  // 5) Result viewed — MutationObserver CONTROLADO
  // =========================
  const resultSelectors = [
    "#result",
    "#resultado",
    ".result",
    ".resultado",
    "[data-result]",
    "[aria-live='polite']"
  ];

  const obs = new MutationObserver(() => {
    if (resultSent) {
      obs.disconnect();
      return;
    }

    for (const sel of resultSelectors) {
      const node = document.querySelector(sel);
      if (node && normalizeText(node.textContent).length > 0) {
        resultSent = true;
        track(RESULT_EVENT, { selector: sel });
        obs.disconnect(); // 🔥 clave para evitar ruido
        break;
      }
    }
  });

  obs.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

})();
