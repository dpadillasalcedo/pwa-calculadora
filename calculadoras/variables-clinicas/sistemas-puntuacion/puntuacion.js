/* =========================================================
   UTILIDADES COMUNES
========================================================= */
function sumBySelector(selector){
  let total = 0;
  document.querySelectorAll(selector).forEach(el => {
    if (el.value !== "") {
      total += Number(el.value);
    }
  });
  return total;
}

function resetBySelector(selector){
  document.querySelectorAll(selector).forEach(el => {
    el.selectedIndex = 0;
  });
}

/* =========================================================
   SOFA-2
========================================================= */
function calcSOFA() {
  const selects = document.querySelectorAll(".sofa");
  let total = 0;
  let breakdown = [];

  selects.forEach(select => {
    const value = Number(select.value);
    if (isNaN(value) || value === 0) return;

    const label = select.closest("label").childNodes[0].textContent.trim();
    total += value;

    breakdown.push({
      system: label,
      points: value
    });
  });

  const result = document.getElementById("sofa_result");
  const mortality = document.getElementById("sofa_mortality");
  const detail = document.getElementById("sofa_breakdown");

  // Resultado total
  result.innerHTML = `<b>SOFA total:</b> ${total} puntos`;

  // Mortalidad orientativa
  let mortText = "";
  if (total === 0) mortText = "Sin disfunción orgánica.";
  else if (total <= 6) mortText = "Riesgo de mortalidad bajo–moderado.";
  else if (total <= 9) mortText = "Riesgo de mortalidad intermedio.";
  else if (total <= 12) mortText = "Riesgo de mortalidad alto.";
  else mortText = "Riesgo de mortalidad muy alto.";

  mortality.textContent = mortText;

  // Desglose clínico
  if (breakdown.length > 0) {
    let html = "<b>Desglose por sistemas comprometidos:</b><ul>";
    breakdown.forEach(item => {
      html += `<li>${item.system}: ${item.points} punto${item.points > 1 ? "s" : ""}</li>`;
    });
    html += "</ul>";

    detail.innerHTML = html;
    detail.style.display = "block";
  } else {
    detail.style.display = "none";
  }
}

function resetSOFA() {
  document.querySelectorAll(".sofa").forEach(select => {
    select.value = "";
  });

  document.getElementById("sofa_result").textContent = "";
  document.getElementById("sofa_mortality").textContent = "";
  document.getElementById("sofa_breakdown").style.display = "none";
}

/* =========================================================
   APACHE II
========================================================= */
function calcAPACHE(){
  const aps = sumBySelector('.apache');

  const ageEl = document.getElementById('apache_age');
  const age = ageEl ? Number(ageEl.value || 0) : 0;

  const chronicEl = document.getElementById('apache_chronic');
  const chronic = chronicEl ? Number(chronicEl.value || 0) : 0;

  const total = aps + age + chronic;

  document.getElementById('apache_result').textContent =
    `APACHE II total: ${total} (APS: ${aps})`;

  document.getElementById('apache_mortality').textContent =
    total < 10 ? 'Mortalidad estimada <10%' :
    total < 20 ? 'Mortalidad estimada 15–25%' :
    total < 30 ? 'Mortalidad estimada 40–55%' :
                 'Mortalidad estimada >75%';
}

function resetAPACHE(){
  resetBySelector('.apache');
  document.getElementById('apache_age').selectedIndex = 0;
  document.getElementById('apache_chronic').selectedIndex = 0;
  document.getElementById('apache_result').textContent = '';
  document.getElementById('apache_mortality').textContent = '';
}

/* =========================================================
   SAPS II
========================================================= */
function calcSAPS(){
  const score = sumBySelector('.saps');

  document.getElementById('saps_result').textContent =
    `SAPS II total: ${score}`;

  const logit = (score - 32.6659) / 7.3068;
  const mortality = 100 / (1 + Math.exp(-logit));

  document.getElementById('saps_mortality').textContent =
    `Mortalidad hospitalaria estimada: ${mortality.toFixed(1)}%`;
}

