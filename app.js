/* =========================
   ANALYTICS HELPER (GA4)
========================= */
const ANALYTICS_CATEGORY = "clinical_calculator";

function trackEvent(name, params = {}) {
  if (typeof gtag !== "function" || !name) return;

  try {
    gtag("event", name, {
      event_category: ANALYTICS_CATEGORY,
      ...params,
    });
  } catch (_) {
    // Nunca interrumpir la app clínica
  }
}

/* =========================
   INPUT HELPERS
========================= */

/**
 * Lee un input por id o elemento y devuelve Number o NaN
 */
function num(target) {
  const el =
    typeof target === "string"
      ? document.getElementById(target)
      : target;

  if (!el || el.value == null) return NaN;

  const raw = String(el.value).trim().replace(",", ".");
  const value = parseFloat(raw);

  return Number.isFinite(value) ? value : NaN;
}

/**
 * Devuelve true si algún valor no es numérico válido
 */
function anyNaN(values = []) {
  return values.some(v => !Number.isFinite(v));
}

/**
 * Limita un porcentaje entre 0 y 100
 */
function clampPercent(value) {
  if (!Number.isFinite(value)) return NaN;
  return Math.min(100, Math.max(0, value));
}

/* =========================
   DOM HELPERS (seguros)
========================= */
function setHTML(id, html = "") {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setText(id, text = "") {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function clear(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = "";
}


/* =========================
   VENTILACIÓN MECÁNICA
========================= */
function calcularPesoIdeal() {
  const talla = num("talla");
  const sexo = document.getElementById("sexo")?.value;
  const resultado = document.getElementById("resultadoPeso");

  if (!resultado) return;

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

  const frAct = num("fr_actual");
  const vtAct = num("vt_actual");          // mL
  const vminActInput = num("vmin_actual"); // L/min

  const resultado = document.getElementById("resultadoPCO2");
  const detalle = document.getElementById("resultadoPCO2Detalle");

  if (!resultado) return;

  // Validación básica de PCO2
  if (!Number.isFinite(pco2Act) || !Number.isFinite(pco2Des) || pco2Des === 0) {
    resultado.innerText = "Ingrese PCO₂ válida";
    if (detalle) detalle.innerText = "";
    return;
  }

  // Relación: PaCO2 ~ 1 / Ventilación alveolar (aprox.)
  // VMIN objetivo = VMIN actual * (PaCO2 actual / PaCO2 deseada)
  const factor = pco2Act / pco2Des;

  // Elegir VMIN actual: si el usuario lo cargó, usarlo; si no, derivarlo de FR*VT
  let vminAct = vminActInput;
  const vminCalc = (Number.isFinite(frAct) && Number.isFinite(vtAct))
    ? (frAct * vtAct) / 1000
    : NaN;

  if (!Number.isFinite(vminAct) || vminAct <= 0) {
    vminAct = vminCalc;
  }

  if (!Number.isFinite(vminAct) || vminAct <= 0) {
    resultado.innerText = "Complete FR y VT, o ingrese VMIN";
    if (detalle) detalle.innerText = "";
    return;
  }

  const vminObj = vminAct * factor;

  // Sugerencias para ajustar manteniendo constantes:
  // 1) Ajustar FR manteniendo VT
  const frObj = (Number.isFinite(frAct) && frAct > 0)
    ? frAct * factor
    : NaN;

  // 2) Ajustar VT manteniendo FR
  const vtObj = (Number.isFinite(vtAct) && vtAct > 0)
    ? vtAct * factor
    : NaN;

  // Mostrar solo las 3 modificaciones posibles (sin mostrar el factor)
  resultado.innerHTML = `<b>Ajustes sugeridos</b>`;

  if (detalle) {
    const parts = [];

    if (Number.isFinite(frObj)) {
      parts.push(`<b>FR objetivo (manteniendo VT):</b> ${frObj.toFixed(0)} rpm`);
    } else {
      parts.push(`<b>FR objetivo (manteniendo VT):</b> Ingrese FR actual`);
    }

    if (Number.isFinite(vtObj)) {
      parts.push(`<b>VT objetivo (manteniendo FR):</b> ${vtObj.toFixed(0)} mL`);
    } else {
      parts.push(`<b>VT objetivo (manteniendo FR):</b> Ingrese VT actual`);
    }

    parts.push(`<b>VMIN objetivo:</b> ${vminObj.toFixed(2)} L/min`);

    detalle.innerHTML = parts.join("<br>");
  }

  trackEvent("calculate_pco2_adjustment", {
    pco2_actual: pco2Act,
    pco2_target: pco2Des,
    factor: factor,
    vmin_actual: vminAct,
    vmin_target: vminObj,
    fr_actual: frAct,
    fr_target: frObj,
    vt_actual_ml: vtAct,
    vt_target_ml: vtObj,
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
  const interp = document.getElementById("interpretacionGCEco");

  if (!resultado) return;

  if (anyNaN([dtsvi, vti, fc]) || dtsvi <= 0 || vti <= 0 || fc <= 0) {
    resultado.innerText = "Complete todos los campos";
    if (interp) interp.innerText = "";
    return;
  }

  // dtsvi en cm, VTI en cm
  const csa = Math.PI * Math.pow(dtsvi / 2, 2); // cm^2
  const vs = csa * vti;                         // cm^3 (mL)
  const gc = (vs * fc) / 1000;                  // L/min

  resultado.innerHTML = `<b>Gasto cardíaco:</b> ${gc.toFixed(2)} L/min`;

  if (interp) {
    let estadoVTI = "";
    if (vti >= 18 && vti <= 22) estadoVTI = "VTI 18–22 cm: <b>normal</b>.";
    else if (vti < 15) estadoVTI = "VTI < 15 cm: <b>alerta</b> (hipoperfusión / bajo gasto).";
    else estadoVTI = "Interpretar VTI en contexto clínico.";

    interp.innerHTML = `
      ${estadoVTI}<br>
      <b>Respuesta a fluidos:</b> se sugiere si el <b>cambio</b> del VTI en una reevaluación es <b>&gt; 15%</b>.
    `;
  }

  trackEvent("calculate_cardiac_output_echo", {
    cardiac_output: gc,
    dtsvi_cm: dtsvi,
    vti_cm: vti,
    hr: fc,
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
  const detalle = document.getElementById("resultadoOxigenacionDetalle");

  if (!resultado) return;

  if (anyNaN([gc, hb, sao2, svo2, pao2, pvo2]) || gc <= 0 || hb <= 0 || sao2 <= 0) {
    resultado.innerText = "Complete todos los campos";
    if (detalle) detalle.innerText = "";
    return;
  }

  // Contenido arterial y venoso (mL O2/dL)
  const CaO2_dL = (hb * (sao2 / 100) * 1.34) + (pao2 * 0.003);
  const CvO2_dL = (hb * (svo2 / 100) * 1.34) + (pvo2 * 0.003);

  // Para DO2/VO2, convertir a mL O2/L (×10)
  const CaO2 = CaO2_dL * 10;
  const CvO2 = CvO2_dL * 10;

  // DO2 = GC * CaO2 (mL O2/min) | VO2 = GC * (CaO2 - CvO2) (mL O2/min)
  const DO2 = gc * CaO2;
  const VO2 = gc * (CaO2 - CvO2);

  // REO2 = (SaO2 - SvO2) / SaO2
  const REO2 = clampPercent(((sao2 - svo2) / sao2) * 100);

  resultado.innerHTML = `<b>REO₂:</b> ${REO2.toFixed(1)} %`;

  if (detalle) {
    let interpretacion = "";
    if (REO2 >= 15 && REO2 <= 33) {
      interpretacion = "<b>Normal:</b> 15–33% en reposo.";
    } else if (REO2 > 33) {
      interpretacion = "Valores <b>altos</b>: los tejidos están extrayendo más O₂ por <b>bajo suministro</b> (p. ej., gasto cardíaco bajo) o <b>alta demanda</b>.";
    } else if (REO2 < 15) {
      interpretacion = "Valores <b>bajos</b>: extracción reducida; puede ser demanda baja, baja tasa metabólica, problema de utilización tisular o entrega insuficiente que impide una extracción normal.";
    } else {
      interpretacion = "Interpretar en contexto clínico.";
    }

    detalle.innerHTML = `
      <b>CaO₂ (arterial):</b> ${CaO2_dL.toFixed(2)} mL O₂/dL<br>
      <b>CvO₂ (venoso):</b> ${CvO2_dL.toFixed(2)} mL O₂/dL<br>
      <b>DO₂ (entrega):</b> ${DO2.toFixed(0)} mL O₂/min<br>
      <b>VO₂ (consumo):</b> ${VO2.toFixed(0)} mL O₂/min<br>
      ${interpretacion}
    `;
  }

  trackEvent("calculate_oxygen_delivery", {
    cao2: CaO2_dL,
    cvo2: CvO2_dL,
    do2: DO2,
    vo2: VO2,
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

  if (!resultado) return;

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
   PRESIONES / PERFUSIÓN
========================= */
/*
  RVS (SVR) ≈ ((TAM - PVC) / GC) × 80
  - TAM y PVC en mmHg
  - GC en L/min
  - Resultado en dyn·s·cm⁻⁵
*/
function calcularRVS() {
  const tam = num("tam");
  const pvc = num("pvc");
  const gc = num("gc_rvs");
  const outId = "resultadoRVS";

  if (anyNaN([tam, pvc, gc]) || gc <= 0) {
    setText(outId, "Complete TAM, PVC y GC");
    return;
  }

  const rvs = ((tam - pvc) / gc) * 80;

  setHTML(outId, `<b>RVS:</b> ${rvs.toFixed(0)} dyn·s·cm⁻⁵`);

  trackEvent("calculate_svr", {
    map: tam,
    cvp: pvc,
    cardiac_output: gc,
    svr: rvs,
  });
}

/*
  PPR (Presión de perfusión abdominal) = TAM - PIA
*/
function calcularPPR() {
  const tam = num("tam");
  const pia = num("pia");
  const outId = "resultadoPPR";

  if (anyNaN([tam, pia])) {
    setText(outId, "Complete TAM y PIA");
    return;
  }

  const ppr = tam - pia;
  setHTML(outId, `<b>PPR:</b> ${ppr.toFixed(0)} mmHg`);

  trackEvent("calculate_app", {
    map: tam,
    iap: pia,
    app: ppr,
  });
}

/*
  PPC (Presión de perfusión cerebral) = TAM - PIC
*/
function calcularPPC() {
  const tam = num("tam");
  const pic = num("pic");
  const outId = "resultadoPPC";

  if (anyNaN([tam, pic])) {
    setText(outId, "Complete TAM y PIC");
    return;
  }

  const ppc = tam - pic;
  setHTML(outId, `<b>PPC:</b> ${ppc.toFixed(0)} mmHg`);

  trackEvent("calculate_cpp", {
    map: tam,
    icp: pic,
    cpp: ppc,
  });
}

/* =========================
   ESTADO ÁCIDO-BASE
========================= */
/*
  Anion Gap (AG) = Na + K - Cl - HCO3
  Corrección por albúmina (si ALB en g/dL):
  AG corregido = AG + 2.5 × (4 - ALB)
*/
function calcularAnionGapCorregido() {
  const na = num("na");
  const k = num("k");
  const cl = num("cl");
  const hco3 = num("hco3_ag");
  const alb = num("alb");
  const outId = "resultadoAnionGap";

  if (anyNaN([na, k, cl, hco3, alb])) {
    setText(outId, "Complete todos los campos");
    return;
  }

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  setHTML(outId, `<b>AG:</b> ${ag.toFixed(1)} mEq/L<br><b>AG corregido (ALB):</b> ${agCorr.toFixed(1)} mEq/L`);

  trackEvent("calculate_corrected_anion_gap", {
    ag: ag,
    ag_corrected: agCorr,
    albumin: alb,
  });
}

/* =========================
   DELTA / DELTA (ANION GAP / BICARBONATO)
========================= */
function calcularDeltaGap() {
  const agPaciente = num("agapp");
  const hco3Paciente = num("bicap");

  const AG_NORMAL = 12;
  const HCO3_NORMAL = 24;

  const outId = "resultadoDeltaGap";
  const interpId = "interpretacionDeltaGap";

  // Validación básica
  if (!Number.isFinite(agPaciente) || !Number.isFinite(hco3Paciente)) {
    setHTML(outId, "<b>Δ/Δ:</b> —");
    setHTML(
      interpId,
      "Complete <b>Anion Gap</b> y <b>Bicarbonato</b> del paciente."
    );
    return;
  }

  const deltaBicarb = HCO3_NORMAL - hco3Paciente;

  // Validación clínica
  if (deltaBicarb <= 0) {
    setHTML(outId, "<b>Δ/Δ:</b> No interpretable");
    setHTML(
      interpId,
      "El <b>bicarbonato no está disminuido</b> (HCO₃ ≥ 24). " +
      "El cálculo de <b>Δ/Δ</b> no es válido en este contexto."
    );
    return;
  }

  const deltaDelta = (agPaciente - AG_NORMAL) / deltaBicarb;

  setHTML(outId, `<b>Δ/Δ:</b> ${deltaDelta.toFixed(2)}`);

  let texto = "";
  if (deltaDelta < 1) {
    texto =
      "Sugiere <b>disminución previa del bicarbonato</b>: posible " +
      "<b>acidosis metabólica hiperclorémica</b> o " +
      "<b>alcalosis respiratoria crónica</b> asociada.";
  } else if (deltaDelta <= 2) {
    texto = "<b>Acidosis metabólica con anion gap aumentado PURA</b>.";
  } else {
    texto =
      "Sugiere <b>aumento previo del bicarbonato</b>: posible " +
      "<b>alcalosis metabólica</b> o " +
      "<b>acidosis respiratoria crónica</b> asociada.";
  }

  setHTML(interpId, texto);

  trackEvent("calculate_delta_delta", {
    delta_delta: deltaDelta,
    ag_paciente: agPaciente,
    hco3_paciente: hco3Paciente,
  });
}


/* =========================
   ELECTROLITOS
========================= */
function calcularSodioCorregido() {
  const nas = num("nas");
  const glucs = num("glucs");
  const outId = "resultadoNaCorregido";

  if (anyNaN([nas, glucs])) {
    setText(outId, "Complete los campos");
    return;
  }

  const nac = nas + (1.6 * ((glucs - 100) / 100));

  setHTML(
    outId,
    `<b>Na corregido:</b> ${nac.toFixed(1)} mEq/L`
  );

  trackEvent("calculate_corrected_sodium", {
    sodium_corrected: nac,
  });
}

function calcularCalcioCorregido() {
  const cas = num("cas");
  const albs = num("albs");
  const outId = "resultadoCaCorregido";

  if (anyNaN([cas, albs])) {
    setText(outId, "Complete los campos");
    return;
  }

  const cac = cas + (0.8 * (4 - albs));

  setHTML(
    outId,
    `<b>Ca corregido:</b> ${cac.toFixed(2)}`
  );

  trackEvent("calculate_corrected_calcium", {
    calcium_corrected: cac,
  });
}

/* =========================
   SOFA-2
========================= */

/**
 * Resalta el rango de mortalidad correspondiente al score SOFA
 */
function resaltarRangoSOFA(score) {
  const list = document.getElementById("sofaMortalityList");
  if (!list || !Number.isFinite(score)) return;

  list.querySelectorAll("li").forEach(li => {
    li.classList.remove("active-range");

    const min = Number(li.dataset.min);
    const max = Number(li.dataset.max);

    if (Number.isFinite(min) && Number.isFinite(max) && score >= min && score <= max) {
      li.classList.add("active-range");
    }
  });
}

function calcularSOFA2() {
const ids = [
  "sofa_neuro",
  "sofa_resp",
  "sofa_cv",
  "sofa_hep",    // ✔ coincide con HTML
  "sofa_renal", // ✔ coincide con HTML
  "sofa_coag",
];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    const value = parseInt(el?.value, 10);

    if (!Number.isFinite(value)) {
      setHTML(
        "resultadoSOFA2",
        "<b>SOFA-2:</b> Seleccione todas las variables"
      );
      return;
    }

    total += value;
  }

  // Obtener texto de mortalidad según el rango (si existe)
  let mortalidadTxt = "";
  const list = document.getElementById("sofaMortalityList");

  if (list) {
    const match = Array.from(list.querySelectorAll("li")).find(li => {
      const min = Number(li.dataset.min);
      const max = Number(li.dataset.max);
      return Number.isFinite(min) && Number.isFinite(max) && total >= min && total <= max;
    });

    if (match) {
      // Ej: "SOFA-2 4–7: Mortalidad leve–moderada (≈ 5–15%)"
      const text = match.textContent.trim();
      const idx = text.indexOf(":");
      mortalidadTxt = idx !== -1 ? text.slice(idx + 1).trim() : text;
    }
  }

  const interpretacion = mortalidadTxt
    ? `<br><b>Mortalidad estimada:</b> ${mortalidadTxt}`
    : "";

  setHTML(
    "resultadoSOFA2",
    `<b>SOFA-2 total:</b> ${total} / 24${interpretacion}`
  );

  // Resaltar rango correspondiente
  resaltarRangoSOFA(total);

  // Mostrar reporte de mortalidad solo después del cálculo
  const report = document.getElementById("sofaMortalityReport");
  if (report) report.style.display = "block";

  trackEvent("calculate_sofa_score", {
    sofa_score: total,
  });
}


/* =========================
   CAM-ICU · Algoritmo secuencial
========================= */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function hide(id) {
    const el = $(id);
    if (el) el.style.display = "none";
  }

  function show(id) {
    const el = $(id);
    if (el) el.style.display = "block";
  }

  function clearResult() {
    const res = $("resultadoCAMICU");
    const intp = $("interpretacionCAMICU");
    if (res) {
      res.innerHTML = "";
      res.style.color = "";
    }
    if (intp) intp.innerHTML = "";
  }

  function setResult(positivo) {
    const res = $("resultadoCAMICU");
    const intp = $("interpretacionCAMICU");
    if (!res || !intp) return;

    if (positivo) {
      res.innerHTML = "✅ <b>CAM-ICU POSITIVO</b> · Delirium presente";
      res.style.color = "#b91c1c";
      intp.innerHTML =
        "Criterios cumplidos: <b>inicio agudo/fluctuante</b> + <b>inatención</b> + " +
        "(<b>pensamiento desorganizado</b> o <b>alteración del nivel de conciencia</b>).";
    } else {
      res.innerHTML = "❌ <b>CAM-ICU NEGATIVO</b> · Delirium no detectado";
      res.style.color = "#166534";
      intp.innerHTML =
        "No se cumplen los criterios diagnósticos de delirium en esta evaluación.";
    }

    if (typeof trackEvent === "function") {
      try {
        trackEvent("camicu_result", { delirium: !!positivo });
      } catch (_) {}
    }
  }

  function resetFromPaso(n) {
    // Oculta pasos posteriores y limpia resultado
    if (n <= 2) hide("camicu_paso2");
    if (n <= 3) hide("camicu_paso3");
    if (n <= 4) hide("camicu_paso4");
    clearResult();

    // Limpia selects posteriores para evitar estados inconsistentes
    if (n <= 2 && $("camicu_c2")) $("camicu_c2").value = "";
    if (n <= 3 && $("camicu_c3")) $("camicu_c3").value = "";
    if (n <= 4 && $("camicu_c4")) $("camicu_c4").value = "";
  }

  function paso1() {
    resetFromPaso(2);
    const v = $("camicu_c1")?.value;
    if (v === "1") {
      show("camicu_paso2");
    } else if (v === "0") {
      setResult(false);
    }
  }

  function paso2() {
    resetFromPaso(3);
    const v = $("camicu_c2")?.value;
    if (v === "1") {
      show("camicu_paso3");
    } else if (v === "0") {
      setResult(false);
    }
  }

  function paso3() {
    resetFromPaso(4);
    const v = $("camicu_c3")?.value;
    if (v === "1") {
      setResult(true);
    } else if (v === "0") {
      show("camicu_paso4");
    }
  }

  function paso4() {
    clearResult();
    const v = $("camicu_c4")?.value;
    if (v === "1") setResult(true);
    else if (v === "0") setResult(false);
  }

  function initCAMICU() {
    // Si el bloque CAM-ICU no existe en la página, no hace nada
    if (!$("camicu") || !$("camicu_c1")) return;

    // Estado inicial limpio
    hide("camicu_paso2");
    hide("camicu_paso3");
    hide("camicu_paso4");
    clearResult();

    // Listeners
    $("camicu_c1").addEventListener("change", paso1);
    $("camicu_c2").addEventListener("change", paso2);
    $("camicu_c3").addEventListener("change", paso3);
    $("camicu_c4").addEventListener("change", paso4);
  }


/* =========================
   NIHSS
========================= */
function calcularNIHSS() {
  const ids = [
    "nihss_1a",
    "nihss_1b",
    "nihss_1c",
    "nihss_2",
    "nihss_3",
    "nihss_4",
    "nihss_motor",   // brazo y pierna (peor lado)
    "nihss_ataxia",
    "nihss_sens",
    "nihss_lang",
    "nihss_dys",
    "nihss_neglect"
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    const v = parseInt(el?.value, 10);

    if (!Number.isFinite(v)) {
      setHTML("resultadoNIHSS", "<b>NIHSS:</b> Complete todos los ítems");
      setHTML("interpretacionNIHSS", "");
      return;
    }
    total += v;
  }

  let interpretacion = "";
  if (total === 0) interpretacion = "Sin déficit neurológico.";
  else if (total <= 4) interpretacion = "ACV leve.";
  else if (total <= 15) interpretacion = "ACV moderado.";
  else if (total <= 20) interpretacion = "ACV moderado–severo.";
  else interpretacion = "ACV severo.";

  setHTML(
    "resultadoNIHSS",
    `<b>NIHSS total:</b> ${total}`
  );
  setHTML(
    "interpretacionNIHSS",
    `<b>Interpretación:</b> ${interpretacion}`
  );

  trackEvent("calculate_nihss_score", { nihss_score: total });
}


    // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCAMICU);
  } else {
    initCAMICU();
  }

/* =========================
   EVENT BINDING CENTRAL
========================= */
(function initEventBinding() {
  const actionMap = {
    // Ventilación
    "calcular-peso-ideal": calcularPesoIdeal,
    "ajustar-pco2": ajustarPCO2,

    // Ecocardiografía
    "calcular-gc-eco": calcularGCEco,

    // Oxigenación
    "calcular-oxigenacion": calcularOxigenacion,
    "calcular-delta-co2": calcularDeltaCO2,

    // Presiones / Perfusión
    "calcular-rvs": calcularRVS,
    "calcular-ppr": calcularPPR,
    "calcular-ppc": calcularPPC,

    // Ácido–base
    "calcular-anion-gap": calcularAnionGapCorregido,
    "calcular-delta-gap": calcularDeltaGap,

    // Electrolitos
    "calcular-na-corregido": calcularSodioCorregido,
    "calcular-ca-corregido": calcularCalcioCorregido,

    // Scores
    "calcular-sofa": calcularSOFA2,
    "calcular-nihss": calcularNIHSS,
  };

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const fn = actionMap[action];

    if (typeof fn === "function") {
      try {
        fn();
      } catch (err) {
        console.error(`Error ejecutando acción: ${action}`, err);
      }
    } else {
      console.warn(`Acción no registrada: ${action}`);
    }

/* =========================
   ROUTING SIMPLE POR URL
========================= */
function getRoute() {
  return location.pathname.replace(/\/$/, "");
}

function initRoute() {
  const route = getRoute();

  // Ocultar todas las secciones
  document.querySelectorAll("section[data-module]").forEach(sec => {
    sec.style.display = "none";
  });

  switch (route) {
    case "/sofa-2-score":
      showSection("sofa");
      setMeta({
        title: "SOFA-2 Score – Evaluación de disfunción orgánica en UCI",
        description: "Calculadora SOFA-2 para estimar disfunción orgánica y mortalidad en pacientes críticos."
      });
      break;

    case "/nihss-score":
      showSection("nihss");
      setMeta({
        title: "NIHSS Score – Escala de severidad del ACV",
        description: "Calculadora NIHSS para cuantificar el déficit neurológico en el accidente cerebrovascular."
      });
      break;

    case "/cam-icu":
      showSection("camicu");
      setMeta({
        title: "CAM-ICU – Detección de delirium en UCI",
        description: "Evaluación CAM-ICU paso a paso para detección de delirium en pacientes críticos."
      });
      break;

    case "/ecocardiografia-gc":
      showSection("eco");
      setMeta({
        title: "Gasto cardíaco por ecocardiografía (VTI)",
        description: "Cálculo del gasto cardíaco por ecocardiografía utilizando DTSVI y VTI."
      });
      break;

    default:
      // Home / Hub
      showAllSections();
      setMeta({
        title: "Calculadora UCI – Herramientas clínicas para terapia intensiva",
        description: "Calculadoras clínicas para UCI: scores, hemodinamia, ecocardiografía y ventilación."
      });
  }
}

document.addEventListener("DOMContentLoaded", initRoute);

function showSection(module) {
  const sec = document.querySelector(`section[data-module="${module}"]`);
  if (sec) sec.style.display = "block";
}

function showAllSections() {
  document.querySelectorAll("section[data-module]").forEach(sec => {
    sec.style.display = "block";
  });
}

function setMeta({ title, description }) {
  if (title) document.title = title;

  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.setAttribute("content", description);
}

if (window.matchMedia('(display-mode: standalone)').matches) {
  document.querySelectorAll('.ad-slot').forEach(el => {
    el.style.display = 'none';
  });
}

/* =========================
   EVENT BINDING CENTRAL (FIX)
========================= */

document.addEventListener("click", function (e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");

  const actionMap = {
    // Ventilación
    "calcular-peso-ideal": calcularPesoIdeal,
    "ajustar-pco2": ajustarPCO2,

    // Ecocardiografía
    "calcular-gc-eco": calcularGCEco,

    // Oxigenación
    "calcular-oxigenacion": calcularOxigenacion,
    "calcular-delta-co2": calcularDeltaCO2,

    // Presiones / perfusión
    "calcular-rvs": calcularRVS,
    "calcular-ppr": calcularPPR,
    "calcular-ppc": calcularPPC,

    // Ácido–base
    "calcular-anion-gap": calcularAnionGapCorregido,
    "calcular-delta-gap": calcularDeltaGap,

    // Electrolitos
    "calcular-na-corregido": calcularSodioCorregido,
    "calcular-ca-corregido": calcularCalcioCorregido,

    // Scores
    "calcular-sofa": calcularSOFA2,
    "calcular-nihss": calcularNIHSS,
  };

  const fn = actionMap[action];
  if (typeof fn === "function") {
    fn();
  } else {
    console.warn("Acción no reconocida:", action);
  }
});
