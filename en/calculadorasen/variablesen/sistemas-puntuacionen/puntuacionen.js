/* =========================================================
   COMMON UTILITIES
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

  result.innerHTML = `<b>SOFA total:</b> ${total} points`;

  let mortText = "";
  if (total === 0) mortText = "No organ dysfunction.";
  else if (total <= 6) mortText = "Low to moderate mortality risk.";
  else if (total <= 9) mortText = "Intermediate mortality risk.";
  else if (total <= 12) mortText = "High mortality risk.";
  else mortText = "Very high mortality risk.";

  mortality.textContent = mortText;

  if (breakdown.length > 0) {
    let html = "<b>Breakdown by affected organ systems:</b><ul>";
    breakdown.forEach(item => {
      html += `<li>${item.system}: ${item.points} point${item.points > 1 ? "s" : ""}</li>`;
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
  const aps = sumBySelector(".apache");

  const ageEl = document.getElementById("apache_age");
  const age = ageEl ? Number(ageEl.value || 0) : 0;

  const chronicEl = document.getElementById("apache_chronic");
  const chronic = chronicEl ? Number(chronicEl.value || 0) : 0;

  const total = aps + age + chronic;

  document.getElementById("apache_result").textContent =
    `APACHE II total: ${total} (APS: ${aps})`;

  document.getElementById("apache_mortality").textContent =
    total < 10 ? "Estimated mortality <10%" :
    total < 20 ? "Estimated mortality 15–25%" :
    total < 30 ? "Estimated mortality 40–55%" :
                 "Estimated mortality >75%";
}

function resetAPACHE(){
  resetBySelector(".apache");
  document.getElementById("apache_age").selectedIndex = 0;
  document.getElementById("apache_chronic").selectedIndex = 0;
  document.getElementById("apache_result").textContent = "";
  document.getElementById("apache_mortality").textContent = "";
}

/* =========================================================
   SAPS II
========================================================= */
function calcSAPS(){
  const score = sumBySelector(".saps");

  document.getElementById("saps_result").textContent =
    `SAPS II total: ${score}`;

  const logit = (score - 32.6659) / 7.3068;
  const mortality = 100 / (1 + Math.exp(-logit));

  document.getElementById("saps_mortality").textContent =
    `Estimated hospital mortality: ${mortality.toFixed(1)}%`;
}

function resetSAPS(){
  resetBySelector(".saps");
  document.getElementById("saps_result").textContent = "";
  document.getElementById("saps_mortality").textContent = "";
}

/* =========================================================
   SOFA-1 CLASSIC
========================================================= */
function calcSOFA1(){
  const selects = document.querySelectorAll(".sofa1");
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

  const result = document.getElementById("sofa1_result");
  const mortality = document.getElementById("sofa1_mortality");
  const detail = document.getElementById("sofa1_breakdown");

  result.innerHTML = `<b>SOFA-1 total:</b> ${total} points`;

  mortality.textContent =
    total <= 1  ? "Estimated mortality <10%" :
    total <= 5  ? "Estimated mortality 10–20%" :
    total <= 9  ? "Estimated mortality 20–40%" :
    total <= 12 ? "Estimated mortality 40–50%" :
                  "Estimated mortality >50–90%";

  if (breakdown.length > 0) {
    let html = "<b>Breakdown by affected organ systems:</b><ul>";
    breakdown.forEach(item => {
      html += `<li>${item.system}: ${item.points} point${item.points > 1 ? "s" : ""}</li>`;
    });
    html += "</ul>";

    detail.innerHTML = html;
    detail.style.display = "block";
  } else {
    detail.style.display = "none";
  }
}

function resetSOFA1(){
  resetBySelector(".sofa1");

  document.getElementById("sofa1_result").textContent = "";
  document.getElementById("sofa1_mortality").textContent = "";

  const detail = document.getElementById("sofa1_breakdown");
  if (detail) detail.style.display = "none";
}

/* =========================================================
   PESI
========================================================= */
let pesiTotal = 0;
let pesiClase = "";

