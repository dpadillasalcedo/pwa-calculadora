/* ==========================================
   Acid–Base Status - EN
   Critical Care Tools
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const currentPath = window.location.pathname;

  /* ==========================================
     1️⃣ Corrected Anion Gap
     AG = Na + K − Cl − HCO3
     AGcorr = AG + 2.5 × (4 − albumin)
  ========================================== */

  window.calcularAnionGapCorregido = function () {

    const na = parseFloat(document.getElementById("ab_na").value);
    const k = parseFloat(document.getElementById("ab_k").value) || 0;
    const cl = parseFloat(document.getElementById("ab_cl").value);
    const hco3 = parseFloat(document.getElementById("ab_hco3").value);
    const alb = parseFloat(document.getElementById("ab_alb").value) || 4;

    if (!na || !cl || !hco3) return;

    const ag = na + k - cl - hco3;
    const agCorr = ag + (2.5 * (4 - alb));

    const result = document.getElementById("resultadoAnionGap");

    result.innerHTML =
      `<strong>Anion Gap:</strong> ${ag.toFixed(1)} mEq/L` +
      `<br><strong>Corrected AG:</strong> ${agCorr.toFixed(1)} mEq/L`;

    if (agCorr > 12)
      result.innerHTML += `<br><span class="note">Elevated anion gap metabolic acidosis likely.</span>`;
    else
      result.innerHTML += `<br><span class="note">Normal anion gap.</span>`;

    sendGA("anion_gap_calculated");
  };

  /* ==========================================
     2️⃣ Delta / Delta
     ΔAG / ΔHCO3
  ========================================== */

  window.calcularDeltaGap = function () {

    const ag = parseFloat(document.getElementById("dd_ag").value);
    const hco3 = parseFloat(document.getElementById("dd_hco3").value);

    if (!ag || !hco3) return;

    const deltaAG = ag - 12;
    const deltaHCO3 = 24 - hco3;

    const ratio = deltaAG / deltaHCO3;

    const result = document.getElementById("resultadoDeltaGap");
    const interp = document.getElementById("interpretacionDeltaGap");

    result.innerHTML =
      `<strong>Δ/Δ Ratio:</strong> ${ratio.toFixed(2)}`;

    if (ratio < 0.8)
      interp.innerHTML = "Suggests mixed normal AG metabolic acidosis.";
    else if (ratio <= 2)
      interp.innerHTML = "Pure high AG metabolic acidosis.";
    else
      interp.innerHTML = "Suggests concomitant metabolic alkalosis.";

    sendGA("delta_gap_calculated");
  };

  /* ==========================================
     3️⃣ Corrected Sodium
     Na corr = Na + 1.6 × ((glucose − 100)/100)
  ========================================== */

  window.calcularSodioCorregido = function () {

    const na = parseFloat(document.getElementById("na_meas").value);
    const glu = parseFloat(document.getElementById("glu").value);

    if (!na || !glu) return;

    const naCorr = na + 1.6 * ((glu - 100) / 100);

    const result = document.getElementById("resultadoNaCorregido");

    result.innerHTML =
      `<strong>Corrected Sodium:</strong> ${naCorr.toFixed(1)} mEq/L`;

    sendGA("corrected_sodium_calculated");
  };

  /* ==========================================
     4️⃣ Corrected Calcium
     Ca corr = Ca + 0.8 × (4 − albumin)
  ========================================== */

  window.calcularCalcioCorregido = function () {

    const ca = parseFloat(document.getElementById("ca_meas").value);
    const alb = parseFloat(document.getElementById("alb_meas").value);

    if (!ca || !alb) return;

    const caCorr = ca + 0.8 * (4 - alb);

    const result = document.getElementById("resultadoCaCorregido");

    result.innerHTML =
      `<strong>Corrected Calcium:</strong> ${caCorr.toFixed(2)} mg/dL`;

    sendGA("corrected_calcium_calculated");
  };

  /* ==========================================
     GA helper
  ========================================== */

  function sendGA(eventName) {
    if (typeof gtag === "function") {
      gtag("event", eventName, {
        event_category: "acid_base_module",
        page_path: currentPath,
        language: "en"
      });
    }
  }

});