function resetSAPS(){
  resetBySelector('.saps');
  document.getElementById('saps_result').textContent = '';
  document.getElementById('saps_mortality').textContent = '';
}


/* =========================
   SOFA-1 (CLÁSICO)
========================= */

function calcSOFA1(){
  const selects = document.querySelectorAll('.sofa1');
  let total = 0;
  let breakdown = [];

  selects.forEach(select => {
    const value = Number(select.value);
    if (isNaN(value) || value === 0) return;

    const label = select.closest("label").childNodes[0].textContent.trim();

    total += value;

    breakdown.push({
      system: label,
      points: value
    });
  });

  const result = document.getElementById('sofa1_result');
  const mortality = document.getElementById('sofa1_mortality');
  const detail = document.getElementById('sofa1_breakdown');

  // Total
  result.innerHTML = `<b>SOFA-1 total:</b> ${total} puntos`;

  // Mortalidad
  mortality.textContent =
    total <= 1  ? 'Mortalidad estimada <10%' :
    total <= 5  ? 'Mortalidad estimada 10–20%' :
    total <= 9  ? 'Mortalidad estimada 20–40%' :
    total <= 12 ? 'Mortalidad estimada 40–50%' :
                  'Mortalidad estimada >50–90%';

  // Desglose
  if (breakdown.length > 0) {
    let html = "<b>Desglose por sistemas comprometidos:</b><ul>";
    breakdown.forEach(item => {
      html += `<li>${item.system}: ${item.points} punto${item.points > 1 ? "s" : ""}</li>`;
    });
    html += "</ul>";

    detail.innerHTML = html;
    detail.style.display = "block";
  } else {
    detail.style.display = "none";
  }
}

function resetSOFA1(){
  resetBySelector('.sofa1');

  document.getElementById('sofa1_result').textContent = '';
  document.getElementById('sofa1_mortality').textContent = '';

  const detail = document.getElementById('sofa1_breakdown');
  if (detail) detail.style.display = 'none';
}

// ==========================
// PESI
// ==========================

let pesiTotal = 0;
let pesiClase = "";

document.getElementById("pesi_calc").addEventListener("click", () => {

  const age = parseInt(document.getElementById("pesi_age").value) || 0;

  const fields = [
    "pesi_male","pesi_cancer","pesi_chf","pesi_copd",
    "pesi_hr","pesi_sbp","pesi_rr","pesi_temp",
    "pesi_mental","pesi_sat"
  ];

  let sum = age;

  fields.forEach(id=>{
    sum += parseInt(document.getElementById(id).value);
  });

  pesiTotal = sum;

  let clase = "";
  let riesgo = "";

  if (sum <= 65) {
    clase = "I";
    riesgo = "Muy bajo riesgo (0–1.6%)";
  } else if (sum <= 85) {
    clase = "II";
    riesgo = "Bajo riesgo (1.7–3.5%)";
  } else if (sum <= 105) {
    clase = "III";
    riesgo = "Riesgo intermedio (3.2–7.1%)";
  } else if (sum <= 125) {
    clase = "IV";
    riesgo = "Riesgo alto (4–11.4%)";
  } else {
    clase = "V";
    riesgo = "Riesgo muy alto (10–24.5%)";
  }

  pesiClase = clase;

  document.getElementById("resultadoPESI").textContent =
    `PESI: ${sum} puntos (Clase ${clase})`;

  document.getElementById("interpretacionPESI").textContent = riesgo;
});

document.getElementById("pesi_reset").addEventListener("click", ()=>{
  document.querySelectorAll("#tep-risk select, #tep-risk input")
    .forEach(el => el.value = el.tagName === "INPUT" ? "" : "0");
  document.getElementById("resultadoPESI").textContent = "";
  document.getElementById("interpretacionPESI").textContent = "";
  document.getElementById("resultadoTEP").textContent = "";
  document.getElementById("interpretacionTEP").textContent = "";
});

