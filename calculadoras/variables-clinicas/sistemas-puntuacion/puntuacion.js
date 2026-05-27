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

/* =========================
   CLIF-SOFA / CLIF-C ACLF
========================= */

function getClifNum(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;

  const num = Number(el.value);
  return Number.isFinite(num) ? num : null;
}

function setClifHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function calcularClifSofaAclf() {
  const bili = getClifNum("clif_bili");
  const creat = getClifNum("clif_creat");
  const inr = getClifNum("clif_inr");
  const map = getClifNum("clif_map");
  const pafi = getClifNum("clif_pafi");
  const spofi = getClifNum("clif_spofi");

  const he = Number(document.getElementById("clif_he").value);
  const rrt = document.getElementById("clif_rrt").value;
  const vaso = document.getElementById("clif_vaso").value;

  if (
    bili === null ||
    creat === null ||
    inr === null ||
    map === null ||
    !Number.isFinite(he)
  ) {
    setClifHTML(
      "resultadoClifSofa",
      "Complete bilirrubina, creatinina, encefalopatía, INR y PAM."
    );
    setClifHTML("interpretacionClifSofa", "");
    return;
  }

  let score = 0;
  let fallas = [];
  let disfunciones = [];

  /* HÍGADO */
  let liverScore = 0;

  if (bili < 1.2) liverScore = 0;
  else if (bili < 2) liverScore = 1;
  else if (bili < 6) liverScore = 2;
  else if (bili < 12) liverScore = 3;
  else liverScore = 4;

  score += liverScore;

  if (bili >= 12) fallas.push("Hepática");
  else if (bili >= 6) disfunciones.push("Disfunción hepática");

  /* RIÑÓN */
  let kidneyScore = 0;

  if (rrt === "si" || creat >= 3.5) kidneyScore = 4;
  else if (creat >= 2) kidneyScore = 3;
  else if (creat >= 1.5) kidneyScore = 2;
  else if (creat >= 1.2) kidneyScore = 1;
  else kidneyScore = 0;

  score += kidneyScore;

  if (rrt === "si" || creat >= 2) fallas.push("Renal");
  else if (creat >= 1.5) disfunciones.push("Disfunción renal");

  /* CEREBRO */
  let brainScore = he;
  score += brainScore;

  if (he >= 3) fallas.push("Cerebral");
  else if (he >= 1) disfunciones.push("Encefalopatía grado I-II");

  /* COAGULACIÓN */
  let coagScore = 0;

  if (inr < 1.1) coagScore = 0;
  else if (inr < 1.25) coagScore = 1;
  else if (inr < 1.5) coagScore = 2;
  else if (inr < 2.5) coagScore = 3;
  else coagScore = 4;

  score += coagScore;

  if (inr >= 2.5) fallas.push("Coagulación");
  else if (inr >= 1.5) disfunciones.push("Disfunción de coagulación");

  /* CIRCULACIÓN */
  let circScore = 0;

  if (vaso === "si") circScore = 4;
  else if (map < 70) circScore = 1;
  else circScore = 0;

  score += circScore;

  if (vaso === "si") fallas.push("Circulatoria");
  else if (map < 70) disfunciones.push("Disfunción circulatoria");

  /* RESPIRACIÓN */
  let respScore = 0;
  let respValue = null;
  let respType = "";

  if (pafi !== null) {
    respValue = pafi;
    respType = "PaO₂/FiO₂";

    if (pafi > 300) respScore = 0;
    else if (pafi > 200) respScore = 1;
    else if (pafi > 100) respScore = 2;
    else if (pafi > 50) respScore = 3;
    else respScore = 4;

    if (pafi <= 200) fallas.push("Respiratoria");
    else if (pafi <= 300) disfunciones.push("Disfunción respiratoria");
  } else if (spofi !== null) {
    respValue = spofi;
    respType = "SpO₂/FiO₂";

    if (spofi > 357) respScore = 0;
    else if (spofi > 214) respScore = 1;
    else if (spofi > 89) respScore = 2;
    else if (spofi > 50) respScore = 3;
    else respScore = 4;

    if (spofi <= 214) fallas.push("Respiratoria");
    else if (spofi <= 357) disfunciones.push("Disfunción respiratoria");
  }

  score += respScore;

  /* CLASIFICACIÓN ACLF */
  const numFallas = fallas.length;
  let aclfGrade = "";
  let aclfText = "";

  if (numFallas === 0) {
    aclfGrade = "Sin ACLF";
    aclfText = "No se identifican fallas orgánicas mayores.";
  } else if (numFallas === 1) {
    if (
      fallas.includes("Renal") ||
      fallas.includes("Cerebral") ||
      disfunciones.length > 0
    ) {
      aclfGrade = "ACLF grado 1- Mortalidad 22%";
      aclfText = "Una falla orgánica con criterios compatibles con ACLF grado 1.";
    } else {
      aclfGrade = "Sin ACLF / evaluar contexto";
      aclfText = "Existe una falla aislada, pero debe interpretarse según contexto clínico.";
    }
  } else if (numFallas === 2) {
    aclfGrade = "ACLF grado 2- Mortalidad 32%";
    aclfText = "Dos fallas orgánicas.";
  } else {
    aclfGrade = "ACLF grado 3 -Mortalidad 73%";
    aclfText = "Tres o más fallas orgánicas.";
  }

  const fallasTexto = fallas.length
    ? fallas.join(", ")
    : "No se identifican fallas orgánicas mayores";


  setClifHTML(
    "resultadoClifSofa",
    `
      <b>CLIF-SOFA total:</b> ${score} puntos<br>
      <b>Clasificación:</b> ${aclfGrade}
    `
  );

  setClifHTML(
    "interpretacionClifSofa",
    `
      <b>Interpretación:</b> ${aclfText}<br>
      <b>Fallas orgánicas:</b> ${fallasTexto}<br>
      <b>Disfunciones:</b> ${disfuncionesTexto}<br>
      <b>Desglose:</b>
      Hígado ${liverScore},
      Riñón ${kidneyScore},
      Cerebro ${brainScore},
      Coagulación ${coagScore},
      Circulación ${circScore},
      Respiración ${respScore}${respType ? ` (${respType}: ${respValue})` : ""}.
    `
  );
}

function resetClifSofaAclf() {
  const inputs = [
    "clif_bili",
    "clif_creat",
    "clif_inr",
    "clif_map",
    "clif_pafi",
    "clif_spofi"
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const selects = ["clif_rrt", "clif_he", "clif_vaso"];

  selects.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });

  setClifHTML("resultadoClifSofa", "");
  setClifHTML("interpretacionClifSofa", "");
}

const plasmicInputs = document.querySelectorAll('.plasmic-table input');
const plasmicScore = document.getElementById('plasmicScore');
const plasmicRisk = document.getElementById('plasmicRisk');

plasmicInputs.forEach(input => {
  input.addEventListener('change', calculatePlasmicScore);
});

function calculatePlasmicScore() {
  let score = 0;

  plasmicInputs.forEach(input => {
    if (input.checked) {
      score += Number(input.value);
    }
  });

  plasmicScore.textContent = score;

  if (score <= 4) {
    plasmicRisk.textContent = 'Score 0–4 – low risk of severe ADAMTS13 deficiency';
  } else if (score === 5) {
    plasmicRisk.textContent = 'Score 5 – intermediate risk of severe ADAMTS13 deficiency';
  } else {
    plasmicRisk.textContent = 'Score 6 or 7 – high risk of severe ADAMTS13 deficiency';
  }
}
