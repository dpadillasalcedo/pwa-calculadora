// =========================================================
// VANCOMICINA EN INFUSIÓN CONTINUA (24 h)
// =========================================================
// eGFR = 186.2 * (Cr^-1.154) * (Edad^-0.203) * sexoFactor
// sexoFactor = 1 (v) | 0.742 (m)
// CLvanco = 0.029 * eGFR + 0.94
// Mantenimiento (g/24h) = CLvanco * Meta(mg/L) * 24 / 1000
// Carga (g) = Peso * 25 / 1000 (máx 2 g)
// =========================================================

function round(n, d = 2) {
  if (!Number.isFinite(n)) return "—";
  const p = Math.pow(10, d);
  return (Math.round(n * p) / p).toFixed(d);
}

function show(el, html) {
  if (!el) return;
  el.innerHTML = html;
  el.classList.remove("hidden");
}

function hide(el) {
  if (!el) return;
  el.classList.add("hidden");
  el.innerHTML = "";
}

function validarInputs({ cr, edad, sexo, meta, peso }) {
  const errs = [];
  if (!Number.isFinite(cr) || cr <= 0) errs.push("Ingresar una creatinina válida (> 0).");
  if (!Number.isFinite(edad) || edad <= 0) errs.push("Ingresar una edad válida (> 0).");
  if (sexo !== "v" && sexo !== "m") errs.push("Seleccionar sexo (v/m).");
  if (!Number.isFinite(meta) || meta <= 0) errs.push("Ingresar una meta de vancocinemia válida (> 0).");
  if (!Number.isFinite(peso) || peso <= 0) errs.push("Ingresar un peso válido (> 0).");
  return errs;
}

function calcular() {
  const cr = parseFloat(document.getElementById("cr")?.value);
  const edad = parseFloat(document.getElementById("edad")?.value);
  const sexo = document.getElementById("sexo")?.value;
  const meta = parseFloat(document.getElementById("meta")?.value);
  const peso = parseFloat(document.getElementById("peso")?.value);

  const errores = document.getElementById("errores");
  const resEgfr = document.getElementById("res-egfr");
  const resCl = document.getElementById("res-cl");
  const resMant = document.getElementById("res-mant");
  const resCarga = document.getElementById("res-carga");
  const resNotas = document.getElementById("res-notas");

  hide(errores);
  [resEgfr, resCl, resMant, resCarga, resNotas].forEach(el => {
    if (el) el.textContent = "";
  });

  const errs = validarInputs({ cr, edad, sexo, meta, peso });
  if (errs.length) {
    show(errores, `<strong>Revisar:</strong><br>${errs.map(e => `• ${e}`).join("<br>")}`);
    return;
  }

  const sexoFactor = sexo === "v" ? 1 : 0.742;

  const egfr = 186.2 * Math.pow(cr, -1.154) * Math.pow(edad, -0.203) * sexoFactor;
  const clVanco = 0.029 * egfr + 0.94;
  const mantG24 = clVanco * meta * 24 / 1000;

  const cargaTeorica = peso * 25 / 1000;
  const cargaFinal = Math.min(cargaTeorica, 2);

  if (resEgfr) resEgfr.innerHTML =
    `eGFR estimado (MDRD): <strong>${round(egfr, 1)}</strong> mL/min/1.73m²`;

  if (resCl) resCl.innerHTML =
    `Clearance estimado de vancomicina: <strong>${round(clVanco, 2)}</strong> L/h`;

  if (resMant) resMant.innerHTML =
    `Dosis de mantenimiento (infusión continua 24 h): <strong>${round(mantG24, 2)}</strong> g/24 h`;

  if (resCarga) resCarga.innerHTML =
    `Dosis de carga (25 mg/kg): <strong>${round(cargaFinal, 2)}</strong> g`;

  const notas = [];
  if (cargaTeorica > 2) {
    notas.push("Se aplicó tope de dosis de carga: <strong>máximo 2 g</strong>.");
  }
  notas.push("Interpretar junto a niveles, función renal dinámica y situación clínica.");

  if (resNotas) resNotas.innerHTML = notas.join("<br>");
}

function limpiar() {
  ["cr", "edad", "meta", "peso"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const sexo = document.getElementById("sexo");
  if (sexo) sexo.value = "";

  hide(document.getElementById("errores"));
  ["res-egfr","res-cl","res-mant","res-carga","res-notas"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

// =========================================================
// GA4 + CONSENTIMIENTO (UE vs RESTO DEL MUNDO)
// =========================================================

window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

// Estado seguro por defecto (UE)
gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied"
});

function activarGA() {
  gtag("config", "G-WQREHQ56Q4", { anonymize_ip: true });
}

// Fuera de Europa → GA automático
window.addEventListener("load", () => {
  if (window.Cookiebot && Cookiebot.data?.region !== "EU") {
    gtag("consent", "update", { analytics_storage: "granted" });
    activarGA();
  }
});

// Europa → GA solo con consentimiento explícito
window.addEventListener("CookieConsentDeclaration", () => {
  if (
    window.Cookiebot &&
    Cookiebot.data?.region === "EU" &&
    Cookiebot.consents?.statistics
  ) {
    gtag("consent", "update", { analytics_storage: "granted" });
    activarGA();
  }
});

// =========================================================
// INIT + CTA FARMACOTECA
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // Vancomicina
  document.getElementById("btnCalcular")?.addEventListener("click", calcular);
  document.getElementById("btnLimpiar")?.addEventListener("click", limpiar);

  // CTA Farmacoteca (acceso libre + tracking)
  const cta = document.querySelector(".btn-cta");
  if (cta) {
    cta.addEventListener("click", () => {
      if (typeof gtag === "function") {
        gtag("event", "click_farmacoteca", {
          event_category: "cta",
          event_label: "Farmacoteca UCI",
          transport_type: "beacon"
        });
      }
    });
  }
});