document.getElementById("pesi_calc").addEventListener("click", () => {

  const age = parseInt(document.getElementById("pesi_age").value) || 0;

  const fields = [
    "pesi_male",
    "pesi_cancer",
    "pesi_chf",
    "pesi_copd",
    "pesi_hr",
    "pesi_sbp",
    "pesi_rr",
    "pesi_temp",
    "pesi_mental",
    "pesi_sat"
  ];

  let sum = age;

  fields.forEach(id => {
    sum += parseInt(document.getElementById(id).value);
  });

  pesiTotal = sum;

  let clase = "";
  let riesgo = "";

  if (sum <= 65) {
    clase = "I";
    riesgo = "Very low risk (0–1.6%)";
  } else if (sum <= 85) {
    clase = "II";
    riesgo = "Low risk (1.7–3.5%)";
  } else if (sum <= 105) {
    clase = "III";
    riesgo = "Intermediate risk (3.2–7.1%)";
  } else if (sum <= 125) {
    clase = "IV";
    riesgo = "High risk (4–11.4%)";
  } else {
    clase = "V";
    riesgo = "Very high risk (10–24.5%)";
  }

  pesiClase = clase;

  document.getElementById("resultadoPESI").textContent =
    `PESI: ${sum} points (Class ${clase})`;

  document.getElementById("interpretacionPESI").textContent = riesgo;
});

document.getElementById("pesi_reset").addEventListener("click", () => {
  document.querySelectorAll("#tep-risk select, #tep-risk input")
    .forEach(el => el.value = el.tagName === "INPUT" ? "" : "0");

  pesiTotal = 0;
  pesiClase = "";

  document.getElementById("resultadoPESI").textContent = "";
  document.getElementById("interpretacionPESI").textContent = "";
  document.getElementById("resultadoTEP").textContent = "";
  document.getElementById("interpretacionTEP").textContent = "";
});

/* =========================================================
   GLOBAL PE RISK CLASSIFICATION
========================================================= */
document.getElementById("tep_calc").addEventListener("click", () => {

  const hemo = document.getElementById("tep_hemo").value;
  const vd = document.getElementById("tep_vd").value;
  const trop = document.getElementById("tep_trop").value;

  let riesgo = "";
  let interpretacion = "";

  if (hemo === "1") {
    riesgo = "HIGH RISK";
    interpretacion = "Urgent reperfusion therapy should be considered.";
  }
  else if ((pesiClase === "III" || pesiClase === "IV" || pesiClase === "V")
           && vd === "1" && trop === "1") {
    riesgo = "INTERMEDIATE-HIGH RISK";
    interpretacion = "Close monitoring is recommended due to risk of clinical deterioration.";
  }
  else if ((pesiClase === "III" || pesiClase === "IV" || pesiClase === "V")
           && (vd === "1" || trop === "1")) {
    riesgo = "INTERMEDIATE-LOW RISK";
    interpretacion = "Only one marker is positive.";
  }
  else {
    riesgo = "LOW RISK";
    interpretacion = "Low early mortality risk.";
  }

  document.getElementById("resultadoTEP").textContent = riesgo;
  document.getElementById("interpretacionTEP").textContent = interpretacion;
});

