/* =====================================================
   ICU SEVERITY SCORES
   SOFA-2 · APACHE II · SAPS II
===================================================== */

function sumSelects(className) {
  let total = 0;
  const elements = document.querySelectorAll("." + className);

  elements.forEach(el => {
    if (el.value !== "") {
      total += parseInt(el.value, 10);
    }
  });

  return total;
}

/* =====================================================
   SOFA-2
===================================================== */

function calcSOFA() {
  const systems = [
    "Neurologic",
    "Respiratory",
    "Cardiovascular",
    "Hepatic",
    "Renal",
    "Coagulation"
  ];

  const selects = document.querySelectorAll(".sofa");

  let total = 0;
  let breakdown = "";

  selects.forEach((el, index) => {
    const value = el.value === "" ? 0 : parseInt(el.value, 10);
    total += value;
    breakdown += `<strong>${systems[index]}:</strong> ${value} points<br>`;
  });

  document.getElementById("sofa_result").innerHTML =
    `<strong>Total SOFA-2 Score: ${total}</strong><br><br>${breakdown}`;

  let mortality;

  if (total <= 6) mortality = "Low mortality risk (<10%)";
  else if (total <= 9) mortality = "Moderate mortality risk (~15–20%)";
  else if (total <= 12) mortality = "High mortality risk (~40–50%)";
  else mortality = "Very high mortality risk (>80%)";

  document.getElementById("sofa_mortality").innerHTML =
    `Estimated ICU mortality: <strong>${mortality}</strong>`;
}

function resetSOFA() {
  document.querySelectorAll(".sofa").forEach(el => el.value = "");
  document.getElementById("sofa_result").innerHTML = "";
  document.getElementById("sofa_mortality").innerHTML = "";
}

/* =====================================================
   APACHE II
===================================================== */

function calcAPACHE() {
  let score = sumSelects("apache");

  const age = document.getElementById("apache_age").value;
  const chronic = document.getElementById("apache_chronic").value;

  if (age !== "") score += parseInt(age, 10);
  if (chronic !== "") score += parseInt(chronic, 10);

  document.getElementById("apache_result").innerHTML =
    `<strong>Total APACHE II Score: ${score}</strong>`;

  let mortality;

  if (score < 10) mortality = "~5% hospital mortality";
  else if (score < 15) mortality = "~10–15% hospital mortality";
  else if (score < 20) mortality = "~25% hospital mortality";
  else if (score < 25) mortality = "~40% hospital mortality";
  else if (score < 30) mortality = "~55% hospital mortality";
  else if (score < 35) mortality = "~75% hospital mortality";
  else mortality = ">85% hospital mortality";

  document.getElementById("apache_mortality").innerHTML =
    `Estimated hospital mortality based on APACHE II: <strong>${mortality}</strong>`;
}

function resetAPACHE() {
  document.querySelectorAll(".apache").forEach(el => el.value = "");
  document.getElementById("apache_age").value = "";
  document.getElementById("apache_chronic").value = "";
  document.getElementById("apache_result").innerHTML = "";
  document.getElementById("apache_mortality").innerHTML = "";
}

/* =====================================================
   SAPS II
===================================================== */

function calcSAPS() {
  const score = sumSelects("saps");

  document.getElementById("saps_result").innerHTML =
    `<strong>Total SAPS II Score: ${score}</strong>`;

  const logit =
    -7.7631 +
    (0.0737 * score) +
    (0.9971 * Math.log(score + 1));

  const mortality = Math.exp(logit) / (1 + Math.exp(logit));
  const mortalityPercent = (mortality * 100).toFixed(1);

  let interpretation;

  if (mortalityPercent < 10) {
    interpretation = "Low predicted mortality";
  } else if (mortalityPercent < 30) {
    interpretation = "Moderate predicted mortality";
  } else if (mortalityPercent < 60) {
    interpretation = "High predicted mortality";
  } else {
    interpretation = "Very high predicted mortality";
  }

  document.getElementById("saps_mortality").innerHTML =
    `Predicted hospital mortality: <strong>${mortalityPercent}%</strong><br>
     Interpretation: <strong>${interpretation}</strong>`;
}

function resetSAPS() {
  document.querySelectorAll(".saps").forEach(el => el.value = "");
  document.getElementById("saps_result").innerHTML = "";
  document.getElementById("saps_mortality").innerHTML = "";
}

/* =====================================================
   EXPORTS
===================================================== */
window.calcSOFA = calcSOFA;
window.resetSOFA = resetSOFA;
window.calcAPACHE = calcAPACHE;
window.resetAPACHE = resetAPACHE;
window.calcSAPS = calcSAPS;
window.resetSAPS = resetSAPS;

/* =========================
   CLIF-SOFA / ACLF Calculator
========================= */

