/* ================= CAM-ICU ================= */

function calcCAM(){

const s1 = parseInt(document.getElementById("cam_step1").value);
const s2 = parseInt(document.getElementById("cam_step2").value);
const s3 = parseInt(document.getElementById("cam_step3").value);
const s4 = parseInt(document.getElementById("cam_step4").value);

const resultBox = document.getElementById("resultadoCAMICU");

if(isNaN(s1) || isNaN(s2) || isNaN(s3) || isNaN(s4)){
resultBox.innerHTML = "Please complete all CAM-ICU steps.";
return;
}

let result = "";
let detail = "";

if(s1 === 0){
result = "CAM-ICU NEGATIVE";
detail = "Step 1 negative → Delirium ruled out.";
}
else if(s1 === 1 && s2 === 1 && (s3 === 1 || s4 === 1)){
result = "CAM-ICU POSITIVE";
detail = "Criteria met: 1 + 2 + (3 or 4). Delirium present.";
}
else{
result = "CAM-ICU NEGATIVE";
detail = "Criteria not fully met.";
}

resultBox.innerHTML =
"<strong>" + result + "</strong><br>" + detail;
}

function resetCAM(){
document.querySelectorAll("#camicu select").forEach(el=>el.value="");
document.getElementById("resultadoCAMICU").innerHTML="";
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