/* =========================================================
   PE AHA/ACC 2026
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
    title: "Category A",
    subtitle: "Subclinical",
    summary: "Incidental or subclinical pulmonary embolism without symptoms.",
    management: [
      { cor: "COR 1", text: "Start anticoagulation with a DOAC if there are no contraindications." },
      { cor: "COR 1", text: "Use HESTIA, PESI, and/or sPESI to assess short-term risk." },
      { cor: "COR 2a", text: "Use a clinical decision tool to identify eligibility for outpatient management." }
    ]
  },

  B1: {
    title: "Category B1",
    subtitle: "Symptomatic low-risk · Subsegmental",
    summary: "Symptomatic low-risk pulmonary embolism with subsegmental involvement.",
    management: [
      { cor: "COR 1", text: "Start anticoagulation with a DOAC if there are no contraindications." },
      { cor: "COR 1", text: "Use HESTIA, PESI, and/or sPESI to assess short-term risk." },
      { cor: "COR 2a", text: "Use a clinical decision tool to identify eligibility for outpatient management." }
    ]
  },

  B2: {
    title: "Category B2",
    subtitle: "Symptomatic low-risk · Segmental / non-subsegmental",
    summary: "Symptomatic low-risk pulmonary embolism with segmental or non-subsegmental location.",
    management: [
      { cor: "COR 1", text: "Start anticoagulation with a DOAC if there are no contraindications." },
      { cor: "COR 1", text: "Use HESTIA, PESI, and/or sPESI to assess short-term risk." },
      { cor: "COR 2a", text: "Use a clinical decision tool to identify eligibility for outpatient management." }
    ]
  },

  C1: {
    title: "Category C1",
    subtitle: "Symptomatic · High-risk score · Normal RV + normal biomarkers",
    summary: "Symptomatic pulmonary embolism with high-risk PESI/sPESI, without RV dysfunction or biomarker elevation.",
    management: [
      { cor: "COR 1", text: "Start LMWH." },
      { cor: "COR 1", text: "Measure at least one cardiac biomarker." },
      { cor: "COR 1", text: "Measure lactate." },
      { cor: "COR 1", text: "Assess right ventricular size and function using CT and/or echocardiography." },
      { cor: "COR 2a", text: "Use a validated score to identify patients at higher risk." },
      { cor: "COR 1", text: "Perform multidisciplinary PERT-style assessment to guide clinical management." }
    ]
  },

  C2: {
    title: "Category C2",
    subtitle: "Symptomatic · High-risk score · Abnormal RV or elevated biomarkers",
    summary: "Symptomatic pulmonary embolism with high-risk PESI/sPESI and either RV dysfunction or elevated biomarkers.",
    management: [
      { cor: "COR 1", text: "Start LMWH." },
      { cor: "COR 1", text: "Measure at least one cardiac biomarker." },
      { cor: "COR 1", text: "Measure lactate." },
      { cor: "COR 1", text: "Assess right ventricular size and function using CT and/or echocardiography." },
      { cor: "COR 2a", text: "Use a validated score to identify patients at higher risk." },
      { cor: "COR 1", text: "Perform multidisciplinary PERT-style assessment to guide clinical management." }
    ]
  },

  C3: {
    title: "Category C3",
    subtitle: "Symptomatic · High-risk score · Abnormal RV + biomarkers + respiratory modifier",
    summary: "Symptomatic pulmonary embolism with high-risk PESI/sPESI, RV dysfunction, biomarker elevation, and respiratory compromise.",
    management: [
      { cor: "COR 1", text: "Start LMWH." },
      { cor: "COR 1", text: "Measure at least one cardiac biomarker." },
      { cor: "COR 1", text: "Measure lactate." },
      { cor: "COR 1", text: "Assess right ventricular size and function using CT and/or echocardiography." },
      { cor: "COR 2a", text: "Use a validated score to identify patients at higher risk." },
      { cor: "COR 1", text: "Perform multidisciplinary PERT-style assessment to guide clinical management." }
    ]
  },

  D1: {
    title: "Category D1",
    subtitle: "Impending cardiopulmonary failure · Transient hypotension",
    summary: "Pulmonary embolism with impending cardiopulmonary failure and transient hypotension.",
    management: [
      { cor: "COR 1", text: "Start LMWH." },
      { cor: "COR 1", text: "Measure lactate." },
      { cor: "COR 1", text: "Assess right ventricular size and function using CT and/or echocardiography." },
      { cor: "COR 1", text: "Perform multidisciplinary PERT-style assessment to guide clinical management." },
      { cor: "COR 1", text: "Provide noninvasive ventilatory support or high-flow oxygen supplementation if clinically indicated." },
      { cor: "COR 2b", text: "Consider systemic thrombolysis if bleeding risk is acceptable, or catheter-directed thrombolysis / mechanical thrombectomy in appropriate cases." }
    ]
  },

  D2: {
    title: "Category D2",
    subtitle: "Impending cardiopulmonary failure · Normotensive shock",
    summary: "Pulmonary embolism with signs of hypoperfusion and normotensive shock, usually with lactate >2 mmol/L.",
    management: [
      { cor: "COR 1", text: "Start LMWH." },
      { cor: "COR 1", text: "Measure lactate." },
      { cor: "COR 1", text: "Assess right ventricular size and function using CT and/or echocardiography." },
      { cor: "COR 2a", text: "Recognize and evaluate normotensive shock." },
      { cor: "COR 1", text: "Perform multidisciplinary PERT-style assessment to guide clinical management." },
      { cor: "COR 1", text: "Start vasopressors and/or inotropes if clinically indicated." },
      { cor: "COR 1", text: "Provide noninvasive ventilatory support or high-flow oxygen supplementation if clinically indicated." },
      { cor: "COR 2b", text: "Consider systemic thrombolysis if bleeding risk is acceptable, or catheter-directed thrombolysis / mechanical thrombectomy in appropriate cases." }
    ]
  },

  E1: {
    title: "Category E1",
    subtitle: "Cardiopulmonary failure · Persistent hypotension / cardiogenic shock",
    summary: "Pulmonary embolism with established cardiopulmonary failure, persistent hypotension, or cardiogenic shock.",
    management: [
      { cor: "COR 1", text: "Start LMWH." },
      { cor: "COR 1", text: "Measure lactate." },
      { cor: "COR 1", text: "Assess right ventricular size and function using CT and/or echocardiography when feasible." },
      { cor: "COR 1", text: "Perform multidisciplinary PERT-style assessment to guide clinical management." },
      { cor: "COR 1", text: "Start vasopressors and/or inotropes if clinically indicated." },
      { cor: "COR 2a", text: "Consider systemic thrombolysis if bleeding risk is acceptable, catheter-directed thrombolysis, mechanical thrombectomy, or surgical embolectomy." }
    ]
  },

  E2: {
    title: "Category E2",
    subtitle: "Cardiopulmonary failure · Refractory cardiogenic shock or cardiac arrest",
    summary: "Very-high-risk pulmonary embolism with refractory shock or cardiac arrest; hypoxemic respiratory failure or ventilatory failure may coexist.",
    management: [
      { cor: "COR 1", text: "Start LMWH or UFH depending on clinical context and potential need for procedures." },
      { cor: "COR 1", text: "Measure lactate." },
      { cor: "COR 1", text: "Perform multidisciplinary PERT-style assessment to guide clinical management." },
      { cor: "COR 1", text: "Start vasopressors and/or inotropes if clinically indicated." },
      { cor: "COR 2a", text: "Consider VA-ECMO support in appropriate scenarios." },
      { cor: "COR 2a", text: "Consider systemic thrombolysis if bleeding risk is acceptable." }
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
    result.innerHTML = "<b>Unable to classify.</b>";
    summary.textContent = "Review the entered data.";
    logic.innerHTML = "";
    logic.style.display = "none";
    management.innerHTML = "";
    return;
  }

  result.innerHTML = `<b>${cat.title}</b> · ${cat.subtitle}`;
  summary.textContent = cat.summary;

  logic.innerHTML = `
    <b>Applied logic:</b>
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
    result.innerHTML = "<b>Please select the clinical presentation.</b>";
    summary.textContent = "";
    logic.innerHTML = "";
    logic.style.display = "none";
    management.innerHTML = "";
    return;
  }

  let category = "";
  let logicSteps = [];

  if (refractory) {
    category = "E2";
    logicSteps.push("Refractory cardiogenic shock or cardiac arrest → E2.");
    if (resp || highO2) {
      logicSteps.push("Hypoxemic respiratory failure or ventilatory failure may coexist.");
    }
  } else if (cardioShock) {
    category = "E1";
    logicSteps.push("Persistent hypotension or cardiogenic shock → E1.");
    if (resp || highO2) {
      logicSteps.push("Hypoxemic respiratory failure or ventilatory failure may coexist.");
    }
  }

  else if (normoShock) {
    category = "D2";
    logicSteps.push("Normotensive shock with signs of hypoperfusion, typically lactate >2 mmol/L → D2.");
    if (highO2) {
      logicSteps.push("Oxygen requirement >6 L/min or noninvasive ventilatory support is present.");
    }
  } else if (transientHypo) {
    category = "D1";
    logicSteps.push("Transient hypotension → D1.");
    if (highO2) {
      logicSteps.push("Oxygen requirement >6 L/min or noninvasive ventilatory support is present.");
    }
  }

  else if (presentation === "subclinical") {
    category = "A";
    logicSteps.push("Subclinical / incidental PE → Category A.");
  }

  else if (presentation === "symptomatic" && severity === "low") {
    if (bType === "B1") {
      category = "B1";
      logicSteps.push("Symptomatic low-risk PE by PESI/sPESI.");
      logicSteps.push("Subsegmental location → B1.");
    } else {
      category = "B2";
      logicSteps.push("Symptomatic low-risk PE by PESI/sPESI.");
      logicSteps.push("Segmental or non-subsegmental location → B2.");
    }
  }

  else if (presentation === "symptomatic" && severity === "high") {
    if (!rv && !biomarker) {
      category = "C1";
      logicSteps.push("Symptomatic PE with high-risk PESI/sPESI.");
      logicSteps.push("Normal right ventricle and normal biomarkers → C1.");
    } else if (rv && biomarker && resp) {
      category = "C3";
      logicSteps.push("Symptomatic PE with high-risk PESI/sPESI.");
      logicSteps.push("RV dysfunction + elevated biomarkers + respiratory modifier → C3.");
    } else if (rv || biomarker) {
      category = "C2";
      logicSteps.push("Symptomatic PE with high-risk PESI/sPESI.");
      logicSteps.push("RV dysfunction or elevated biomarkers → C2.");
      if (resp) {
        logicSteps.push("Respiratory modifier is present, but full simultaneous C3 criteria are not met.");
      }
    }
  }

  if (!category) {
    result.innerHTML = "<b>Unable to classify PE.</b>";
    summary.textContent = "Review the combination of entered variables.";
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

/* =========================================================
   CLIF-SOFA / CLIF-C ACLF
========================================================= */
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
      "Complete bilirubin, creatinine, hepatic encephalopathy, INR, and MAP."
    );
    setClifHTML("interpretacionClifSofa", "");
    return;
  }

  let score = 0;
  let fallas = [];
  let disfunciones = [];

  let liverScore = 0;

  if (bili < 1.2) liverScore = 0;
  else if (bili < 2) liverScore = 1;
  else if (bili < 6) liverScore = 2;
  else if (bili < 12) liverScore = 3;
  else liverScore = 4;

  score += liverScore;

  if (bili >= 12) fallas.push("Liver failure");
  else if (bili >= 6) disfunciones.push("Liver dysfunction");

  let kidneyScore = 0;

  if (rrt === "si" || creat >= 3.5) kidneyScore = 4;
  else if (creat >= 2) kidneyScore = 3;
  else if (creat >= 1.5) kidneyScore = 2;
  else if (creat >= 1.2) kidneyScore = 1;
  else kidneyScore = 0;

  score += kidneyScore;

  if (rrt === "si" || creat >= 2) fallas.push("Renal failure");
  else if (creat >= 1.5) disfunciones.push("Renal dysfunction");

  let brainScore = he;
  score += brainScore;

  if (he >= 3) fallas.push("Cerebral failure");
  else if (he >= 1) disfunciones.push("Grade I–II encephalopathy");

  let coagScore = 0;

  if (inr < 1.1) coagScore = 0;
  else if (inr < 1.25) coagScore = 1;
  else if (inr < 1.5) coagScore = 2;
  else if (inr < 2.5) coagScore = 3;
  else coagScore = 4;

  score += coagScore;

  if (inr >= 2.5) fallas.push("Coagulation failure");
  else if (inr >= 1.5) disfunciones.push("Coagulation dysfunction");

  let circScore = 0;

  if (vaso === "si") circScore = 4;
  else if (map < 70) circScore = 1;
  else circScore = 0;

  score += circScore;

  if (vaso === "si") fallas.push("Circulatory failure");
  else if (map < 70) disfunciones.push("Circulatory dysfunction");

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

    if (pafi <= 200) fallas.push("Respiratory failure");
    else if (pafi <= 300) disfunciones.push("Respiratory dysfunction");
  } else if (spofi !== null) {
    respValue = spofi;
    respType = "SpO₂/FiO₂";

    if (spofi > 357) respScore = 0;
    else if (spofi > 214) respScore = 1;
    else if (spofi > 89) respScore = 2;
    else if (spofi > 50) respScore = 3;
    else respScore = 4;

    if (spofi <= 214) fallas.push("Respiratory failure");
    else if (spofi <= 357) disfunciones.push("Respiratory dysfunction");
  }

  score += respScore;

  const numFallas = fallas.length;
  let aclfGrade = "";
  let aclfText = "";

  if (numFallas === 0) {
    aclfGrade = "No ACLF";
    aclfText = "No major organ failures are identified.";
  } else if (numFallas === 1) {
    if (
      fallas.includes("Renal failure") ||
      fallas.includes("Cerebral failure") ||
      disfunciones.length > 0
    ) {
      aclfGrade = "ACLF grade 1 – mortality 22%";
      aclfText = "One organ failure with criteria compatible with ACLF grade 1.";
    } else {
      aclfGrade = "No ACLF / assess clinical context";
      aclfText = "An isolated organ failure is present, but it should be interpreted according to the clinical context.";
    }
  } else if (numFallas === 2) {
    aclfGrade = "ACLF grade 2 – mortality 32%";
    aclfText = "Two organ failures are present.";
  } else {
    aclfGrade = "ACLF grade 3 – mortality 73%";
    aclfText = "Three or more organ failures are present.";
  }

  const fallasTexto = fallas.length
    ? fallas.join(", ")
    : "No major organ failures identified";

  const disfuncionesTexto = disfunciones.length
    ? disfunciones.join(", ")
    : "No additional organ dysfunctions identified";

  setClifHTML(
    "resultadoClifSofa",
    `
      <b>CLIF-SOFA total:</b> ${score} points<br>
      <b>Classification:</b> ${aclfGrade}
    `
  );

  setClifHTML(
    "interpretacionClifSofa",
    `
      <b>Interpretation:</b> ${aclfText}<br>
      <b>Organ failures:</b> ${fallasTexto}<br>
      <b>Dysfunctions:</b> ${disfuncionesTexto}<br>
      <b>Breakdown:</b>
      Liver ${liverScore},
      Kidney ${kidneyScore},
      Brain ${brainScore},
      Coagulation ${coagScore},
      Circulation ${circScore},
      Respiration ${respScore}${respType ? ` (${respType}: ${respValue})` : ""}.
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

/* =========================================================
   PLASMIC SCORE
========================================================= */
const plasmicInputs = document.querySelectorAll(".plasmic-table input");
const plasmicScore = document.getElementById("plasmicScore");
const plasmicRisk = document.getElementById("plasmicRisk");

plasmicInputs.forEach(input => {
  input.addEventListener("change", calculatePlasmicScore);
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
    plasmicRisk.textContent = "Score 0–4 – low risk of severe ADAMTS13 deficiency";
  } else if (score === 5) {
    plasmicRisk.textContent = "Score 5 – intermediate risk of severe ADAMTS13 deficiency";
  } else {
    plasmicRisk.textContent = "Score 6 or 7 – high risk of severe ADAMTS13 deficiency";
  }
}