// ==========================
// CLASIFICACIÓN GLOBAL TEP
// ==========================

document.getElementById("tep_calc").addEventListener("click", ()=>{

  const hemo = document.getElementById("tep_hemo").value;
  const vd = document.getElementById("tep_vd").value;
  const trop = document.getElementById("tep_trop").value;

  let riesgo = "";
  let interpretacion = "";

  if (hemo === "1") {
    riesgo = "Riesgo ALTO";
    interpretacion = "Indicación de reperfusión urgente.";
  }
  else if ((pesiClase === "III" || pesiClase === "IV" || pesiClase === "V") 
           && vd === "1" && trop === "1") {
    riesgo = "Riesgo INTERMEDIO ALTO";
    interpretacion = "Vigilancia estrecha. Riesgo de deterioro.";
  }
  else if ((pesiClase === "III" || pesiClase === "IV" || pesiClase === "V")
           && (vd === "1" || trop === "1")) {
    riesgo = "Riesgo INTERMEDIO BAJO";
    interpretacion = "Un solo marcador positivo.";
  }
  else {
    riesgo = "Riesgo BAJO";
    interpretacion = "Mortalidad precoz baja.";
  }

  document.getElementById("resultadoTEP").textContent = riesgo;
  document.getElementById("interpretacionTEP").textContent = interpretacion;
});

/* =========================================================
   TEP AHA/ACC 2026
========================================================= */

