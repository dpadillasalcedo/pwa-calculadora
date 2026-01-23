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
  const agPaciente = num("agapp");   // Anion gap del paciente
  const hco3Paciente = num("bicap"); // Bicarbonato del paciente

  const AG_NORMAL = 12;
  const HCO3_NORMAL = 24;

  const resultado = document.getElementById("resultadoDeltaGap");
  const interpretacion = document.getElementById("interpretacionDeltaGap");

  if (!resultado) return;

  if (anyNaN([agPaciente, hco3Paciente])) {
    resultado.innerText = "Complete todos los campos";
    if (interpretacion) interpretacion.innerText = "";
    return;
  }

/* =========================
   DELTA / DELTA (ANION GAP / BICARBONATO)
========================= */
function calcularDeltaGap() {
  const agPaciente = num("agapp");
  const hco3Paciente = num("bicap");

  const AG_NORMAL = 12;
  const HCO3_NORMAL = 24;

  const resultado = document.getElementById("resultadoDeltaGap");
  const interpretacion = document.getElementById("interpretacionDeltaGap");

  if (!resultado) return;

  // Validación básica
  if (!Number.isFinite(agPaciente) || !Number.isFinite(hco3Paciente)) {
    resultado.innerHTML = "<b>Δ/Δ:</b> —";
    if (interpretacion) {
      interpretacion.innerHTML = "Complete <b>Anion Gap</b> y <b>Bicarbonato</b> del paciente.";
    }
    return;
  }

  const deltaBicarb = HCO3_NORMAL - hco3Paciente;

  // Validación clínica
  if (deltaBicarb <= 0) {
    resultado.innerHTML = "<b>Δ/Δ:</b> No interpretable";
    if (interpretacion) {
      interpretacion.innerHTML =
        "El <b>bicarbonato no está disminuido</b> (HCO₃ ≥ 24). " +
        "El cálculo de <b>Δ/Δ no es válido</b> en este contexto.";
    }
    return;
  }

  const deltaDelta = (agPaciente - AG_NORMAL) / deltaBicarb;

  resultado.innerHTML = `<b>Δ/Δ:</b> ${deltaDelta.toFixed(2)}`;

  let texto = "";
  if (deltaDelta < 1) {
    texto =
      "Sugiere <b>disminución previa del bicarbonato</b>, puede ser por " +
      "<b>acidosis metabólica hiperclorémica asociada</b> o " +
      "<b>alcalosis respiratoria crónica asociada</b>.";
  } else if (deltaDelta <= 2) {
    texto =
      "<b>Acidosis metabólica con anion gap aumentado PURA</b>.";
  } else {
    texto =
      "Sugiere <b>aumento previo del bicarbonato</b>, puede ser por " +
      "<b>alcalosis metabólica asociada</b> o " +
      "<b>acidosis respiratoria crónica asociada</b>.";
  }

  if (interpretacion) interpretacion.innerHTML = texto;

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

  // Mostrar bloque de mortalidad solo luego del cálculo
  const report = document.getElementById("sofaMortalityReport");
  if (report) report.style.display = "block";

  trackEvent("calculate_sofa_score", { sofa_score: total });
}


/* =========================
   DELTA / DELTA (ANION GAP / BICARBONATO)
========================= */
function calcularDeltaGap() {
  const agPaciente = num("agapp");
  const hco3Paciente = num("bicap");

  const AG_NORMAL = 12;
  const HCO3_NORMAL = 24;

  const resultado = document.getElementById("resultadoDeltaGap");
  const interpretacion = document.getElementById("interpretacionDeltaGap");

  if (!resultado) return;

  if (!Number.isFinite(agPaciente) || !Number.isFinite(hco3Paciente)) {
    resultado.innerHTML = "<b>Δ/Δ:</b> —";
    if (interpretacion) {
      interpretacion.innerHTML =
        "Complete <b>Anion Gap</b> y <b>Bicarbonato</b> del paciente.";
    }
    return;
  }

  const deltaBicarb = HCO3_NORMAL - hco3Paciente;

  if (deltaBicarb <= 0) {
    resultado.innerHTML = "<b>Δ/Δ:</b> No interpretable";
    if (interpretacion) {
      interpretacion.innerHTML =
        "El <b>bicarbonato no está disminuido</b> (HCO₃ ≥ 24). " +
        "El cálculo de <b>Δ/Δ no es válido</b> en este contexto.";
    }
    return;
  }

  const deltaDelta = (agPaciente - AG_NORMAL) / deltaBicarb;

  resultado.innerHTML = `<b>Δ/Δ:</b> ${deltaDelta.toFixed(2)}`;

  let texto = "";
  if (deltaDelta < 1) {
    texto =
      "Sugiere <b>disminución previa del bicarbonato</b>, puede ser por " +
      "<b>acidosis metabólica hiperclorémica asociada</b> o " +
      "<b>alcalosis respiratoria crónica asociada</b>.";
  } else if (deltaDelta <= 2) {
    texto = "<b>Acidosis metabólica con anion gap aumentado PURA</b>.";
  } else {
    texto =
      "Sugiere <b>aumento previo del bicarbonato</b>, puede ser por " +
      "<b>alcalosis metabólica asociada</b> o " +
      "<b>acidosis respiratoria crónica asociada</b>.";
  }

  if (interpretacion) interpretacion.innerHTML = texto;

  trackEvent("calculate_delta_delta", {
    delta_delta: deltaDelta,
    ag_paciente: agPaciente,
    hco3_paciente: hco3Paciente,
  });
}

/* =========================
   CAM-ICU · Delirium
========================= */
function calcularCAMICU() {
  const c1 = document.getElementById("camicu_c1")?.value;
  const c2 = document.getElementById("camicu_c2")?.value;
  const c3 = document.getElementById("camicu_c3")?.value;
  const c4 = document.getElementById("camicu_c4")?.value;

  const resultado = document.getElementById("resultadoCAMICU");
  const interpretacion = document.getElementById("interpretacionCAMICU");

  if (!resultado) return;

  if ([c1, c2, c3, c4].some(v => v === "")) {
    resultado.innerHTML = "<b>CAM-ICU:</b> —";
    interpretacion.innerText = "Complete todos los criterios.";
    return;
  }

  const positivo =
    c1 === "1" &&
    c2 === "1" &&
    (c3 === "1" || c4 === "1");

  if (positivo) {
    resultado.innerHTML =
      "<b>CAM-ICU POSITIVO</b> · Delirium presente";
    resultado.style.color = "#b91c1c";
    interpretacion.innerHTML =
      "Cumple criterios diagnósticos de <b>delirium</b>. Reevaluar causas reversibles y monitorizar evolución.";
  } else {
    resultado.innerHTML =
      "<b>CAM-ICU NEGATIVO</b> · Delirium no detectado";
    resultado.style.color = "#166534";
    interpretacion.innerText =
      "No cumple criterios de delirium al momento de la evaluación.";
  }

  if (typeof trackEvent === "function") {
    trackEvent("calculate_cam_icu", {
      c1, c2, c3, c4,
      result: positivo ? "positive" : "negative"
    });
  }
}


