/* =========================
   SEO + ANALYTICS (URL-based)
   Domain: https://criticalcaretools.com
========================= */

const SITE_URL = "https://criticalcaretools.com";

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

function setMetaTag(selector, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    if (selector.includes("property")) {
      el.setAttribute("property", attr);
    } else {
      el.setAttribute("name", attr);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function applySEO() {
  const path = normalizePath(location.pathname);
  const cfg = SEO_ROUTE_MAP[path];
  if (!cfg) return;

  const canonicalUrl = `${SITE_URL}${path}`;

  // Title
  document.title = cfg.title;

  // Meta description
  setMetaTag('meta[name="description"]', "description", cfg.description);

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", canonicalUrl);

  // Open Graph
  setMetaTag('meta[property="og:title"]', "og:title", cfg.title);
  setMetaTag(
    'meta[property="og:description"]',
    "og:description",
    cfg.description
  );
  setMetaTag('meta[property="og:url"]', "og:url", canonicalUrl);
  setMetaTag('meta[property="og:type"]', "og:type", "website");

  // Pageview (una vez por URL)
  if (typeof trackEvent === "function") {
    trackEvent("page_view", {
      page_path: path,
      page_location: canonicalUrl
    });
  }
}

document.addEventListener("DOMContentLoaded", applySEO);
