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

function getPe2026Value(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function yesNoToBool(value) {
  return value === "1";
}

const pe2026Categories = {
  A: {
    title: "Categoría A",
    subtitle: "Subclínico",
    summary: "TEP incidental o subclínico, sin síntomas.",
    management: [
      { cor: "COR 1", text: "Iniciar anticoagulación con DOAC si no hay contraindicaciones." },
      { cor: "COR 1", text: "Usar HESTIA, PESI y/o sPESI para evaluar riesgo a corto plazo." },
      { cor: "COR 2a", text: "Usar herramienta de decisión para identificar elegibilidad para manejo ambulatorio." }
    ]
  },

  B1: {
    title: "Categoría B1",
    subtitle: "Sintomático de bajo riesgo · Subsegmentario",
    summary: "TEP sintomático de bajo riesgo con compromiso subsegmentario.",
    management: [
      { cor: "COR 1", text: "Iniciar anticoagulación con DOAC si no hay contraindicaciones." },
      { cor: "COR 1", text: "Usar HESTIA, PESI y/o sPESI para evaluar riesgo a corto plazo." },
      { cor: "COR 2a", text: "Usar herramienta de decisión para identificar elegibilidad para manejo ambulatorio." }
    ]
  },

  B2: {
    title: "Categoría B2",
    subtitle: "Sintomático de bajo riesgo · Segmentario / no subsegmentario",
    summary: "TEP sintomático de bajo riesgo con localización segmentaria o no subsegmentaria.",
    management: [
      { cor: "COR 1", text: "Iniciar anticoagulación con DOAC si no hay contraindicaciones." },
      { cor: "COR 1", text: "Usar HESTIA, PESI y/o sPESI para evaluar riesgo a corto plazo." },
      { cor: "COR 2a", text: "Usar herramienta de decisión para identificar elegibilidad para manejo ambulatorio." }
    ]
  },

  C1: {
    title: "Categoría C1",
    subtitle: "Sintomático · Alto riesgo por score · VD normal + biomarcadores normales",
    summary: "TEP sintomático con PESI/sPESI de alto riesgo, sin disfunción del VD ni biomarcadores elevados.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir al menos un biomarcador cardíaco." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del ventrículo derecho mediante TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Usar un score validado para identificar pacientes de mayor riesgo." },
      { cor: "COR 1", text: "Realizar valoración multidisciplinaria tipo PERT para guiar el manejo clínico." }
    ]
  },

  C2: {
    title: "Categoría C2",
    subtitle: "Sintomático · Alto riesgo por score · VD alterado o biomarcadores elevados",
    summary: "TEP sintomático con PESI/sPESI de alto riesgo, con disfunción del VD o elevación de biomarcadores.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir al menos un biomarcador cardíaco." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del ventrículo derecho mediante TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Usar un score validado para identificar pacientes de mayor riesgo." },
      { cor: "COR 1", text: "Realizar valoración multidisciplinaria tipo PERT para guiar el manejo clínico." }
    ]
  },

  C3: {
    title: "Categoría C3",
    subtitle: "Sintomático · Alto riesgo por score · VD alterado + biomarcadores + modificador respiratorio",
    summary: "TEP sintomático con PESI/sPESI de alto riesgo, con disfunción del VD, biomarcadores elevados y compromiso respiratorio.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir al menos un biomarcador cardíaco." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del ventrículo derecho mediante TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Usar un score validado para identificar pacientes de mayor riesgo." },
      { cor: "COR 1", text: "Realizar valoración multidisciplinaria tipo PERT para guiar el manejo clínico." }
    ]
  },

  D1: {
    title: "Categoría D1",
    subtitle: "Falla cardiopulmonar incipiente · Hipotensión transitoria",
    summary: "TEP con falla cardiopulmonar incipiente e hipotensión transitoria.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del ventrículo derecho mediante TC y/o ecocardiograma." },
      { cor: "COR 1", text: "Realizar valoración multidisciplinaria tipo PERT para guiar el manejo clínico." },
      { cor: "COR 1", text: "Administrar soporte ventilatorio no invasivo o suplementación alta de oxígeno si está indicado clínicamente." },
      { cor: "COR 2b", text: "Considerar trombólisis sistémica si el riesgo de sangrado es aceptable, o trombólisis dirigida por catéter / trombectomía mecánica en casos apropiados." }
    ]
  },

  D2: {
    title: "Categoría D2",
    subtitle: "Falla cardiopulmonar incipiente · Shock normotensivo",
    summary: "TEP con signos de hipoperfusión y shock normotensivo, usualmente con lactato >2 mmol/L.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del ventrículo derecho mediante TC y/o ecocardiograma." },
      { cor: "COR 2a", text: "Evaluar y reconocer shock normotensivo." },
      { cor: "COR 1", text: "Realizar valoración multidisciplinaria tipo PERT para guiar el manejo clínico." },
      { cor: "COR 1", text: "Iniciar vasopresores y/o inotrópicos si están indicados." },
      { cor: "COR 1", text: "Administrar soporte ventilatorio no invasivo o suplementación alta de oxígeno si está indicado clínicamente." },
      { cor: "COR 2b", text: "Considerar trombólisis sistémica si el riesgo de sangrado es aceptable, o trombólisis dirigida por catéter / trombectomía mecánica en casos apropiados." }
    ]
  },

  E1: {
    title: "Categoría E1",
    subtitle: "Falla cardiopulmonar · Hipotensión persistente / shock cardiogénico",
    summary: "TEP con falla cardiopulmonar establecida, hipotensión persistente o shock cardiogénico.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Evaluar tamaño y función del ventrículo derecho mediante TC y/o ecocardiograma cuando sea factible." },
      { cor: "COR 1", text: "Realizar valoración multidisciplinaria tipo PERT para guiar el manejo clínico." },
      { cor: "COR 1", text: "Iniciar vasopresores y/o inotrópicos si están indicados." },
      { cor: "COR 2a", text: "Considerar trombólisis sistémica si el riesgo de sangrado es aceptable, trombólisis dirigida por catéter, trombectomía mecánica o embolectomía quirúrgica." }
    ]
  },

  E2: {
    title: "Categoría E2",
    subtitle: "Falla cardiopulmonar · Shock cardiogénico refractario o paro cardíaco",
    summary: "TEP de muy alto riesgo con shock refractario o paro cardíaco; puede coexistir falla respiratoria hipoxémica o ventilatoria.",
    management: [
      { cor: "COR 1", text: "Iniciar LMWH o UFH según contexto clínico y necesidad potencial de procedimientos." },
      { cor: "COR 1", text: "Medir lactato." },
      { cor: "COR 1", text: "Realizar valoración multidisciplinaria tipo PERT para guiar el manejo clínico." },
      { cor: "COR 1", text: "Iniciar vasopresores y/o inotrópicos si están indicados." },
      { cor: "COR 2a", text: "Considerar VA-ECMO como soporte en escenarios apropiados." },
      { cor: "COR 2a", text: "Considerar trombólisis sistémica si el riesgo de sangrado es aceptable." }
    ]
  }
};