function getClifNumber(id) {
  const el = document.getElementById(id);
  if (!el) return null;

  const value = Number(el.value);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function getClifValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setClifHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function calcularClifSofaAclf() {
  const bili = getClifNumber("clif_bili");
  const creat = getClifNumber("clif_creat");
  const rrt = getClifValue("clif_rrt");
  const he = Number(getClifValue("clif_he"));
  const inr = getClifNumber("clif_inr");
  const map = getClifNumber("clif_map");
  const vaso = getClifValue("clif_vaso");
  const pafi = getClifNumber("clif_pafi");
  const spofi = getClifNumber("clif_spofi");

  let score = 0;
  const fallas = [];
  const disfunciones = [];

  /* Liver */
  let liverScore = 0;

  if (bili !== null) {
    if (bili < 1.2) liverScore = 0;
    else if (bili < 2) liverScore = 1;
    else if (bili < 6) liverScore = 2;
    else if (bili < 12) liverScore = 3;
    else liverScore = 4;

    if (bili >= 12) fallas.push("Liver");
    else if (bili >= 6) disfunciones.push("Liver dysfunction");
  }

  score += liverScore;

  /* Kidney */
  let kidneyScore = 0;

  if (rrt === "si") {
    kidneyScore = 4;
    fallas.push("Kidney");
  } else if (creat !== null) {
    if (creat < 1.2) kidneyScore = 0;
    else if (creat < 2) kidneyScore = 1;
    else if (creat < 3.5) kidneyScore = 2;
    else if (creat < 5) kidneyScore = 3;
    else kidneyScore = 4;

    if (creat >= 2) fallas.push("Kidney");
    else if (creat >= 1.5) disfunciones.push("Kidney dysfunction");
  }

  score += kidneyScore;

  /* Brain */
  let brainScore = 0;

  if (he === 0) brainScore = 0;
  else if (he === 1) brainScore = 1;
  else if (he === 2) brainScore = 2;
  else if (he === 3) brainScore = 3;
  else if (he === 4) brainScore = 4;

  if (he >= 3) fallas.push("Cerebral");
  else if (he >= 1) disfunciones.push("Cerebral dysfunction");

  score += brainScore;

  /* Coagulation */
  let coagScore = 0;

  if (inr !== null) {
    if (inr < 1.1) coagScore = 0;
    else if (inr < 1.25) coagScore = 1;
    else if (inr < 1.5) coagScore = 2;
    else if (inr < 2.5) coagScore = 3;
    else coagScore = 4;

    if (inr >= 2.5) fallas.push("Coagulation");
    else if (inr >= 1.5) disfunciones.push("Coagulation dysfunction");
  }

  score += coagScore;

  /* Circulation */
  let circScore = 0;

  if (vaso === "si") {
    circScore = 4;
    fallas.push("Circulation");
  } else if (map !== null) {
    if (map >= 70) circScore = 0;
    else circScore = 1;

    if (map < 70) disfunciones.push("Circulatory dysfunction");
  }

  score += circScore;

  /* Respiration */
  let respScore = 0;
  let respType = "";
  let respValue = "";

  if (pafi !== null) {
    respType = "PaO₂/FiO₂";
    respValue = pafi;

    if (pafi >= 400) respScore = 0;
    else if (pafi >= 300) respScore = 1;
    else if (pafi >= 200) respScore = 2;
    else if (pafi >= 100) respScore = 3;
    else respScore = 4;

    if (pafi <= 200) fallas.push("Respiration");
    else if (pafi <= 300) disfunciones.push("Respiratory dysfunction");

  } else if (spofi !== null) {
    respType = "SpO₂/FiO₂";
    respValue = spofi;

    if (spofi >= 512) respScore = 0;
    else if (spofi >= 357) respScore = 1;
    else if (spofi >= 214) respScore = 2;
    else if (spofi >= 89) respScore = 3;
    else respScore = 4;

    if (spofi <= 214) fallas.push("Respiration");
    else if (spofi <= 357) disfunciones.push("Respiratory dysfunction");
  }

  score += respScore;

  const disfuncionesTexto = disfunciones.length
    ? disfunciones.join(", ")
    : "No relevant organ dysfunctions are identified";

  /* ACLF Classification */
  const numFallas = fallas.length;
  let aclfGrade = "";
  let aclfText = "";

  if (numFallas === 0) {
    aclfGrade = "No ACLF";
    aclfText = "No major organ failures are identified.";
  } else if (numFallas === 1) {
    if (
      fallas.includes("Kidney") ||
      fallas.includes("Cerebral") ||
      disfunciones.length > 0
    ) {
      aclfGrade = "ACLF grade 1 - Mortality 22%";
      aclfText = "One organ failure with criteria compatible with ACLF grade 1.";
    } else {
      aclfGrade = "No ACLF / assess clinical context";
      aclfText =
        "There is one isolated organ failure, but it should be interpreted according to the clinical context.";
    }
  } else if (numFallas === 2) {
    aclfGrade = "ACLF grade 2 - Mortality 32%";
    aclfText = "Two organ failures.";
  } else {
    aclfGrade = "ACLF grade 3 - Mortality 73%";
    aclfText = "Three or more organ failures.";
  }

  const fallasTexto = fallas.length
    ? fallas.join(", ")
    : "No major organ failures are identified";

  setClifHTML(
    "resultadoClifSofa",
    `
      <b>Total CLIF-SOFA:</b> ${score} points<br>
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
