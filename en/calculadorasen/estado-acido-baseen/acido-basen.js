console.log("acido-baseen.js loaded successfully");

(function () {
  "use strict";

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

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function clearOutput(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  }

  /* =========================
     INITIAL SETUP
  ========================= */
  document.addEventListener("DOMContentLoaded", function () {
    [
      "resultadoAnionGap",
      "resultadoDeltaGap",
      "interpretacionDeltaGap",
      "resultadoNaCorregido",
      "resultadoCaCorregido"
    ].forEach(clearOutput);

    document.querySelectorAll(".content").forEach(function (row) {
      row.addEventListener("click", function () {
        row.classList.toggle("active");
      });
    });
  });

  /* =========================
     CORRECTED ANION GAP
  ========================= */
  function calculateCorrectedAnionGap() {
    const na = getNum("ab_na");
    const k = getNum("ab_k");
    const cl = getNum("ab_cl");
    const hco3 = getNum("ab_hco3");
    let alb = getNum("ab_alb");

    if ([na, k, cl, hco3].some((v) => v === null)) {
      setText("resultadoAnionGap", "Complete all required values.");
      return;
    }

    if (!Number.isFinite(alb) || alb <= 0) alb = 4;

    const ag = (na + k) - (cl + hco3);
    const agCorr = ag + 2.5 * (4 - alb);

    let interpretation = "";
    if (agCorr < 12) {
      interpretation = "Normal or low corrected anion gap.";
    } else if (agCorr <= 16) {
      interpretation = "Mildly elevated corrected anion gap.";
    } else {
      interpretation = "Elevated corrected anion gap.";
    }

    setHTML(
      "resultadoAnionGap",
      `<strong>AG:</strong> ${ag.toFixed(1)} mEq/L<br>
       <strong>Corrected AG:</strong> ${agCorr.toFixed(1)} mEq/L<br>
       <strong>Interpretation:</strong> ${interpretation}`
    );
  }

  /* =========================
     DELTA / DELTA
  ========================= */
  function calculateDeltaGap() {
    const ag = getNum("dd_ag");
    const hco3 = getNum("dd_hco3");

    const AG_NORMAL = 12;
    const HCO3_NORMAL = 24;

    if (ag === null || hco3 === null) {
      setText("resultadoDeltaGap", "—");
      setText("interpretacionDeltaGap", "Complete Anion Gap and HCO₃.");
      return;
    }

    if (ag <= 0 || hco3 <= 0) {
      setText("resultadoDeltaGap", "Not interpretable");
      setText("interpretacionDeltaGap", "Non-physiologic values.");
      return;
    }

    const deltaAG = ag - AG_NORMAL;
    const deltaHCO3 = HCO3_NORMAL - hco3;

    if (deltaHCO3 <= 0) {
      setText("resultadoDeltaGap", "Not interpretable");
      setText("interpretacionDeltaGap", "HCO₃ is not decreased.");
      return;
    }

    const deltaDelta = deltaAG / deltaHCO3;

    if (!Number.isFinite(deltaDelta)) {
      setText("resultadoDeltaGap", "—");
      setText("interpretacionDeltaGap", "Could not be calculated.");
      return;
    }

    let interpretation = "";
    if (deltaDelta < 1) {
      interpretation =
        "Suggests an additional metabolic acidosis. Evaluate hyperchloremia or other causes.";
    } else if (deltaDelta <= 2) {
      interpretation = "Pure high anion gap metabolic acidosis.";
    } else {
      interpretation = "Suggests associated metabolic alkalosis.";
    }

    setHTML(
      "resultadoDeltaGap",
      `<strong>Δ/Δ:</strong> ${deltaDelta.toFixed(2)}`
    );
    setText("interpretacionDeltaGap", interpretation);
  }

  /* =========================
     CORRECTED SODIUM
  ========================= */
  function calculateCorrectedSodium() {
    const na = getNum("na_meas");
    const glu = getNum("glu");

    if (na === null || glu === null) {
      setText("resultadoNaCorregido", "Complete sodium and glucose values.");
      return;
    }

    if (glu < 0) {
      setText("resultadoNaCorregido", "Glucose must be a valid value.");
      return;
    }

    const correctedNa = na + (glu > 100 ? 1.6 * ((glu - 100) / 100) : 0);

    setHTML(
      "resultadoNaCorregido",
      `<strong>Corrected Na:</strong> ${correctedNa.toFixed(1)} mEq/L`
    );
  }

  /* =========================
     CORRECTED CALCIUM
  ========================= */
  function calculateCorrectedCalcium() {
    const ca = getNum("ca_meas");
    let alb = getNum("alb_meas");

    if (ca === null) {
      setText("resultadoCaCorregido", "Complete calcium value.");
      return;
    }

    if (!Number.isFinite(alb) || alb <= 0) alb = 4;

    const correctedCa = ca + 0.8 * (4 - alb);

    setHTML(
      "resultadoCaCorregido",
      `<strong>Corrected Ca:</strong> ${correctedCa.toFixed(2)} mg/dL`
    );
  }

  /* =========================
     EXPOSE TO HTML BUTTONS
  ========================= */
  window.calculateCorrectedAnionGap = calculateCorrectedAnionGap;
  window.calculateDeltaGap = calculateDeltaGap;
  window.calculateCorrectedSodium = calculateCorrectedSodium;
  window.calculateCorrectedCalcium = calculateCorrectedCalcium;
})();
