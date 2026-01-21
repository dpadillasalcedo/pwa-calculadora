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

  // Permite coma decimal (ej: "3,5")
  const raw = String(el.value ?? "").trim().replace(",", ".");
  const v = parseFloat(raw);

  return Number.isFinite(v) ? v : NaN;
}

function anyNaN(arr) {
  return arr.some(v => !Number.isFinite(v));
}

function clampPercent(p) {
  if (!Number.isFinite(p)) return NaN;
  return Math.max(0, Math.min(100, p));
}

/* Helpers de escritura segura */
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
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

  if (anyNaN([gc, hb, sao2, svo2, pao2, pvo2]) || gc <= 0 || hb <= 0) {
    resultado.innerText = "Complete todos los campos";
    if (detalle) detalle.innerText = "";
    return;
  }

  // Contenido arterial y venoso (mL O2/dL)
  const CaO2 = (1.34 * hb * (sao2 / 100)) + (0.003 * pao2);
  const CvO2 = (1.34 * hb * (svo2 / 100)) + (0.003 * pvo2);

  const deltaO2 = CaO2 - CvO2;     // mL O2/dL
  const DO2 = gc * CaO2 * 10;      // mL O2/min
  const VO2 = gc * deltaO2 * 10;   // mL O2/min
  const REO2 = clampPercent((VO2 / DO2) * 100);

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
      <b>CaO₂ (arterial):</b> ${CaO2.toFixed(2)} mL O₂/dL<br>
      <b>CvO₂ (venoso):</b> ${CvO2.toFixed(2)} mL O₂/dL<br>
      <b>DO₂ (entrega):</b> ${DO2.toFixed(0)} mL O₂/min<br>
      <b>VO₂ (consumo):</b> ${VO2.toFixed(0)} mL O₂/min<br>
      ${interpretacion}
    `;
  }

  trackEvent("calculate_oxygen_delivery", {
    cao2: CaO2,
    cvo2: CvO2,
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
   DELTA GAP / DELTA BICARBONATO
========================= */
function calcularDeltaGap() {
  const bican = num("bican");   // HCO3 normal
  const bicap = num("bicap");   // HCO3 paciente
  const agapn = num("agapn");   // AG normal
  const agapp = num("agapp");   // AG paciente

  const resultado = document.getElementById("resultadoDeltaGap");
  const interpretacion = document.getElementById("interpretacionDeltaGap");

  if (!resultado) return;

  if (anyNaN([bican, bicap, agapn, agapp])) {
    resultado.innerText = "Complete todos los campos";
    if (interpretacion) interpretacion.innerText = "";
    return;
  }

  const deltaGap = (agapp - agapn) - (bican - bicap);

  resultado.innerHTML = `<b>ΔGap / ΔBica:</b> ${deltaGap.toFixed(1)}`;

  let texto = "";
  if (deltaGap >= 0 && deltaGap <= 6) {
    texto = "Acidosis metabólica con anion gap aumentado <b>PURA</b>";
  } else if (deltaGap > 6) {
    texto = "Acidosis metabólica con anion gap aumentado + <b>alcalosis metabólica asociada</b>";
  } else if (deltaGap < -6) {
    texto = "Acidosis metabólica con anion gap aumentado + <b>otra acidosis metabólica asociada</b>";
  } else {
    texto = "Resultado intermedio. Interpretar en contexto clínico";
  }

  if (interpretacion) interpretacion.innerHTML = texto;

  trackEvent("calculate_delta_gap", { delta_gap: deltaGap });
}

/* =========================
   ELECTROLITOS
========================= */
function calcularSodioCorregido() {
  const nas = num("nas");
  const glucs = num("glucs");
  const resultado = document.getElementById("resultadoNaCorregido");

  if (!resultado) return;

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

  if (!resultado) return;

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
function resaltarRangoSOFA(score) {
  const list = document.getElementById("sofaMortalityList");
  if (!list || !Number.isFinite(score)) return;

  list.querySelectorAll("li").forEach(li => {
    li.classList.remove("active-range");
    const min = Number(li.dataset.min);
    const max = Number(li.dataset.max);
    if (score >= min && score <= max) {
      li.classList.add("active-range");
    }
  });
}

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
    const el = document.getElementById(id);
    const v = parseInt(el?.value, 10);

    if (!Number.isFinite(v)) {
      setHTML("resultadoSOFA2", "<b>SOFA-2:</b> Seleccione todas las variables");
      return;
    }
    total += v;
  }

  // Buscar la mortalidad según el rango del listado (si existe)
  let mortalidadTxt = "";
  const list = document.getElementById("sofaMortalityList");
  if (list) {
    const items = Array.from(list.querySelectorAll("li"));
    const match = items.find(li => {
      const min = Number(li.dataset.min);
      const max = Number(li.dataset.max);
      return Number.isFinite(min) && Number.isFinite(max) && total >= min && total <= max;
    });

    if (match) {
      // Ej: "SOFA-2 4–7: Mortalidad leve–moderada (≈ 5–15%)"
      const full = match.textContent.trim();
      const idx = full.indexOf(":");
      mortalidadTxt = idx !== -1 ? full.slice(idx + 1).trim() : full;
    }
  }

  const interpretacion = mortalidadTxt
    ? `<br><b>Mortalidad estimada:</b> ${mortalidadTxt}`
    : "";

  setHTML("resultadoSOFA2", `<b>SOFA-2 total:</b> ${total} / 24${interpretacion}`);

  // Resaltar rango de mortalidad
  resaltarRangoSOFA(total);

  trackEvent("calculate_sofa_score", { sofa_score: total });
}
