console.log("hemodinamicoen.js loaded successfully");

/* =========================
   HELPERS
========================= */
function getNum(id) {
  const el = document.getElementById(id);
  if (!el) return null;

  const raw = String(el.value ?? "").trim();
  if (raw === "") return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function clearHTML(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = "";
}

function setResultState(id, state = "") {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove("result-ok", "result-warn", "result-bad");
  if (state) el.classList.add(state);
}

function showError(resultId, noteId, message) {
  setHTML(resultId, message);
  if (noteId) setHTML(noteId, "");
  setResultState(resultId, "result-warn");
}

/* =========================
   INITIAL CLEANUP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  [
    "resultadoGCEco",
    "interpretacionGCEco",
    "resultadoFA",
    "interpretacionFA",
    "resultadoOxigenacionDetalle",
    "resultadoRVS",
    "interpretacionRVS"
  ].forEach(clearHTML);

  [
    "resultadoGCEco",
    "resultadoFA",
    "resultadoOxigenacionDetalle",
    "resultadoRVS"
  ].forEach((id) => setResultState(id, ""));
});

/* =========================
   CARDIAC OUTPUT BY ECHO
========================= */
function calculateEchoCO() {
  const d = getNum("eco_dtsvi");
  const vti = getNum("eco_vti");
  const hr = getNum("eco_fc");

  if ([d, vti, hr].includes(null)) {
    showError("resultadoGCEco", "interpretacionGCEco", "Please complete all variables.");
    return;
  }

  if (d <= 0 || vti <= 0 || hr <= 0) {
    showError("resultadoGCEco", "interpretacionGCEco", "Values must be greater than 0.");
    return;
  }

  const co = ((Math.PI * (d / 2) ** 2) * vti * hr) / 1000;
  const co15 = co * 1.15;

  let interpretation = "";
  let resultClass = "";

  if (co < 4) {
    interpretation = "Low cardiac output.";
    resultClass = "result-bad";
  } else if (co <= 6) {
    interpretation = "Normal cardiac output.";
    resultClass = "result-ok";
  } else {
    interpretation = "Hyperdynamic state.";
    resultClass = "result-warn";
  }

  setHTML(
    "resultadoGCEco",
    `
    <strong>CO:</strong> ${co.toFixed(2)} L/min<br>
    <strong>CO +15% (fluid responder threshold):</strong> ${co15.toFixed(2)} L/min
    `
  );

  setHTML(
    "interpretacionGCEco",
    `
    ${interpretation} (Normal range: 4–6 L/min).<br>
    A patient may be considered a <strong>fluid responder</strong> if cardiac output increases by at least
    <strong>15%</strong>, reaching <strong>${co15.toFixed(2)} L/min</strong>.
    `
  );

  setResultState("resultadoGCEco", resultClass);
}

/* =========================
   FRACTIONAL SHORTENING
========================= */
function calculateFS() {
  const dd = getNum("fa_ddvi");
  const ds = getNum("fa_dsvi");

  if (dd === null || ds === null) {
    showError("resultadoFA", "interpretacionFA", "Please complete all variables.");
    return;
  }

  if (dd <= 0 || ds < 0) {
    showError("resultadoFA", "interpretacionFA", "Values must be valid and greater than 0.");
    return;
  }

  if (ds >= dd) {
    showError(
      "resultadoFA",
      "interpretacionFA",
      "End-systolic diameter must be lower than end-diastolic diameter."
    );
    return;
  }

  const fs = ((dd - ds) / dd) * 100;

  let interpretation = "";
  let resultClass = "";

  if (fs < 28) {
    interpretation = "Depressed systolic function.";
    resultClass = "result-bad";
  } else if (fs <= 45) {
    interpretation = "Preserved systolic function.";
    resultClass = "result-ok";
  } else {
    interpretation = "Hyperdynamic state.";
    resultClass = "result-warn";
  }

  setHTML("resultadoFA", `<strong>FS:</strong> ${fs.toFixed(1)} %`);
  setHTML("interpretacionFA", `${interpretation} (Normal: 28–45%)`);
  setResultState("resultadoFA", resultClass);
}

/* =========================
   OXYGEN DELIVERY / CONSUMPTION
========================= */
function calculateOxygenation() {
  const co = getNum("oxi_gc");
  const hb = getNum("oxi_hb");
  const sao2 = getNum("oxi_sao2");
  const pao2 = getNum("oxi_pao2");
  const svo2 = getNum("oxi_svo2");
  const pvo2 = getNum("oxi_pvo2");

  if ([co, hb, sao2, pao2, svo2, pvo2].includes(null)) {
    showError("resultadoOxigenacionDetalle", null, "Please complete all variables.");
    return;
  }

  if (
    co <= 0 ||
    hb <= 0 ||
    sao2 < 0 || sao2 > 100 ||
    svo2 < 0 || svo2 > 100 ||
    pao2 < 0 ||
    pvo2 < 0
  ) {
    showError(
      "resultadoOxigenacionDetalle",
      null,
      "Enter valid values. Saturations must be between 0 and 100."
    );
    return;
  }

  const CaO2 = hb * 1.34 * (sao2 / 100) + pao2 * 0.003;
  const CvO2 = hb * 1.34 * (svo2 / 100) + pvo2 * 0.003;
  const DO2 = co * CaO2 * 10;
  const VO2 = co * (CaO2 - CvO2) * 10;
  const ERO2 = DO2 > 0 ? (VO2 / DO2) * 100 : 0;

  let interpDO2 = "";
  let interpVO2 = "";
  let interpERO2 = "";
  let resultClass = "";

  if (DO2 < 900) {
    interpDO2 = "Inadequate oxygen delivery.";
    resultClass = "result-bad";
  } else if (DO2 <= 1100) {
    interpDO2 = "Adequate oxygen delivery.";
    resultClass = "result-ok";
  } else {
    interpDO2 = "High oxygen delivery.";
    resultClass = "result-warn";
  }

  if (VO2 < 200) {
    interpVO2 = "Low oxygen consumption.";
  } else if (VO2 <= 250) {
    interpVO2 = "Expected oxygen consumption.";
  } else {
    interpVO2 = "High oxygen consumption.";
  }

  if (ERO2 < 25) {
    interpERO2 = "Low extraction.";
  } else if (ERO2 <= 30) {
    interpERO2 = "Adequate extraction.";
  } else {
    interpERO2 = "Increased extraction.";
  }

  setHTML(
    "resultadoOxigenacionDetalle",
    `
    <ul>
      <li><strong>CaO₂:</strong> ${CaO2.toFixed(2)} mL/dL</li>
      <li><strong>CvO₂:</strong> ${CvO2.toFixed(2)} mL/dL</li>
      <li><strong>DO₂:</strong> ${DO2.toFixed(0)} mL/min (900–1100) → ${interpDO2}</li>
      <li><strong>VO₂:</strong> ${VO2.toFixed(0)} mL/min (200–250) → ${interpVO2}</li>
      <li><strong>ERO₂:</strong> ${ERO2.toFixed(1)} % (25–30) → ${interpERO2}</li>
    </ul>
    `
  );

  setResultState("resultadoOxigenacionDetalle", resultClass);
}

/* =========================
   SYSTEMIC VASCULAR RESISTANCE
========================= */
function calculateSVR() {
  const map = getNum("rvs_tam");
  const cvp = getNum("rvs_pvc") || 0;
  const co = getNum("rvs_gc");

  if (map === null || co === null) {
    showError("resultadoRVS", "interpretacionRVS", "Please complete MAP and cardiac output.");
    return;
  }

  if (map <= 0 || co <= 0 || cvp < 0) {
    showError("resultadoRVS", "interpretacionRVS", "Values must be valid and greater than 0.");
    return;
  }

  const svr = ((map - cvp) / co) * 80;

  let interpretation = "";
  let resultClass = "";

  if (svr < 800) {
    interpretation = "Low vascular resistance.";
    resultClass = "result-bad";
  } else if (svr <= 1200) {
    interpretation = "Normal vascular resistance.";
    resultClass = "result-ok";
  } else {
    interpretation = "Elevated vascular resistance.";
    resultClass = "result-warn";
  }

  setHTML(
    "resultadoRVS",
    `<strong>SVR:</strong> ${svr.toFixed(0)} dyn·s·cm⁻⁵ (800–1200)`
  );
  setHTML("interpretacionRVS", interpretation);
  setResultState("resultadoRVS", resultClass);
}

/* =========================
   OPTIONAL RESET
========================= */
function resetHemodynamicCalculators() {
  const ids = [
    "eco_dtsvi", "eco_vti", "eco_fc",
    "fa_ddvi", "fa_dsvi",
    "oxi_gc", "oxi_hb", "oxi_sao2", "oxi_pao2", "oxi_svo2", "oxi_pvo2",
    "rvs_tam", "rvs_pvc", "rvs_gc"
  ];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  [
    "resultadoGCEco",
    "interpretacionGCEco",
    "resultadoFA",
    "interpretacionFA",
    "resultadoOxigenacionDetalle",
    "resultadoRVS",
    "interpretacionRVS"
  ].forEach(clearHTML);

  [
    "resultadoGCEco",
    "resultadoFA",
    "resultadoOxigenacionDetalle",
    "resultadoRVS"
  ].forEach((id) => setResultState(id, ""));
}

/* =========================
   COMPATIBILITY ALIASES
========================= */
window.calculateEchoCO = calculateEchoCO;
window.calculateFS = calculateFS;
window.calculateOxygenation = calculateOxygenation;
window.calculateSVR = calculateSVR;

window.calcularGCEco = calculateEchoCO;
window.calcularFA = calculateFS;
window.calcularOxigenacion = calculateOxygenation;
window.calcularRVS = calculateSVR;

window.resetHemodynamicCalculators = resetHemodynamicCalculators;
