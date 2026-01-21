/* =========================
   ANALYTICS HELPER (GA4)
========================= */
function trackEvent(name, params = {}) {
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, {
      event_category: "clinical_calculator",
      ...params,
    });
  } catch (e) {
    // Silencioso: nunca rompe la app clínica
  }
}

/* =========================
   Helpers
========================= */
function num(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const v = parseFloat(el.value);
  return Number.isFinite(v) ? v : NaN;
}

function anyNaN(arr) {
  return arr.some(v => !Number.isFinite(v));
}

function clampPercent(p) {
  if (!Number.isFinite(p)) return NaN;
  return Math.max(0, Math.min(100, p));
}

/* =========================
   VENTILACIÓN MECÁNICA
========================= */
function calcularPesoIdeal() {
  const talla = num("talla");
  const sexo = document.getElementById("sexo")?.value;
  const resultado = document.getElementById("resultadoPeso");

  if (!Number.isFinite(talla) || talla <= 0) {
    resultado.innerText = "Ingrese una talla válida";
    return;
  }

  let pesoIdeal;
  if (sexo === "hombre") pesoIdeal = 50 + 0.91 * (talla - 152.4);
  else if (sexo === "mujer") pesoIdeal = 45 + 0.91 * (talla - 152.4);
  else {
    resultado.innerText = "Seleccione el sexo";
    return;
  }

  const vt6 = pesoIdeal * 6;
  const vt7 = pesoIdeal * 7;
  const vt8 = pesoIdeal * 8;

  resultado.innerHTML = `
    <b>Peso ideal:</b> ${pesoIdeal.toFixed(1)} kg
    <hr>
    <b>Volumen corriente sugerido</b><br>
    • 6 ml/kg: <b>${vt6.toFixed(0)} mL</b><br>
    • 7 ml/kg: <b>${vt7.toFixed(0)} mL</b><br>
    • 8 ml/kg: <b>${vt8.toFixed(0)} mL</b>
  `;

  trackEvent("calculate_ideal_body_weight", {
    sex: sexo,
    height_cm: talla,
  });
}

function ajustarPCO2() {
  const pco2Act = num("pco2Act");
  const pco2Des = num("pco2Des");
  const resultado = document.getElementById("resultadoPCO2");

  if (!Number.isFinite(pco2Act) || !Number.isFinite(pco2Des)) {
    resultado.innerText = "Ingrese PCO₂ válida";
    return;
  }

  const factor = pco2Act / pco2Des;
  resultado.innerHTML = `Factor de ajuste: <b>${factor.toFixed(2)}</b>`;

  trackEvent("calculate_pco2_adjustment", {
    pco2_actual: pco2Act,
    pco2_target: pco2Des,
  });
}

/* =========================
   ECOCARDIOGRAFÍA
========================= */
function calcularGCEco() {
  const dtsvi = num("dtsvi");
  const vti = num("vti");
  const fc = num("fc");
  const resultado = document.getElementById("resultadoGCEco");

  if (anyNaN([dtsvi, vti, fc])) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  const csa = Math.PI * Math.pow(dtsvi / 2, 2);
  const vs = csa * vti;
  const gc = (vs * fc) / 1000;

  resultado.innerHTML = `<b>Gasto cardíaco:</b> ${gc.toFixed(2)} L/min`;

  trackEvent("calculate_cardiac_output_echo", {
    cardiac_output: gc,
  });
}

/* =========================
   OXIGENACIÓN
========================= */
function calcularOxigenacion() {
  const gc = num("gc");
  const hb = num("hb");
  const sao2 = num("sao2");
  const svo2 = num("svo2");
  const pao2 = num("pao2");
  const pvo2 = num("pvo2");
  const resultado = document.getElementById("resultadoOxigenacion");

  if (anyNaN([gc, hb, sao2, svo2, pao2, pvo2])) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  const CaO2 = (1.34 * hb * sao2 / 100) + (0.003 * pao2);
  const CvO2 = (1.34 * hb * svo2 / 100) + (0.003 * pvo2);
  const deltaO2 = CaO2 - CvO2;
  const DO2 = gc * CaO2 * 10;
  const VO2 = gc * deltaO2 * 10;
  const REO2 = clampPercent((VO2 / DO2) * 100);

  resultado.innerHTML = `<b>REO₂:</b> ${REO2.toFixed(1)} %`;

  trackEvent("calculate_oxygen_delivery", {
    reo2: REO2,
  });
}

/* =========================
   CO₂
========================= */
function calcularDeltaCO2() {
  const paco2 = num("paco2");
  const pvco2 = num("pvco2");
  const resultado = document.getElementById("resultadoCO2");

  if (anyNaN([paco2, pvco2])) {
    resultado.innerText = "Complete PaCO₂ y PvCO₂";
    return;
  }

  const deltaCO2 = pvco2 - paco2;
  resultado.innerHTML = `<b>ΔCO₂:</b> ${deltaCO2.toFixed(1)} mmHg`;

  trackEvent("calculate_delta_co2", {
    delta_co2: deltaCO2,
  });
}

/* =========================
   ELECTROLITOS
========================= */
function calcularSodioCorregido() {
  const nas = num("nas");
  const glucs = num("glucs");
  const resultado = document.getElementById("resultadoNaCorregido");

  if (anyNaN([nas, glucs])) {
    resultado.innerText = "Complete los campos";
    return;
  }

  const nac = nas + (1.6 * ((glucs - 100) / 100));
  resultado.innerHTML = `<b>Na corregido:</b> ${nac.toFixed(1)} mEq/L`;

  trackEvent("calculate_corrected_sodium", {
    sodium_corrected: nac,
  });
}

function calcularCalcioCorregido() {
  const cas = num("cas");
  const albs = num("albs");
  const resultado = document.getElementById("resultadoCaCorregido");

  if (anyNaN([cas, albs])) {
    resultado.innerText = "Complete los campos";
    return;
  }

  const cac = cas + (0.8 * (4 - albs));
  resultado.innerHTML = `<b>Ca corregido:</b> ${cac.toFixed(2)}`;

  trackEvent("calculate_corrected_calcium", {
    calcium_corrected: cac,
  });
}

/* =========================
   SOFA-2
========================= */
function calcularSOFA2() {
  const ids = [
    "sofa_neuro",
    "sofa_resp",
    "sofa_cv",
    "sofa_higado",
    "sofa_rinon",
    "sofa_coag",
  ];

  let total = 0;
  for (const id of ids) {
    const v = parseInt(document.getElementById(id)?.value, 10);
    if (!Number.isFinite(v)) {
      document.getElementById("resultadoSOFA2").innerText =
        "Seleccione todas las variables";
      return;
    }
    total += v;
  }

  document.getElementById("resultadoSOFA2").innerHTML =
    `<b>SOFA-2 total:</b> ${total} / 24`;

  trackEvent("calculate_sofa_score", {
    sofa_score: total,
  });
}
