/* ================= CAM-ICU ================= */

/* ===== STEP 1 ===== */
function handleStep1() {

  const s1 = document.getElementById("cam_step1").value;
  const resultBox = document.getElementById("resultadoCAMICU");

  resetBelowStep1();

  if (s1 === "1") {
    document.getElementById("cam_step2_container").style.display = "block";
  }

  if (s1 === "0") {
    resultBox.innerHTML =
      "<strong style='color:#10b981'>CAM-ICU NEGATIVE</strong><br>Step 1 negative → Delirium ruled out.";
  }
}

/* ===== STEP 2 ===== */
function handleStep2() {

  const s2 = document.getElementById("cam_step2").value;
  const resultBox = document.getElementById("resultadoCAMICU");

  resetBelowStep2();

  if (s2 === "1") {
    document.getElementById("cam_step3_container").style.display = "block";
    document.getElementById("cam_step4_container").style.display = "block";
  }

  if (s2 === "0") {
    resultBox.innerHTML =
      "<strong style='color:#10b981'>CAM-ICU NEGATIVE</strong><br>Step 2 negative → Delirium ruled out.";
  }
}

/* ===== AUTO EVALUATION STEP 3 & 4 ===== */
function autoEvaluate() {

  const s1 = parseInt(document.getElementById("cam_step1").value);
  const s2 = parseInt(document.getElementById("cam_step2").value);
  const s3 = parseInt(document.getElementById("cam_step3").value);
  const s4 = parseInt(document.getElementById("cam_step4").value);

  const resultBox = document.getElementById("resultadoCAMICU");

  if (isNaN(s3) || isNaN(s4)) return;

  if (s1 === 1 && s2 === 1 && (s3 === 1 || s4 === 1)) {
    resultBox.innerHTML =
      "<strong style='color:#ef4444'>CAM-ICU POSITIVE</strong><br>Criteria met: 1 + 2 + (3 or 4). Delirium present.";
  } else {
    resultBox.innerHTML =
      "<strong style='color:#10b981'>CAM-ICU NEGATIVE</strong><br>Criteria not fully met.";
  }
}

/* ===== RESETS ===== */

function resetBelowStep1() {

  document.getElementById("cam_step2_container").style.display = "none";
  document.getElementById("cam_step3_container").style.display = "none";
  document.getElementById("cam_step4_container").style.display = "none";

  document.getElementById("cam_step2").value = "";
  document.getElementById("cam_step3").value = "";
  document.getElementById("cam_step4").value = "";

  document.getElementById("resultadoCAMICU").innerHTML = "";
}

function resetBelowStep2() {

  document.getElementById("cam_step3_container").style.display = "none";
  document.getElementById("cam_step4_container").style.display = "none";

  document.getElementById("cam_step3").value = "";
  document.getElementById("cam_step4").value = "";

  document.getElementById("resultadoCAMICU").innerHTML = "";
}



/* =========================
   NIHSS CALCULATION
========================= */

document.getElementById("nihss_calc").addEventListener("click", calcNIHSS);
document.getElementById("nihss_reset").addEventListener("click", resetNIHSS);

function calcNIHSS() {

  const ids = [
    "n_1a","n_1b","n_1c","n_2","n_3","n_4",
    "n_5a","n_5b","n_6a","n_6b",
    "n_7","n_8","n_9","n_10","n_11"
  ];

  let total = 0;
  let incomplete = false;

  let values = {};

  ids.forEach(id => {
    const val = document.getElementById(id).value;

    if (val === "") {
      incomplete = true;
    } else {
      const num = parseInt(val);
      total += num;
      values[id] = num;
    }
  });

  if (incomplete) {
    document.getElementById("resultadoNIHSS").innerHTML =
      "⚠️ Complete todos los ítems antes de calcular.";
    document.getElementById("interpretacionNIHSS").innerHTML = "";
    return;
  }

  /* ========================
     SEVERITY CLASSIFICATION
  ======================== */

  let severity = "";

  if (total === 0) severity = "Sin síntomas de ACV";
  else if (total <= 4) severity = "ACV leve";
  else if (total <= 15) severity = "ACV moderado";
  else if (total <= 20) severity = "ACV moderado-severo";
  else severity = "ACV severo";

  /* ========================
     DISABLING SYMPTOMS
  ======================== */

  let disabling = false;
  let reasons = [];

  // Hemianopsia significativa
  if (values["n_3"] >= 2) {
    disabling = true;
    reasons.push("hemianopsia");
  }

  // Afasia
  if (values["n_9"] >= 1) {
    disabling = true;
    reasons.push("afasia");
  }

  // Neglect
  if (values["n_11"] >= 1) {
    disabling = true;
    reasons.push("neglect");
  }

  // Motor contra gravedad (≥2)
  if (
    values["n_5a"] >= 2 ||
    values["n_5b"] >= 2 ||
    values["n_6a"] >= 2 ||
    values["n_6b"] >= 2
  ) {
    disabling = true;
    reasons.push("déficit motor contra gravedad");
  }

  /* ========================
     OUTPUT
  ======================== */

  document.getElementById("resultadoNIHSS").innerHTML =
    "Puntaje total NIHSS: <strong>" + total + "</strong>";

  let interpretation =
    "Clasificación: <strong>" + severity + "</strong><br><br>";

  if (disabling) {
    interpretation +=
      "⚠️ <strong>ACV discapacitante</strong> por presencia de: " +
      reasons.join(", ") + ".";
  } else {
    interpretation +=
      "✅ No presenta criterios de ACV discapacitante.";
  }

  document.getElementById("interpretacionNIHSS").innerHTML = interpretation;
}

/* =========================
   RESET
========================= */

function resetNIHSS() {
  const ids = [
    "n_1a","n_1b","n_1c","n_2","n_3","n_4",
    "n_5a","n_5b","n_6a","n_6b",
    "n_7","n_8","n_9","n_10","n_11"
  ];

  ids.forEach(id => {
    document.getElementById(id).value = "";
  });

  document.getElementById("resultadoNIHSS").innerHTML = "";
  document.getElementById("interpretacionNIHSS").innerHTML = "";
}
