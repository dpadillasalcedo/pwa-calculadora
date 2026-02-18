/* ==========================================
   Hemodynamic Monitoring - EN
   Critical Care Tools
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const currentPath = window.location.pathname;

  /* ==========================================
     1️⃣ Cardiac Output (LVOT VTI)
     CO = HR × (π × (D/2)² × VTI)
  ========================================== */

  window.calcularGCEco = function () {

  const d = parseFloat(document.getElementById("eco_dtsvi").value);
  const vti = parseFloat(document.getElementById("eco_vti").value);
  const hr = parseFloat(document.getElementById("eco_fc").value);

  if (!d || !vti || !hr) return;

  const area = Math.PI * Math.pow(d / 2, 2);
  const strokeVolume = area * vti; // mL
  const cardiacOutput = (strokeVolume * hr) / 1000; // L/min

  const result = document.getElementById("resultadoGCEco");
  const interp = document.getElementById("interpretacionGCEco");

  // 🔹 15% increase threshold
  const increase15 = cardiacOutput * 0.15;
  const targetCO = cardiacOutput * 1.15;

  result.innerHTML =
    `<strong>Cardiac Output:</strong> ${cardiacOutput.toFixed(2)} L/min
     <br><strong>+15% Increase:</strong> ${increase15.toFixed(2)} L/min
     <br><strong>Fluid Responsiveness Threshold:</strong> ${targetCO.toFixed(2)} L/min`;

  if (cardiacOutput < 4)
    interp.innerHTML = "Low cardiac output.";
  else if (cardiacOutput <= 8)
    interp.innerHTML = "Normal range.";
  else
    interp.innerHTML = "High cardiac output.";

  interp.innerHTML +=
    `<br><br><em>A ≥15% increase in cardiac output after fluid challenge suggests fluid responsiveness.</em>`;

  sendGA("eco_cardiac_output");
};


  /* ==========================================
     2️⃣ Fractional Shortening
     FS = (LVEDD − LVESD) / LVEDD × 100
  ========================================== */

  window.calcularFA = function () {

    const dd = parseFloat(document.getElementById("fa_ddvi").value);
    const ds = parseFloat(document.getElementById("fa_dsvi").value);

    if (!dd || !ds) return;

    const fs = ((dd - ds) / dd) * 100;

    const result = document.getElementById("resultadoFA");
    const interp = document.getElementById("interpretacionFA");

    result.innerHTML =
      `<strong>Fractional Shortening:</strong> ${fs.toFixed(1)} %`;

    if (fs < 25)
      interp.innerHTML = "Reduced systolic function.";
    else if (fs <= 45)
      interp.innerHTML = "Normal systolic function.";
    else
      interp.innerHTML = "Hyperdynamic pattern.";

    sendGA("eco_fractional_shortening");
  };

  /* ==========================================
     3️⃣ Oxygenation
     DO2 = CO × (Hb × 1.34 × SaO2 + 0.003 × PaO2)
  ========================================== */

  window.calcularOxigenacion = function () {

    const co = parseFloat(document.getElementById("oxi_gc").value);
    const hb = parseFloat(document.getElementById("oxi_hb").value);
    const sao2 = parseFloat(document.getElementById("oxi_sao2").value) / 100;
    const pao2 = parseFloat(document.getElementById("oxi_pao2").value);
    const svo2 = parseFloat(document.getElementById("oxi_svo2").value) / 100;
    const pvo2 = parseFloat(document.getElementById("oxi_pvo2").value);

    if (!co || !hb || !sao2 || !pao2) return;

    const cao2 = hb * 1.34 * sao2 + (0.003 * pao2);
    const do2 = co * cao2 * 10;

    let vo2 = null;
    let extraction = null;

    if (svo2 && pvo2) {
      const cvo2 = hb * 1.34 * svo2 + (0.003 * pvo2);
      vo2 = co * (cao2 - cvo2) * 10;
      extraction = ((cao2 - cvo2) / cao2) * 100;
    }

    const result = document.getElementById("resultadoOxigenacionDetalle");

    result.innerHTML =
      `<strong>DO₂:</strong> ${do2.toFixed(0)} mL/min`;

    if (vo2) {
      result.innerHTML +=
        `<br><strong>VO₂:</strong> ${vo2.toFixed(0)} mL/min`;
      result.innerHTML +=
        `<br><strong>Extraction:</strong> ${extraction.toFixed(1)} %`;
    }

    sendGA("oxygenation_calculated");
  };

  /* ==========================================
     4️⃣ SVR
     SVR = ((MAP − CVP) / CO) × 80
  ========================================== */

  window.calcularRVS = function () {

    const map = parseFloat(document.getElementById("rvs_tam").value);
    const cvp = parseFloat(document.getElementById("rvs_pvc").value);
    const co = parseFloat(document.getElementById("rvs_gc").value);

    if (!map || !cvp || !co) return;

    const svr = ((map - cvp) / co) * 80;

    const result = document.getElementById("resultadoRVS");
    const interp = document.getElementById("interpretacionRVS");

    result.innerHTML =
      `<strong>SVR:</strong> ${svr.toFixed(0)} dyn·s·cm⁻⁵`;

    if (svr < 800)
      interp.innerHTML = "Low SVR (vasodilation).";
    else if (svr <= 1200)
      interp.innerHTML = "Normal range.";
    else
      interp.innerHTML = "High SVR (vasoconstriction).";

    sendGA("svr_calculated");
  };

  /* ==========================================
     GA helper
  ========================================== */

  function sendGA(eventName) {
    if (typeof gtag === "function") {
      gtag("event", eventName, {
        event_category: "hemodynamic_module",
        page_path: currentPath,
        language: "en"
      });
    }
  }

});
