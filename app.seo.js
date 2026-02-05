/* =========================
   SEO DINÁMICO (NO ANALYTICS)
   Domain: https://criticalcaretools.com
   Uso: multipágina (NO SPA)
========================= */

const SITE_URL = "https://criticalcaretools.com";

/* =========================
   MAPA SEO POR RUTA REAL
========================= */
const SEO_ROUTE_MAP = {
  "/": {
    title: "Calculadora UCI Adultos | Herramientas clínicas para terapia intensiva",
    description:
      "Calculadoras clínicas para UCI: ventilación mecánica, SOFA-2, NIHSS, CAM-ICU, ecocardiografía, hemodinamia y estado ácido–base."
  },

  "/calculadoras/variables-clinicas": {
    title: "Variables clínicas en UCI | Scores y fórmulas críticas",
    description:
      "Evaluación clínica en terapia intensiva: neurología crítica, ventilación mecánica, hemodinamia, oxigenación y scores pronósticos."
  },

  "/calculadoras/variables-clinicas/neurologia-critica": {
    title: "Neurología crítica en UCI | CAM-ICU, NIHSS, Hunt & Hess, Marshall",
    description:
      "Calculadoras de neurología crítica: CAM-ICU para delirium, NIHSS, Hunt & Hess y Marshall score en pacientes críticos."
  },

  "/calculadoras/variables-clinicas/ventilacion-mecanica": {
    title: "Ventilación mecánica en UCI | Peso ideal y ajuste de PCO₂",
    description:
      "Cálculos clínicos para ventilación mecánica invasiva: peso ideal, ajuste de ventilación minuto y PCO₂ deseada."
  },

  "/calculadoras/variables-clinicas/sistemas-puntuacion": {
    title: "Scores pronósticos en UCI | SOFA-2, APACHE II, SAPS II",
    description:
      "Scores pronósticos para pacientes críticos: SOFA-2, APACHE II y SAPS II con interpretación clínica."
  },

  "/calculadoras/variables-clinicas/monitoreo-hemodinamico": {
    title: "Monitoreo hemodinámico en UCI | GC, oxigenación y perfusión",
    description:
      "Evaluación hemodinámica avanzada: gasto cardíaco por ecocardiografía, oxigenación, RVS, PPC y perfusión tisular."
  },

  "/calculadoras/variables-clinicas/estado-acido-base": {
    title: "Estado ácido–base en UCI | Anion gap y compensaciones",
    description:
      "Evaluación de trastornos ácido–base: anion gap corregido, delta–delta, sodio y calcio corregido."
  }
};

/* =========================
   HELPERS
========================= */
function normalizePath(path) {
  if (!path) return "/";
  return path.endsWith("/") && path.length > 1
    ? path.slice(0, -1)
    : path;
}

function setMeta(nameOrProperty, value, isProperty = false) {
  const selector = isProperty
    ? `meta[property="${nameOrProperty}"]`
    : `meta[name="${nameOrProperty}"]`;

  let el = document.querySelector(selector);

  if (!el) {
    el = document.createElement("meta");
    if (isProperty) {
      el.setAttribute("property", nameOrProperty);
    } else {
      el.setAttribute("name", nameOrProperty);
    }
    document.head.appendChild(el);
  }

  el.setAttribute("content", value);
}

/* =========================
   APPLY SEO (solo SEO)
========================= */
function applySEO() {
  const path = normalizePath(window.location.pathname);
  const cfg = SEO_ROUTE_MAP[path];

  if (!cfg) return;

  const canonicalUrl = `${SITE_URL}${path === "/" ? "" : path}`;

  // Title
  document.title = cfg.title;

  // Meta description
  setMeta("description", cfg.description);

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", canonicalUrl);

  // Open Graph
  setMeta("og:title", cfg.title, true);
  setMeta("og:description", cfg.description, true);
  setMeta("og:url", canonicalUrl, true);
  setMeta("og:type", "website", true);
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", applySEO);
