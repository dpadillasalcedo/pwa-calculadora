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

  // Evita duplicados
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
    // 1) <meta name="calculator-name" content="..."> (opcional)
    const meta = document.querySelector('meta[name="calculator-name"]');
    if (meta && meta.content) return meta.content.trim();

    // 2) Path como fallback
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
    const text = normalizeText(el.textContent);
    const aria = normalizeText(el.getAttribute("aria-label"));
    const id = normalizeText(el.id);
    const cls = normalizeText(el.className);

    const haystack = `${text} ${aria} ${id} ${cls}`;
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
    const text = normalizeText(el.textContent);
    const aria = normalizeText(el.getAttribute("aria-label"));
    const id = normalizeText(el.id);
    const cls = normalizeText(el.className);

    const haystack = `${text} ${aria} ${id} ${cls}`;
    return (
      haystack.includes("reset") ||
      haystack.includes("limpiar") ||
      haystack.includes("borrar") ||
      haystack.includes("reiniciar") ||
      el.type === "reset"
    );
  }

  // =========================
  // 1) Viewed (cuando se ve contenido)
  // =========================
  function sendViewedOnce() {
    if (viewedSent) return;
    viewedSent = true;
    track(VIEW_EVENT);
  }

  // Enviar cuando DOM está listo
  document.addEventListener("DOMContentLoaded", () => {
    sendViewedOnce();
  });

  // =========================
  // 2) Started (primer input)
  // =========================
  document.addEventListener(
    "input",
    (e) => {
      const el = e.target;
      if (!el) return;

      if (
        el.matches("input, select, textarea") &&
        !startedSent
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
  // 3) Completed / Reset (click)
  // =========================
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target && e.target.closest("button, input[type='submit'], input[type='button'], a");
      if (!btn) return;

      if (!completedSent && isCalcButton(btn)) {
        completedSent = true;
        track(COMPLETE_EVENT, {
          trigger: "click"
        });
      }

      if (!resetSent && isResetButton(btn)) {
        resetSent = true;
        track(RESET_EVENT, {
          trigger: "click"
        });
      }
    },
    { passive: true }
  );

  // =========================
  // 4) Completed (submit)
  // =========================
  document.addEventListener("submit", (e) => {
    if (completedSent) return;
    completedSent = true;
    track(COMPLETE_EVENT, { trigger: "submit" });
  });

  // =========================
  // 5) Result viewed (heurístico)
  // Busca IDs/clases típicas donde aparece un resultado
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
    if (resultSent) return;

    for (const sel of resultSelectors) {
      const node = document.querySelector(sel);
      if (node && normalizeText(node.textContent).length > 0) {
        resultSent = true;
        track(RESULT_EVENT, { selector: sel });
        break;
      }
    }
  });

  obs.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

})();

