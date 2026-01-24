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
 * Lee un input / select / checkbox por id o elemento
 * y devuelve Number o NaN
 */
function num(target) {
  const el =
    typeof target === "string"
      ? document.getElementById(target)
      : target;

  if (!el) return NaN;

  let raw;

  // Checkbox → 1 / 0
  if (el.type === "checkbox") {
    return el.checked ? 1 : 0;
  }

  // Radio → solo si está seleccionado
  if (el.type === "radio") {
    return el.checked ? Number(el.value) : NaN;
  }

  // Select / Input normal
  if ("value" in el) {
    raw = el.value;
  } else {
    return NaN;
  }

  if (raw == null || raw === "") return NaN;

  const value = parseFloat(
    String(raw).trim().replace(",", ".")
  );

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
  if (!el) return;
  el.innerHTML = html;
}

function setText(id, text = "") {
  const el = document.getElementById(id);
  if (!el) return;

  // Si el nodo tiene HTML interno, usar textContent evita conflictos
  el.textContent = text ?? "";
}

function clear(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "";
}


/* =========================
   VENTILACIÓN MECÁNICA
========================= */
function calcularPesoIdeal() {
  const talla = num("talla");
  const sexoEl = document.getElementById("sexo");
  const resultado = document.getElementById("resultadoPeso");

  if (!resultado) return;

  if (!Number.isFinite(talla) || talla <= 0) {
    resultado.textContent = "Ingrese una talla válida";
    return;
  }

  if (!sexoEl || !sexoEl.value) {
    resultado.textContent = "Seleccione el sexo";
    return;
  }

  const sexo = sexoEl.value;
  let pesoIdeal;

  if (sexo === "hombre") {
    pesoIdeal = 50 + 0.91 * (talla - 152.4);
  } else if (sexo === "mujer") {
    pesoIdeal = 45 + 0.91 * (talla - 152.4);
  } else {
    resultado.textContent = "Seleccione el sexo";
    return;
  }

  if (!Number.isFinite(pesoIdeal)) {
    resultado.textContent = "No se pudo calcular el peso ideal";
    return;
  }

  const vt6 = pesoIdeal * 6;
  const vt7 = pesoIdeal * 7;
  const vt8 = pesoIdeal * 8;

  resultado.innerHTML = `
    <strong>Peso ideal:</strong> ${pesoIdeal.toFixed(1)} kg
    <hr>
    <strong>Volumen corriente sugerido</strong><br>
    • 6 ml/kg: <strong>${vt6.toFixed(0)} mL</strong><br>
    • 7 ml/kg: <strong>${vt7.toFixed(0)} mL</strong><br>
    • 8 ml/kg: <strong>${vt8.toFixed(0)} mL</strong>
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
  const vtAct = num("vt_actual");
  const vminAct = num("vmin_actual");

  const resultado = document.getElementById("resultadoPCO2");
  const detalle = document.getElementById("resultadoPCO2Detalle");

  if (!resultado) return;

  if (!Number.isFinite(pco2Act) || !Number.isFinite(pco2Des) || pco2Des <= 0) {
    resultado.textContent = "Ingrese PCO₂ válida";
    if (detalle) detalle.textContent = "";
    return;
  }

  const tieneFRyVT =
    Number.isFinite(frAct) && frAct > 0 &&
    Number.isFinite(vtAct) && vtAct > 0;

  const tieneVMin = Number.isFinite(vminAct) && vminAct > 0;

  if (!tieneFRyVT && !tieneVMin) {
    resultado.textContent =
      "Ingrese FR y VT actuales o Volumen minuto actual";
    if (detalle) detalle.textContent = "";
    return;
  }

  const vminActual = tieneVMin
    ? vminAct
    : (frAct * vtAct) / 1000;

  if (!Number.isFinite(vminActual) || vminActual <= 0) {
    resultado.textContent = "No se pudo calcular el volumen minuto actual";
    if (detalle) detalle.textContent = "";
    return;
  }

  const factor = pco2Act / pco2Des;

  if (!Number.isFinite(factor) || factor <= 0) {
    resultado.textContent = "No se pudo calcular el factor de ajuste";
    if (detalle) detalle.textContent = "";
    return;
  }

  const vminObj = vminActual * factor;

  if (!Number.isFinite(vminObj) || vminObj <= 0) {
    resultado.textContent = "No se pudo calcular el volumen minuto objetivo";
    if (detalle) detalle.textContent = "";
    return;
  }

  const frObj =
    Number.isFinite(frAct) && frAct > 0 ? frAct * factor : NaN;

  const vtObj =
    Number.isFinite(vtAct) && vtAct > 0 ? vtAct * factor : NaN;

  resultado.innerHTML = `<strong>Ajustes sugeridos</strong>`;

  if (detalle) {
    detalle.innerHTML = [
      `<strong>VMIN objetivo:</strong> ${vminObj.toFixed(2)} L/min`,
      Number.isFinite(frObj)
        ? `<strong>FR objetivo (manteniendo VT):</strong> ${frObj.toFixed(0)} rpm`
        : `<strong>FR objetivo (manteniendo VT):</strong> Ingrese FR actual`,
      Number.isFinite(vtObj)
        ? `<strong>VT objetivo (manteniendo FR):</strong> ${vtObj.toFixed(0)} mL`
        : `<strong>VT objetivo (manteniendo FR):</strong> Ingrese VT actual`,
    ].join("<br>");
  }

  trackEvent("calculate_pco2_adjustment", {
    pco2_actual: pco2Act,
    pco2_target: pco2Des,
    factor: Number(factor.toFixed(3)),
    vmin_actual: vminActual,
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
    resultado.textContent = "Complete todos los campos con valores válidos";
    if (interp) interp.textContent = "";
    return;
  }

  const csa = Math.PI * Math.pow(dtsvi / 2, 2);
  const vs = csa * vti;
  const gc = (vs * fc) / 1000;

  if (!Number.isFinite(gc) || gc <= 0) {
    resultado.textContent = "No se pudo calcular el gasto cardíaco";
    if (interp) interp.textContent = "";
    return;
  }

  resultado.innerHTML = `<strong>Gasto cardíaco:</strong> ${gc.toFixed(2)} L/min`;

  if (interp) {
    interp.innerHTML = `
      ${
        vti >= 18 && vti <= 22
          ? "VTI 18–22 cm: <strong>normal</strong>."
          : vti < 15
          ? "VTI < 15 cm: <strong>alerta</strong> (bajo gasto)."
          : "VTI intermedio: interpretar en contexto clínico."
      }
      <br>
      <strong>Respuesta a fluidos:</strong> cambio de VTI &gt; 15%.
    `;
  }

  trackEvent("calculate_cardiac_output_echo", {
    cardiac_output_l_min: Number(gc.toFixed(2)),
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

  if (anyNaN([gc, hb, sao2, svo2, pao2, pvo2])) {
    resultado.textContent =
      "Complete GC, Hb, SaO₂, SvO₂, PaO₂ y PvO₂";
    if (detalle) detalle.textContent = "";
    return;
  }

  if (
    gc <= 0 ||
    hb <= 0 ||
    sao2 <= 0 || sao2 > 100 ||
    svo2 < 0 || svo2 > 100 ||
    pao2 <= 0 ||
    pvo2 <= 0
  ) {
    resultado.textContent = "Ingrese valores fisiológicamente válidos";
    if (detalle) detalle.textContent = "";
    return;
  }

  const CaO2_dL = (hb * (sao2 / 100) * 1.34) + (pao2 * 0.003);
  const CvO2_dL = (hb * (svo2 / 100) * 1.34) + (pvo2 * 0.003);

  const CaO2 = CaO2_dL * 10;
  const CvO2 = CvO2_dL * 10;

  const DO2 = gc * CaO2;
  const VO2 = gc * (CaO2 - CvO2);

  const REO2 = clampPercent(
    ((CaO2_dL - CvO2_dL) / CaO2_dL) * 100
  );

  resultado.innerHTML = `<strong>REO₂:</strong> ${REO2.toFixed(1)} %`;

  if (detalle) {
    detalle.innerHTML = `
      <strong>CaO₂:</strong> ${CaO2_dL.toFixed(2)} mL/dL<br>
      <strong>CvO₂:</strong> ${CvO2_dL.toFixed(2)} mL/dL<br>
      <strong>DO₂:</strong> ${DO2.toFixed(0)} mL/min<br>
      <strong>VO₂:</strong> ${VO2.toFixed(0)} mL/min
    `;
  }

  trackEvent("calculate_oxygen_delivery", {
    reo2_pct: Number(REO2.toFixed(1)),
  });
}



/* =========================
   CO₂
========================= */
function calcularDeltaCO2() {
  const paco2 = num("paco2"); // mmHg
  const pvco2 = num("pvco2"); // mmHg
  const resultado = document.getElementById("resultadoCO2");

  if (!resultado) return;

  // Validación básica
  if (
    anyNaN([paco2, pvco2]) ||
    paco2 <= 0 ||
    pvco2 <= 0
  ) {
    resultado.textContent = "Complete PaCO₂ y PvCO₂ con valores válidos";
    return;
  }

  const deltaCO2 = pvco2 - paco2;

  if (!Number.isFinite(deltaCO2)) {
    resultado.textContent = "No se pudo calcular ΔCO₂";
    return;
  }

  resultado.innerHTML = `<strong>ΔCO₂:</strong> ${deltaCO2.toFixed(1)} mmHg`;

  trackEvent("calculate_delta_co2", {
    delta_co2_mmhg: Number(deltaCO2.toFixed(1)),
    paco2_mmhg: paco2,
    pvco2_mmhg: pvco2,
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
  const tam = num("tam");       // mmHg
  const pvc = num("pvc");       // mmHg
  const gc = num("gc_rvs");     // L/min
  const outId = "resultadoRVS";

  // Validaciones básicas
  if (
    anyNaN([tam, pvc, gc]) ||
    gc <= 0
  ) {
    setText(outId, "Complete TAM, PVC y GC con valores válidos");
    return;
  }

  const rvs = ((tam - pvc) / gc) * 80;

  if (!Number.isFinite(rvs)) {
    setText(outId, "No se pudo calcular la RVS");
    return;
  }

  setHTML(outId, `<strong>RVS:</strong> ${rvs.toFixed(0)} dyn·s·cm⁻⁵`);

  trackEvent("calculate_svr", {
    map_mmhg: tam,
    cvp_mmhg: pvc,
    cardiac_output_l_min: gc,
    svr_dyn_s_cm5: Number(rvs.toFixed(0)),
  });
}

/*
  PPR (Presión de perfusión abdominal) = TAM - PIA
*/
function calcularPPR() {
  const tam = num("tam"); // mmHg
  const pia = num("pia"); // mmHg
  const outId = "resultadoPPR";

  if (anyNaN([tam, pia])) {
    setText(outId, "Complete TAM y PIA con valores válidos");
    return;
  }

  const ppr = tam - pia;

  if (!Number.isFinite(ppr)) {
    setText(outId, "No se pudo calcular la PPR");
    return;
  }

  setHTML(outId, `<strong>PPR:</strong> ${ppr.toFixed(0)} mmHg`);

  trackEvent("calculate_app", {
    map_mmhg: tam,
    iap_mmhg: pia,
    app_mmhg: Number(ppr.toFixed(0)),
  });
}

/*
  PPC (Presión de perfusión cerebral) = TAM - PIC
*/
function calcularPPC() {
  const tam = num("tam"); // mmHg
  const pic = num("pic"); // mmHg
  const outId = "resultadoPPC";

  if (anyNaN([tam, pic])) {
    setText(outId, "Complete TAM y PIC con valores válidos");
    return;
  }

  const ppc = tam - pic;

  if (!Number.isFinite(ppc)) {
    setText(outId, "No se pudo calcular la PPC");
    return;
  }

  setHTML(outId, `<strong>PPC:</strong> ${ppc.toFixed(0)} mmHg`);

  trackEvent("calculate_cpp", {
    map_mmhg: tam,

/* =========================
   ESTADO ÁCIDO-BASE
========================= */
/*
  Anion Gap (AG) = Na + K - Cl - HCO3
  Corrección por albúmina (si ALB en g/dL):
  AG corregido = AG + 2.5 × (4 - ALB)
*/
function calcularAnionGapCorregido() {
  const na = num("na");        // mEq/L
  const k = num("k");          // mEq/L
  const cl = num("cl");        // mEq/L
  const hco3 = num("hco3_ag"); // mEq/L
  let alb = num("alb");        // g/dL (opcional)

  const outId = "resultadoAnionGap";

  // Validación electrolitos obligatorios
  if (
    anyNaN([na, k, cl, hco3]) ||
    na <= 0 ||
    cl <= 0 ||
    hco3 <= 0
  ) {
    setText(outId, "Complete Na, K, Cl y HCO₃ con valores válidos");
    return;
  }

  // Si albúmina no fue ingresada, asumir normal (4 g/dL)
  if (!Number.isFinite(alb) || alb <= 0) {
    alb = 4;
  }

  const ag = (na + k) - (cl + hco3);

  if (!Number.isFinite(ag)) {
    setText(outId, "No se pudo calcular el anion gap");
    return;
  }

  const agCorr = ag + 2.5 * (4 - alb);

  if (!Number.isFinite(agCorr)) {
    setText(outId, "No se pudo calcular el anion gap corregido");
    return;
  }

  setHTML(
    outId,
    `<strong>AG:</strong> ${ag.toFixed(1)} mEq/L<br>
     <strong>AG corregido (ALB):</strong> ${agCorr.toFixed(1)} mEq/L`
  );

  trackEvent("calculate_corrected_anion_gap", {
    ag_meq_l: Number(ag.toFixed(1)),
    ag_corrected_meq_l: Number(agCorr.toFixed(1)),
    albumin_g_dl: alb,
  });
}

/* =========================
   DELTA / DELTA (ANION GAP / BICARBONATO)
========================= */
function calcularDeltaGap() {
  const agPaciente = num("agapp");   // mEq/L
  const hco3Paciente = num("bicap"); // mEq/L

  const AG_NORMAL = 12;
  const HCO3_NORMAL = 24;

  const outId = "resultadoDeltaGap";
  const interpId = "interpretacionDeltaGap";

  // Validación básica
  if (
    !Number.isFinite(agPaciente) ||
    !Number.isFinite(hco3Paciente)
  ) {
    setHTML(outId, "<strong>Δ/Δ:</strong> —");
    setHTML(
      interpId,
      "Complete <strong>Anion Gap</strong> y <strong>Bicarbonato</strong> del paciente."
    );
    return;
  }

  // Validación clínica mínima
  if (agPaciente <= 0 || hco3Paciente <= 0) {
    setHTML(outId, "<strong>Δ/Δ:</strong> No interpretable");
    setHTML(
      interpId,
      "Los valores ingresados no son fisiológicamente válidos."
    );
    return;
  }

  const deltaBicarb = HCO3_NORMAL - hco3Paciente;

  // Bicarbonato no disminuido → Δ/Δ no válido
  if (deltaBicarb <= 0) {
    setHTML(outId, "<strong>Δ/Δ:</strong> No interpretable");
    setHTML(
      interpId,
      "El <strong>bicarbonato no está disminuido</strong> (HCO₃ ≥ 24). " +
      "El cálculo de <strong>Δ/Δ</strong> no es válido en este contexto."
    );
    return;
  }

  const deltaDelta = (agPaciente - AG_NORMAL) / deltaBicarb;

  if (!Number.isFinite(deltaDelta)) {
    setHTML(outId, "<strong>Δ/Δ:</strong> —");
    setHTML(
      interpId,
      "No se pudo calcular el índice Δ/Δ con los valores ingresados."
    );
    return;
  }

  setHTML(outId, `<strong>Δ/Δ:</strong> ${deltaDelta.toFixed(2)}`);

  let texto = "";
  if (deltaDelta < 1) {
    texto =
      "Sugiere <strong>disminución previa del bicarbonato</strong>: posible " +
      "<strong>acidosis metabólica hiperclorémica</strong> o " +
      "<strong>alcalosis respiratoria crónica</strong> asociada.";
  } else if (deltaDelta <= 2) {
    texto =
      "<strong>Acidosis metabólica con anion gap aumentado PURA</strong>.";
  } else {
    texto =
      "Sugiere <strong>aumento previo del bicarbonato</strong>: posible " +
      "<strong>alcalosis metabólica</strong> o " +
      "<strong>acidosis respiratoria crónica</strong> asociada.";
  }

  setHTML(interpId, texto);

  trackEvent("calculate_delta_delta", {
    delta_delta: Number(deltaDelta.toFixed(2)),
    ag_paciente_meq_l: agPaciente,
    hco3_paciente_meq_l: hco3Paciente,
  });
}


/* =========================
   ELECTROLITOS
========================= */
function calcularSodioCorregido() {
  const nas = num("nas");     // mEq/L
  const glucs = num("glucs"); // mg/dL
  const outId = "resultadoNaCorregido";

  // Validación básica
  if (
    !Number.isFinite(nas) ||
    nas <= 0 ||
    !Number.isFinite(glucs)
  ) {
    setText(outId, "Complete sodio y glucosa con valores válidos");
    return;
  }

  // Si glucosa ≤ 100, no hay corrección
  const factorGlucosa =
    glucs > 100 ? (1.6 * ((glucs - 100) / 100)) : 0;

  const nac = nas + factorGlucosa;

  if (!Number.isFinite(nac)) {
    setText(outId, "No se pudo calcular el sodio corregido");
    return;
  }

  setHTML(
    outId,
    `<strong>Na corregido:</strong> ${nac.toFixed(1)} mEq/L`
  );

  trackEvent("calculate_corrected_sodium", {
    sodium_meq_l: nas,
    glucose_mg_dl: glucs,
    sodium_corrected_meq_l: Number(nac.toFixed(1)),
  });
}

function calcularCalcioCorregido() {
  const cas = num("cas");   // mg/dL
  let albs = num("albs");   // g/dL (opcional)
  const outId = "resultadoCaCorregido";

  // Validación calcio
  if (!Number.isFinite(cas) || cas <= 0) {
    setText(outId, "Complete calcio con un valor válido");
    return;
  }

  // Albúmina opcional: asumir normal si no se ingresa
  if (!Number.isFinite(albs) || albs <= 0) {
    albs = 4;
  }

  const cac = cas + (0.8 * (4 - albs));

  if (!Number.isFinite(cac)) {
    setText(outId, "No se pudo calcular el calcio corregido");
    return;
  }

  setHTML(
    outId,
    `<strong>Ca corregido:</strong> ${cac.toFixed(2)} mg/dL`
  );

  trackEvent("calculate_corrected_calcium", {
    calcium_mg_dl: cas,
    albumin_g_dl: albs,
    calcium_corrected_mg_dl: Number(cac.toFixed(2)),
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

    if (
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      score >= min &&
      score <= max
    ) {
      li.classList.add("active-range");
    }
  });
}

function limpiarRangoSOFA() {
  const list = document.getElementById("sofaMortalityList");
  if (!list) return;
  list.querySelectorAll("li").forEach(li =>
    li.classList.remove("active-range")
  );
}

function calcularSOFA2() {
  const ids = [
    "sofa_neuro",
    "sofa_resp",
    "sofa_cv",
    "sofa_hep",
    "sofa_renal",
    "sofa_coag",
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);

    // Elemento inexistente
    if (!el) {
      setHTML(
        "resultadoSOFA2",
        "<strong>SOFA-2:</strong> Error de configuración (campo faltante)"
      );
      limpiarRangoSOFA();
      return;
    }

    const value = Number(el.value);

    // Valor no seleccionado o fuera de rango SOFA (0–4)
    if (!Number.isFinite(value) || value < 0 || value > 4) {
      setHTML(
        "resultadoSOFA2",
        "<strong>SOFA-2:</strong> Seleccione todas las variables"
      );
      limpiarRangoSOFA();
      return;
    }

    total += value;
  }

  // Buscar rango de mortalidad
  let mortalidadTxt = "";
  const list = document.getElementById("sofaMortalityList");

  if (list) {
    const match = Array.from(list.querySelectorAll("li")).find(li => {
      const min = Number(li.dataset.min);
      const max = Number(li.dataset.max);
      return (
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        total >= min &&
        total <= max
      );
    });

    if (match) {
      const text = match.textContent.trim();
      const idx = text.indexOf(":");
      mortalidadTxt = idx !== -1
        ? text.slice(idx + 1).trim()
        : text;
    }
  }

  const interpretacion = mortalidadTxt
    ? `<br><strong>Mortalidad estimada:</strong> ${mortalidadTxt}`
    : "";

  setHTML(
    "resultadoSOFA2",
    `<strong>SOFA-2 total:</strong> ${total} / 24${interpretacion}`
  );

  // Resaltar rango
  resaltarRangoSOFA(total);

  // Mostrar reporte solo tras cálculo válido
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
      res.innerHTML = "✅ <strong>CAM-ICU POSITIVO</strong> · Delirium presente";
      res.style.color = "#b91c1c";
      intp.innerHTML =
        "Criterios cumplidos: <strong>inicio agudo/fluctuante</strong> + <strong>inatención</strong> + " +
        "(<strong>pensamiento desorganizado</strong> o <strong>alteración del nivel de conciencia</strong>).";
    } else {
      res.innerHTML = "❌ <strong>CAM-ICU NEGATIVO</strong> · Delirium no detectado";
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
    if (n <= 2) hide("camicu_paso2");
    if (n <= 3) hide("camicu_paso3");
    if (n <= 4) hide("camicu_paso4");
    clearResult();

    if (n <= 2 && $("camicu_c2")) $("camicu_c2").value = "";
    if (n <= 3 && $("camicu_c3")) $("camicu_c3").value = "";
    if (n <= 4 && $("camicu_c4")) $("camicu_c4").value = "";
  }

  function paso1() {
    resetFromPaso(2);
    const v = $("camicu_c1")?.value;
    if (v === "1") show("camicu_paso2");
    else if (v === "0") setResult(false);
  }

  function paso2() {
    resetFromPaso(3);
    const v = $("camicu_c2")?.value;
    if (v === "1") show("camicu_paso3");
    else if (v === "0") setResult(false);
  }

  function paso3() {
    resetFromPaso(4);
    const v = $("camicu_c3")?.value;
    if (v === "1") setResult(true);
    else if (v === "0") show("camicu_paso4");
  }

  function paso4() {
    clearResult();
    const v = $("camicu_c4")?.value;
    if (v === "1") setResult(true);
    else if (v === "0") setResult(false);
  }

  function initCAMICU() {
    // Si el bloque CAM-ICU no existe, salir
    if (!$("camicu") || !$("camicu_c1")) return;

    hide("camicu_paso2");
    hide("camicu_paso3");
    hide("camicu_paso4");
    clearResult();

    $("camicu_c1")?.addEventListener("change", paso1);
    $("camicu_c2")?.addEventListener("change", paso2);
    $("camicu_c3")?.addEventListener("change", paso3);
    $("camicu_c4")?.addEventListener("change", paso4);
  }

  // 🔥 CLAVE: inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCAMICU);
  } else {
    initCAMICU();
  }
})();


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

    // Campo inexistente
    if (!el) {
      setHTML(
        "resultadoNIHSS",
        "<strong>NIHSS:</strong> Error de configuración (campo faltante)"
      );
      setHTML("interpretacionNIHSS", "");
      return;
    }

    const v = Number(el.value);

    // No seleccionado o valor inválido
    if (!Number.isFinite(v) || v < 0) {
      setHTML(
        "resultadoNIHSS",
        "<strong>NIHSS:</strong> Complete todos los ítems"
      );
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
    `<strong>NIHSS total:</strong> ${total}`
  );
  setHTML(
    "interpretacionNIHSS",
    `<strong>Interpretación:</strong> ${interpretacion}`
  );

  trackEvent("calculate_nihss_score", {
    nihss_score: total,
  });
}

/* =========================
   EVENT BINDING CENTRAL (FINAL FIX)
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

  function handleClick(event) {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;

    // 🔥 CLAVE: evita submit/reload si está dentro de un <form>
    event.preventDefault();

    // Si el botón está deshabilitado, no ejecutar
    if (btn.disabled) return;

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
  }

  // Asegura binding incluso si el script carga en <head>
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.addEventListener("click", handleClick);
    });
  } else {
    document.addEventListener("click", handleClick);
  }
})();

/* =========================
   ROUTING SIMPLE POR URL
========================= */

// Helpers primero (evita problemas de orden)
function showSection(module) {
  const sec = document.querySelector(`section[data-module="${module}"]`);
  if (sec) sec.style.display = "block";
}

function showAllSections() {
  document.querySelectorAll("section[data-module]").forEach(sec => {
    sec.style.display = "block";
  });
}

  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.setAttribute("content", description);
}

function getRoute() {
  // Normaliza path sin trailing slash y sin subdirectorios
  const path = location.pathname.replace(/\/$/, "");
  const parts = path.split("/");
  return parts.length > 1 ? `/${parts.pop()}` : "/";
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
      });
      break;

    case "/nihss-score":
      showSection("nihss");
      });
      break;

    case "/cam-icu":
      showSection("camicu");
      });
      break;

    case "/ecocardiografia-gc":
      showSection("eco");
      });
      break;

    default:
      // Home / Hub o ruta desconocida
      showAllSections();
      });
      break;
  }
}

// Inicializar routing cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRoute);
} else {
  initRoute();
}

// Ocultar publicidad si está en modo standalone (PWA)
if (window.matchMedia("(display-mode: standalone)").matches) {
  document.querySelectorAll(".ad-slot").forEach(el => {
    el.style.display = "none";
  });
}