const pe2026Categories = {
  A: {
    title: "Categoría A",
    subtitle: "Subclínico",
    summary: "TEP subclínico / incidental.",
    management: [
      { cor: "COR 1", text: "Iniciar DOAC." },
      { cor: "COR 1", text: "Usar HESTIA, PESI y/o sPESI para evaluar riesgo a corto plazo." },
      { cor: "COR 2a", text: "Usar una herramienta de decisión para identificar elegibilidad para manejo ambulatorio." }
    ]
  },
  B: {
    title: "Categoría B",
    subtitle: "Sintomático, puntaje clínico bajo",
    summary: "TEP sintomático con bajo riesgo clínico inicial.",
    management: [
      { cor: "COR 1", text: "Iniciar DOAC." },
      { cor: "COR 1", text: "Usar HESTIA, PESI y/o sPESI para evaluar riesgo a corto plazo." },
      { cor: "COR 2a", text: "Usar una herramienta de decisión para identificar elegibilidad para manejo ambulatorio." }
    ]
  },
  C1: {
    title: "Categoría C1",
    subtitle: "Sintomático, severidad clínica elevada",
    summary: "Mayor severidad clínica, sin datos acumulativos suficientes para C2/C3.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir al menos 1 biomarcador cardíaco." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del VD con TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Usar un puntaje validado para identificar pacientes de mayor riesgo." },
      { cor: "COR 1", text: "Valoración multidisciplinaria tipo PERT para guiar el manejo." }
    ]
  },
  C2: {
    title: "Categoría C2",
    subtitle: "Sintomático, severidad clínica elevada",
    summary: "Severidad clínica elevada con un marcador adicional de riesgo (biomarcador, lactato o VD).",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir al menos 1 biomarcador cardíaco." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del VD con TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Usar un puntaje validado para identificar pacientes de mayor riesgo." },
      { cor: "COR 1", text: "Valoración multidisciplinaria tipo PERT para guiar el manejo." }
    ]
  },
  C3: {
    title: "Categoría C3",
    subtitle: "Sintomático, severidad clínica elevada",
    summary: "Severidad clínica elevada con múltiples marcadores de riesgo.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir al menos 1 biomarcador cardíaco." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del VD con TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Usar un puntaje validado para identificar pacientes de mayor riesgo." },
      { cor: "COR 1", text: "Valoración multidisciplinaria tipo PERT para guiar el manejo." }
    ]
  },
  D1: {
    title: "Categoría D1",
    subtitle: "Falla cardiopulmonar incipiente",
    summary: "Compromiso hemodinámico o respiratorio inicial sin criterios de D2/E.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del VD con TC y/o ecocardiograma." },
      { cor: "COR 1", text: "Valoración multidisciplinaria tipo PERT para guiar el manejo." },
      { cor: "COR 2b", text: "Considerar trombólisis sistémica (si el riesgo de sangrado es aceptable), trombólisis dirigida por catéter o trombectomía mecánica en casos apropiados." }
    ]
  },
  D2: {
    title: "Categoría D2",
    subtitle: "Falla cardiopulmonar incipiente",
    summary: "Falla incipiente con shock normotenso o mayor riesgo de deterioro.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del VD con TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Evaluar shock normotenso." },
      { cor: "COR 1", text: "Valoración multidisciplinaria tipo PERT para guiar el manejo." },
      { cor: "COR 1", text: "Iniciar vasopresor y/o inotrópico si está indicado." },
      { cor: "COR 2b", text: "Considerar trombólisis sistémica (si el riesgo de sangrado es aceptable), trombólisis dirigida por catéter o trombectomía mecánica en casos apropiados." }
    ]
  },
  E1: {
    title: "Categoría E1",
    subtitle: "Falla cardiopulmonar",
    summary: "Falla cardiopulmonar establecida.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del VD con TC y/o ecocardiograma." },
      { cor: "COR 1", text: "Valoración multidisciplinaria tipo PERT para guiar el manejo." },
      { cor: "COR 1", text: "Iniciar vasopresor y/o inotrópico si está indicado." },
      { cor: "COR 2a", text: "Considerar trombólisis sistémica (si el riesgo de sangrado es aceptable), trombólisis dirigida por catéter, trombectomía mecánica o embolectomía quirúrgica." }
    ]
  },
  E2: {
    title: "Categoría E2",
    subtitle: "Falla cardiopulmonar",
    summary: "Falla cardiopulmonar muy grave / refractaria.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH o UFH." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Valoración multidisciplinaria tipo PERT para guiar el manejo." },
      { cor: "COR 1", text: "Iniciar vasopresor y/o inotrópico si está indicado." },
      { cor: "COR 2a", text: "Considerar VA-ECMO." },
      { cor: "COR 2a", text: "Considerar trombólisis sistémica si el riesgo de sangrado es aceptable." }
    ]
  }
};

