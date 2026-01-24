/* =========================
   SEO + ANALYTICS (URL-based)
========================= */

const SEO_ROUTE_MAP = {
  "/": {
    title: "Calculadora UCI – Herramientas clínicas para terapia intensiva",
    description:
      "Calculadoras clínicas para UCI: SOFA-2, NIHSS, CAM-ICU, ecocardiografía y hemodinamia."
  },

  "/sofa-2-score": {
    title: "SOFA-2 Score – Evaluación de disfunción orgánica en UCI",
    description:
      "Calculadora SOFA-2 online para estimar disfunción orgánica y mortalidad en pacientes críticos."
  },

  "/nihss-score": {
    title: "NIHSS Score – Escala de severidad del ACV",
    description:
      "Calculadora NIHSS para cuantificar el déficit neurológico en pacientes con accidente cerebrovascular."
  },

  "/cam-icu": {
    title: "CAM-ICU – Detección de delirium en UCI",
    description:
      "Evaluación CAM-ICU paso a paso para detección de delirium en pacientes críticos."
  },

  "/ecocardiografia-gc": {
    title: "Gasto cardíaco por ecocardiografía (VTI)",
    description:
      "Cálculo del gasto cardíaco por ecocardiografía utilizando TSVI y VTI medidos con Doppler pulsado."
  }
};

function normalizePath(path) {
  return path.replace(/\/$/, "") || "/";
}

function applySEO() {
  const path = normalizePath(location.pathname);
  const cfg = SEO_ROUTE_MAP[path];
  if (!cfg) return;

  document.title = cfg.title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", cfg.description);

  // Pageview real (una vez por URL)
  if (typeof trackEvent === "function") {
    trackEvent("page_view", { page_path: path });
  }
}

document.addEventListener("DOMContentLoaded", applySEO);

