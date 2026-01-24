
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
  } catch (_) {}
}

/* =========================
   INPUT HELPERS
========================= */
function num(target) {
  const el =
    typeof target === "string"
      ? document.getElementById(target)
      : target;
  if (!el) return NaN;

  if (el.type === "checkbox") return el.checked ? 1 : 0;
  if (el.type === "radio") return el.checked ? Number(el.value) : NaN;

  if (!("value" in el)) return NaN;
  const raw = el.value;
  if (raw == null || raw === "") return NaN;

  const value = parseFloat(String(raw).trim().replace(",", "."));
  return Number.isFinite(value) ? value : NaN;
}

function anyNaN(values = []) {
  return values.some(v => !Number.isFinite(v));
}

function clampPercent(value) {
  if (!Number.isFinite(value)) return NaN;
  return Math.min(100, Math.max(0, value));
}

/* =========================
   DOM HELPERS
========================= */
function setHTML(id, html = "") {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setText(id, text = "") {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? "";
}
function clear(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = "";
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
  if (sexo === "hombre") pesoIdeal = 50 + 0.91 * (talla - 152.4);
  else if (sexo === "mujer") pesoIdeal = 45 + 0.91 * (talla - 152.4);
  else {
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

  const frAct = num("fr_actual");     // rpm
  const vtAct = num("vt_actual");     // mL
  const vminAct = num("vmin_actual"); // L/min

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
    resultado.textContent = "Ingrese FR y VT actuales o Volumen minuto actual";
    if (detalle) detalle.textContent = "";
    return;
  }

  const vminActual = tieneVMin ? vminAct : (frAct * vtAct) / 1000;
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

  const frObj = Number.isFinite(frAct) && frAct > 0 ? frAct * factor : NaN;
  const vtObj = Number.isFinite(vtAct) && vtAct > 0 ? vtAct * factor : NaN;

  resultado.innerHTML = `<strong>Ajustes sugeridos</strong>`;
  if (detalle) {
    const parts = [];
    parts.push(`<strong>VMIN objetivo:</strong> ${vminObj.toFixed(2)} L/min`);
    parts.push(Number.isFinite(frObj)
      ? `<strong>FR objetivo (manteniendo VT):</strong> ${frObj.toFixed(0)} rpm`
      : `<strong>FR objetivo (manteniendo VT):</strong> Ingrese FR actual`
    );
    parts.push(Number.isFinite(vtObj)
      ? `<strong>VT objetivo (manteniendo FR):</strong> ${vtObj.toFixed(0)} mL`
      : `<strong>VT objetivo (manteniendo FR):</strong> Ingrese VT actual`
    );
    detalle.innerHTML = parts.join("<br>");
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
    let estadoVTI =
      vti >= 18 && vti <= 22 ? "VTI 18–22 cm: <strong>normal</strong>."
      : vti < 15 ? "VTI < 15 cm: <strong>alerta</strong> (hipoperfusión / bajo gasto)."
      : "VTI intermedio: interpretar en contexto clínico.";

    interp.innerHTML = `
      ${estadoVTI}<br>
      <strong>Respuesta a fluidos:</strong>
      sugerida si el <strong>cambio del VTI</strong> en reevaluación es
      <strong>&gt; 15%</strong>.
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

  if (
    anyNaN([gc, hb, sao2, svo2, pao2, pvo2]) ||
    gc <= 0 || hb <= 0 ||
    sao2 <= 0 || sao2 > 100 ||
    svo2 < 0 || svo2 > 100
  ) {
    resultado.textContent = "Complete todos los campos con valores válidos";
    if (detalle) detalle.textContent = "";
    return;
  }

  const CaO2_dL = (hb * (sao2 / 100) * 1.34) + (pao2 * 0.003);
  const CvO2_dL = (hb * (svo2 / 100) * 1.34) + (pvo2 * 0.003);
  if (!Number.isFinite(CaO2_dL) || !Number.isFinite(CvO2_dL)) {
    resultado.textContent = "No se pudo calcular el contenido de O₂";
    if (detalle) detalle.textContent = "";
    return;
  }

  const DO2 = gc * (CaO2_dL * 10);
  const VO2 = gc * ((CaO2_dL - CvO2_dL) * 10);
  if (!Number.isFinite(DO2) || !Number.isFinite(VO2)) {
    resultado.textContent = "No se pudo calcular DO₂ / VO₂";
    if (detalle) detalle.textContent = "";
    return;
  }

  const REO2 = clampPercent(((sao2 - svo2) / sao2) * 100);
  if (!Number.isFinite(REO2)) {
    resultado.textContent = "No se pudo calcular la extracción de O₂";
    if (detalle) detalle.textContent = "";
    return;
  }

  resultado.innerHTML = `<strong>REO₂:</strong> ${REO2.toFixed(1)} %`;

  if (detalle) {
    const interpretacion =
      REO2 >= 15 && REO2 <= 33
        ? "<strong>Normal:</strong> 15–33% en reposo."
        : REO2 > 33
          ? "Valores <strong>altos</strong>: mayor extracción por <strong>bajo suministro</strong> o <strong>alta demanda</strong>."
          : "Valores <strong>bajos</strong>: extracción reducida; posible baja demanda o alteración tisular.";

    detalle.innerHTML = `
      <strong>CaO₂ (arterial):</strong> ${CaO2_dL.toFixed(2)} mL O₂/dL<br>
      <strong>CvO₂ (venoso):</strong> ${CvO2_dL.toFixed(2)} mL O₂/dL<br>
      <strong>DO₂ (entrega):</strong> ${DO2.toFixed(0)} mL O₂/min<br>
      <strong>VO₂ (consumo):</strong> ${VO2.toFixed(0)} mL O₂/min<br>
      ${interpretacion}
    `;
  }

  trackEvent("calculate_oxygen_delivery", {
    cao2_dl: Number(CaO2_dL.toFixed(2)),
    cvo2_dl: Number(CvO2_dL.toFixed(2)),
    do2_ml_min: Number(DO2.toFixed(0)),
    vo2_ml_min: Number(VO2.toFixed(0)),
    reo2_pct: Number(REO2.toFixed(1)),
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

  if (anyNaN([paco2, pvco2]) || paco2 <= 0 || pvco2 <= 0) {
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
function calcularRVS() {
  const tam = num("tam");
  const pvc = num("pvc");
  const gc = num("gc_rvs");
  const outId = "resultadoRVS";

  if (anyNaN([tam, pvc, gc]) || gc <= 0) {
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

function calcularPPR() {
  const tam = num("tam");
  const pia = num("pia");
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

function calcularPPC() {
  const tam = num("tam");
  const pic = num("pic");
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
    icp_mmhg: pic,
    cpp_mmhg: Number(ppc.toFixed(0)),
  });
}

/* =========================
   ÁCIDO–BASE
========================= */
function calcularAnionGapCorregido() {
  const na = num("na");
  const k = num("k");
  const cl = num("cl");
  const hco3 = num("hco3_ag");
  let alb = num("alb");

  const outId = "resultadoAnionGap";
  if (anyNaN([na, k, cl, hco3]) || na <= 0 || cl <= 0 || hco3 <= 0) {
    setText(outId, "Complete Na, K, Cl y HCO₃ con valores válidos");
    return;
  }

  if (!Number.isFinite(alb) || alb <= 0) alb = 4;

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  if (!Number.isFinite(ag) || !Number.isFinite(agCorr)) {
    setText(outId, "No se pudo calcular el anion gap");
    return;
  }

  setHTML(outId, `<strong>AG:</strong> ${ag.toFixed(1)} mEq/L<br>
    <strong>AG corregido (ALB):</strong> ${agCorr.toFixed(1)} mEq/L`);

  trackEvent("calculate_corrected_anion_gap", {
    ag_meq_l: Number(ag.toFixed(1)),
    ag_corrected_meq_l: Number(agCorr.toFixed(1)),
    albumin_g_dl: alb,
  });
}

function calcularDeltaGap() {
  const agPaciente = num("agapp");
  const hco3Paciente = num("bicap");
  const AG_NORMAL = 12;
  const HCO3_NORMAL = 24;

  const outId = "resultadoDeltaGap";
  const interpId = "interpretacionDeltaGap";

  if (!Number.isFinite(agPaciente) || !Number.isFinite(hco3Paciente)) {
    setHTML(outId, "<strong>Δ/Δ:</strong> —");
    setHTML(interpId, "Complete <strong>Anion Gap</strong> y <strong>Bicarbonato</strong>.");
    return;
  }

  if (agPaciente <= 0 || hco3Paciente <= 0) {
    setHTML(outId, "<strong>Δ/Δ:</strong> No interpretable");
    setHTML(interpId, "Valores no fisiológicos.");
    return;
  }

  const deltaBicarb = HCO3_NORMAL - hco3Paciente;
  if (deltaBicarb <= 0) {
    setHTML(outId, "<strong>Δ/Δ:</strong> No interpretable");
    setHTML(interpId, "HCO₃ no disminuido.");
    return;
  }

  const deltaDelta = (agPaciente - AG_NORMAL) / deltaBicarb;
  if (!Number.isFinite(deltaDelta)) {
    setHTML(outId, "<strong>Δ/Δ:</strong> —");
    setHTML(interpId, "No se pudo calcular.");
    return;
  }

  const texto =
    deltaDelta < 1
      ? "Sugiere <strong>acidosis metabólica hiperclorémica</strong> asociada."
      : deltaDelta <= 2
        ? "<strong>Acidosis metabólica con anion gap aumentado PURA</strong>."
        : "Sugiere <strong>alcalosis metabólica</strong> asociada.";

  setHTML(outId, `<strong>Δ/Δ:</strong> ${deltaDelta.toFixed(2)}`);
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
  const nas = num("nas");
  const glucs = num("glucs");
  const outId = "resultadoNaCorregido";

  if (!Number.isFinite(nas) || nas <= 0 || !Number.isFinite(glucs)) {
    setText(outId, "Complete sodio y glucosa con valores válidos");
    return;
  }

  const nac = nas + (glucs > 100 ? (1.6 * ((glucs - 100) / 100)) : 0);
  if (!Number.isFinite(nac)) {
    setText(outId, "No se pudo calcular el sodio corregido");
    return;
  }

  setHTML(outId, `<strong>Na corregido:</strong> ${nac.toFixed(1)} mEq/L`);
  trackEvent("calculate_corrected_sodium", {
    sodium_meq_l: nas,
    glucose_mg_dl: glucs,
    sodium_corrected_meq_l: Number(nac.toFixed(1)),
  });
}

function calcularCalcioCorregido() {
  const cas = num("cas");
  let albs = num("albs");
  const outId = "resultadoCaCorregido";

  if (!Number.isFinite(cas) || cas <= 0) {
    setText(outId, "Complete calcio con un valor válido");
    return;
  }
  if (!Number.isFinite(albs) || albs <= 0) albs = 4;

  const cac = cas + (0.8 * (4 - albs));
  if (!Number.isFinite(cac)) {
    setText(outId, "No se pudo calcular el calcio corregido");
    return;
  }

  setHTML(outId, `<strong>Ca corregido:</strong> ${cac.toFixed(2)} mg/dL`);
  trackEvent("calculate_corrected_calcium", {
    calcium_mg_dl: cas,
    albumin_g_dl: albs,
    calcium_corrected_mg_dl: Number(cac.toFixed(2)),
  });
}

/* =========================
   SCORES
========================= */
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

function limpiarRangoSOFA() {
  const list = document.getElementById("sofaMortalityList");
  if (!list) return;
  list.querySelectorAll("li").forEach(li => li.classList.remove("active-range"));
}

function calcularSOFA2() {
  const ids = ["sofa_neuro","sofa_resp","sofa_cv","sofa_hep","sofa_renal","sofa_coag"];
  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      setHTML("resultadoSOFA2","<strong>SOFA-2:</strong> Error de configuración");
      limpiarRangoSOFA();
      return;
    }
    const value = Number(el.value);
    if (!Number.isFinite(value) || value < 0 || value > 4) {
      setHTML("resultadoSOFA2","<strong>SOFA-2:</strong> Seleccione todas las variables");
      limpiarRangoSOFA();
      return;
    }
    total += value;
  }

  let mortalidadTxt = "";
  const list = document.getElementById("sofaMortalityList");
  if (list) {
    const match = Array.from(list.querySelectorAll("li")).find(li => {
      const min = Number(li.dataset.min);
      const max = Number(li.dataset.max);
      return Number.isFinite(min) && Number.isFinite(max) && total >= min && total <= max;
    });
    if (match) {
      const text = match.textContent.trim();
      const idx = text.indexOf(":");
      mortalidadTxt = idx !== -1 ? text.slice(idx + 1).trim() : text;
    }
  }

  setHTML("resultadoSOFA2", `<strong>SOFA-2 total:</strong> ${total} / 24${mortalidadTxt ? `<br><strong>Mortalidad estimada:</strong> ${mortalidadTxt}` : ""}`);
  resaltarRangoSOFA(total);
  const report = document.getElementById("sofaMortalityReport");
  if (report) report.style.display = "block";
  trackEvent("calculate_sofa_score", { sofa_score: total });
}

function calcularNIHSS() {
  const ids = ["nihss_1a","nihss_1b","nihss_1c","nihss_2","nihss_3","nihss_4","nihss_motor","nihss_ataxia","nihss_sens","nihss_lang","nihss_dys","nihss_neglect"];
  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      setHTML("resultadoNIHSS","<strong>NIHSS:</strong> Error de configuración");
      setHTML("interpretacionNIHSS","");
      return;
    }
    const v = Number(el.value);
    if (!Number.isFinite(v) || v < 0) {
      setHTML("resultadoNIHSS","<strong>NIHSS:</strong> Complete todos los ítems");
      setHTML("interpretacionNIHSS","");
      return;
    }
    total += v;
  }

  const interpretacion =
    total === 0 ? "Sin déficit neurológico."
    : total <= 4 ? "ACV leve."
    : total <= 15 ? "ACV moderado."
    : total <= 20 ? "ACV moderado–severo."
    : "ACV severo.";

  setHTML("resultadoNIHSS", `<strong>NIHSS total:</strong> ${total}`);
  setHTML("interpretacionNIHSS", `<strong>Interpretación:</strong> ${interpretacion}`);
  trackEvent("calculate_nihss_score", { nihss_score: total });
}

/* =========================
   CAM-ICU · DELIRIUM
========================= */

function initCAMICU() {
  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();
}

function camicuPaso1() {
  const v1 = getVal("camicu_c1");
  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();

  if (v1 === 1) {
    mostrarPaso(2);
  } else if (v1 === 0) {
    mostrarResultadoCAMICU(false);
  }
}

function camicuPaso2() {
  const v1 = getVal("camicu_c1");
  const v2 = getVal("camicu_c2");
  ocultarDesdePaso(3);
  limpiarResultadoCAMICU();

  if (v1 === 1 && v2 === 1) {
    mostrarPaso(3);
    mostrarPaso(4);
  } else if (v2 === 0) {
    mostrarResultadoCAMICU(false);
  }
}

function camicuPaso3() {
  evaluarResultadoFinal();
}

function camicuPaso4() {
  evaluarResultadoFinal();
}

/* =========================
   LÓGICA FINAL
========================= */

function evaluarResultadoFinal() {
  const v1 = getVal("camicu_c1");
  const v2 = getVal("camicu_c2");
  const v3 = getVal("camicu_c3");
  const v4 = getVal("camicu_c4");

  if (v1 !== 1 || v2 !== 1) return;

  if (v3 === 1 || v4 === 1) {
    mostrarResultadoCAMICU(true);
  } else if (v3 === 0 && v4 === 0) {
    mostrarResultadoCAMICU(false);
  }
}

/* =========================
   HELPERS
========================= */

function getVal(id) {
  const el = document.getElementById(id);
  const v = Number(el?.value);
  return Number.isFinite(v) ? v : null;
}

function mostrarPaso(n) {
  const paso = document.getElementById(`camicu_paso${n}`);
  if (paso) paso.style.display = "block";
}

function ocultarDesdePaso(n) {
  for (let i = n; i <= 4; i++) {
    const paso = document.getElementById(`camicu_paso${i}`);
    if (paso) {
      paso.style.display = "none";
      const sel = paso.querySelector("select");
      if (sel) sel.value = "";
    }
  }
}

function limpiarResultadoCAMICU() {
  setHTML("resultadoCAMICU", "");
  setHTML("interpretacionCAMICU", "");
}

function mostrarResultadoCAMICU(positivo) {
  if (positivo) {
    setHTML(
      "resultadoCAMICU",
      "CAM-ICU <strong>POSITIVO</strong>"
    );
    setHTML(
      "interpretacionCAMICU",
      "Compatible con <strong>delirium</strong>."
    );
  } else {
    setHTML(
      "resultadoCAMICU",
      "CAM-ICU <strong>NEGATIVO</strong>"
    );
    setHTML(
      "interpretacionCAMICU",
      "No cumple criterios de delirium."
    );
  }

  trackEvent("calculate_cam_icu", { result: positivo ? "positive" : "negative" });
}

/* =========================
   EVENT BINDING CENTRAL
========================= */
(function initEventBinding() {
  const actionMap = {
    "calcular-peso-ideal": calcularPesoIdeal,
    "ajustar-pco2": ajustarPCO2,
    "calcular-gc-eco": calcularGCEco,
    "calcular-oxigenacion": calcularOxigenacion,
    "calcular-delta-co2": calcularDeltaCO2,
    "calcular-rvs": calcularRVS,
    "calcular-ppr": calcularPPR,
    "calcular-ppc": calcularPPC,
    "calcular-anion-gap": calcularAnionGapCorregido,
    "calcular-delta-gap": calcularDeltaGap,
    "calcular-na-corregido": calcularSodioCorregido,
    "calcular-ca-corregido": calcularCalcioCorregido,
    "calcular-sofa": calcularSOFA2,
    "calcular-nihss": calcularNIHSS,
  };

  function handleClick(event) {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    event.preventDefault();
    if (btn.disabled) return;

    const action = btn.dataset.action;
    const fn = actionMap[action];
    if (typeof fn === "function") {
      try { fn(); } catch (err) { console.error(`Error ejecutando acción: ${action}`, err); }
    } else {
      console.warn(`Acción no registrada: ${action}`);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.addEventListener("click", handleClick);
    });
  } else {
    document.addEventListener("click", handleClick);
  }
})();