function getPe2026Value(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function yesNoToBool(value) {
  return value === "1";
}

function classifyPE2026() {
  const presentation = getPe2026Value("pe_presentation");
  const lowScore = yesNoToBool(getPe2026Value("pe_low_score"));
  const highScore = yesNoToBool(getPe2026Value("pe_high_score"));
  const biomarker = yesNoToBool(getPe2026Value("pe_biomarker"));
  const lactate = yesNoToBool(getPe2026Value("pe_lactate"));
  const rv = yesNoToBool(getPe2026Value("pe_rv"));
  const incipientFailure = yesNoToBool(getPe2026Value("pe_incipient_failure"));
  const normotensiveShock = yesNoToBool(getPe2026Value("pe_normotensive_shock"));
  const cardiopulmonaryFailure = yesNoToBool(getPe2026Value("pe_cardiopulmonary_failure"));
  const refractoryCollapse = yesNoToBool(getPe2026Value("pe_refractory_collapse"));

  const result = document.getElementById("pe2026_result");
  const summary = document.getElementById("pe2026_summary");
  const logic = document.getElementById("pe2026_logic");
  const management = document.getElementById("pe2026_management");

  // Validación mínima
  if (!presentation) {
    result.innerHTML = "<b>Debe seleccionar la presentación clínica.</b>";
    summary.textContent = "";
    logic.style.display = "none";
    management.innerHTML = "";
    return;
  }

  let category = "";
  let logicSteps = [];

  // E2
  if (cardiopulmonaryFailure && refractoryCollapse) {
    category = "E2";
    logicSteps.push("Falla cardiopulmonar establecida + colapso refractario / escenario extracorpóreo potencial → E2.");
  }
  // E1
  else if (cardiopulmonaryFailure) {
    category = "E1";
    logicSteps.push("Falla cardiopulmonar establecida sin criterio de E2 → E1.");
  }
  // D2
  else if (incipientFailure && normotensiveShock) {
    category = "D2";
    logicSteps.push("Falla cardiopulmonar incipiente + shock normotenso → D2.");
  }
  // D1
  else if (incipientFailure) {
    category = "D1";
    logicSteps.push("Falla cardiopulmonar incipiente sin shock normotenso → D1.");
  }
  // A
  else if (presentation === "subclinical") {
    category = "A";
    logicSteps.push("Presentación subclínica / incidental → A.");
  }
  // B
  else if (presentation === "symptomatic" && lowScore && !highScore) {
    category = "B";
    logicSteps.push("TEP sintomático con puntaje clínico bajo → B.");
  }
  // C1-C3
  else if (presentation === "symptomatic" && highScore) {
    const riskMarkers = [biomarker, lactate, rv].filter(Boolean).length;

    if (riskMarkers === 0) {
      category = "C1";
      logicSteps.push("Sintomático con severidad clínica elevada y sin biomarcador/lactato/VD positivos → C1.");
    } else if (riskMarkers === 1) {
      category = "C2";
      logicSteps.push("Sintomático con severidad clínica elevada y 1 marcador adicional de riesgo → C2.");
    } else {
      category = "C3";
      logicSteps.push("Sintomático con severidad clínica elevada y ≥2 marcadores adicionales de riesgo → C3.");
    }
  }
  // fallback sintomático sin datos completos
  else if (presentation === "symptomatic") {
    category = "B";
    logicSteps.push("TEP sintomático sin datos suficientes para categoría mayor; se asigna B como clasificación conservadora.");
  }

  if (!category || !pe2026Categories[category]) {
    result.innerHTML = "<b>No fue posible clasificar.</b>";
    summary.textContent = "Revise los campos ingresados.";
    logic.style.display = "none";
    management.innerHTML = "";
    return;
  }

  const cat = pe2026Categories[category];

  result.innerHTML = `<b>${cat.title}</b> · ${cat.subtitle}`;
  summary.textContent = cat.summary;

  logic.innerHTML = `<b>Lógica aplicada:</b><ul>${logicSteps.map(step => `<li>${step}</li>`).join("")}</ul>`;
  logic.style.display = "block";

  management.innerHTML = `
    <ul>
      ${cat.management.map(item => `<li><strong>${item.cor}:</strong> ${item.text}</li>`).join("")}
    </ul>
  `;
}

function resetPE2026() {
  const ids = [
    "pe_presentation",
    "pe_low_score",
    "pe_high_score",
    "pe_biomarker",
    "pe_lactate",
    "pe_rv",
    "pe_incipient_failure",
    "pe_normotensive_shock",
    "pe_cardiopulmonary_failure",
    "pe_refractory_collapse"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });

  document.getElementById("pe2026_result").textContent = "";
  document.getElementById("pe2026_summary").textContent = "";
  document.getElementById("pe2026_management").innerHTML = "";

  const logic = document.getElementById("pe2026_logic");
  logic.innerHTML = "";
  logic.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const calcBtn = document.getElementById("pe2026_calc");
  const resetBtn = document.getElementById("pe2026_reset");

  if (calcBtn) {
    calcBtn.addEventListener("click", classifyPE2026);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetPE2026);
  }
});