function renderPE2026(category, logicSteps) {
  const result = document.getElementById("pe2026_result");
  const summary = document.getElementById("pe2026_summary");
  const logic = document.getElementById("pe2026_logic");
  const management = document.getElementById("pe2026_management");

  const cat = pe2026Categories[category];

  if (!cat) {
    result.innerHTML = "<b>No fue posible clasificar.</b>";
    summary.textContent = "Revise los datos ingresados.";
    logic.innerHTML = "";
    logic.style.display = "none";
    management.innerHTML = "";
    return;
  }

  result.innerHTML = `<b>${cat.title}</b> · ${cat.subtitle}`;
  summary.textContent = cat.summary;

  logic.innerHTML = `
    <b>Lógica aplicada:</b>
    <ul>
      ${logicSteps.map(step => `<li>${step}</li>`).join("")}
    </ul>
  `;
  logic.style.display = "block";

  management.innerHTML = `
    <ul>
      ${cat.management.map(item => `
        <li>
          <span class="cor-badge ${item.cor.toLowerCase().replace(" ", "-")}">${item.cor}</span>
          ${item.text}
        </li>
      `).join("")}
    </ul>
  `;
}

function classifyPE2026() {
  const presentation = getPe2026Value("pe_presentation");
  const severity = getPe2026Value("pe_severity");
  const bType = getPe2026Value("pe_b_type");

  const biomarker = yesNoToBool(getPe2026Value("pe_biomarker"));
  const rv = yesNoToBool(getPe2026Value("pe_rv"));
  const resp = yesNoToBool(getPe2026Value("pe_resp"));
  const highO2 = yesNoToBool(getPe2026Value("pe_high_o2"));

  const transientHypo = yesNoToBool(getPe2026Value("pe_transient_hypotension"));
  const normoShock = yesNoToBool(getPe2026Value("pe_normo_shock"));

  const cardioShock = yesNoToBool(getPe2026Value("pe_cardiogenic_shock"));
  const refractory = yesNoToBool(getPe2026Value("pe_refractory"));

  const result = document.getElementById("pe2026_result");
  const summary = document.getElementById("pe2026_summary");
  const logic = document.getElementById("pe2026_logic");
  const management = document.getElementById("pe2026_management");

  if (!presentation) {
    result.innerHTML = "<b>Debe seleccionar la presentación clínica.</b>";
    summary.textContent = "";
    logic.innerHTML = "";
    logic.style.display = "none";
    management.innerHTML = "";
    return;
  }

  let category = "";
  let logicSteps = [];

  /* =========================
     CATEGORÍAS E
  ========================= */
  if (refractory) {
    category = "E2";
    logicSteps.push("Shock cardiogénico refractario o paro cardíaco → E2.");
    if (resp || highO2) {
      logicSteps.push("Puede coexistir insuficiencia respiratoria hipoxémica o falla ventilatoria.");
    }
  } else if (cardioShock) {
    category = "E1";
    logicSteps.push("Hipotensión persistente o shock cardiogénico → E1.");
    if (resp || highO2) {
      logicSteps.push("Puede coexistir insuficiencia respiratoria hipoxémica o falla ventilatoria.");
    }
  }

  /* =========================
     CATEGORÍAS D
  ========================= */
  else if (normoShock) {
    category = "D2";
    logicSteps.push("Shock normotensivo con signos de hipoperfusión, típicamente lactato >2 mmol/L → D2.");
    if (highO2) {
      logicSteps.push("Requerimiento de oxígeno >6 L/min o soporte ventilatorio no invasivo presente.");
    }
  } else if (transientHypo) {
    category = "D1";
    logicSteps.push("Hipotensión transitoria → D1.");
    if (highO2) {
      logicSteps.push("Requerimiento de oxígeno >6 L/min o soporte ventilatorio no invasivo presente.");
    }
  }

  /* =========================
     CATEGORÍA A
  ========================= */
  else if (presentation === "subclinical") {
    category = "A";
    logicSteps.push("TEP subclínico / incidental → Categoría A.");
  }

  /* =========================
     CATEGORÍAS B
  ========================= */
  else if (presentation === "symptomatic" && severity === "low") {
    if (bType === "B1") {
      category = "B1";
      logicSteps.push("TEP sintomático de bajo riesgo por PESI/sPESI.");
      logicSteps.push("Localización subsegmentaria → B1.");
    } else {
      category = "B2";
      logicSteps.push("TEP sintomático de bajo riesgo por PESI/sPESI.");
      logicSteps.push("Localización segmentaria o no subsegmentaria → B2.");
    }
  }

  /* =========================
     CATEGORÍAS C
  ========================= */
  else if (presentation === "symptomatic" && severity === "high") {
    if (!rv && !biomarker) {
      category = "C1";
      logicSteps.push("TEP sintomático con alto riesgo por PESI/sPESI.");
      logicSteps.push("Ventrículo derecho normal y biomarcadores normales → C1.");
    } else if (rv && biomarker && resp) {
      category = "C3";
      logicSteps.push("TEP sintomático con alto riesgo por PESI/sPESI.");
      logicSteps.push("Disfunción del VD + biomarcadores elevados + modificador respiratorio → C3.");
    } else if (rv || biomarker) {
      category = "C2";
      logicSteps.push("TEP sintomático con alto riesgo por PESI/sPESI.");
      logicSteps.push("Disfunción del VD o elevación de biomarcadores → C2.");
      if (resp) {
        logicSteps.push("Hay modificador respiratorio, pero sin cumplir simultáneamente criterios completos de C3.");
      }
    }
  }

  if (!category) {
    result.innerHTML = "<b>No fue posible clasificar el TEP.</b>";
    summary.textContent = "Revise la combinación de variables ingresadas.";
    logic.innerHTML = "";
    logic.style.display = "none";
    management.innerHTML = "";
    return;
  }

  renderPE2026(category, logicSteps);
}

function resetPE2026() {
  const ids = [
    "pe_presentation",
    "pe_severity",
    "pe_b_type",
    "pe_biomarker",
    "pe_rv",
    "pe_resp",
    "pe_high_o2",
    "pe_transient_hypotension",
    "pe_normo_shock",
    "pe_cardiogenic_shock",
    "pe_refractory"
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
