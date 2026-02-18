(function () {
  const getNum = (id) => {
    const el = document.getElementById(id);
    if (!el) return NaN;
    const v = parseFloat(el.value);
    return Number.isFinite(v) ? v : NaN;
  };

  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "—");

  // =========================
  // 1) Corrected Anion Gap
  // AG = Na + K - Cl - HCO3
  // AGcorr = AG + 2.5*(4 - Alb[g/dL])
  // =========================
  window.calcularAnionGapCorregido = function () {
    const na = getNum("ab_na");
    const k = getNum("ab_k");
    const cl = getNum("ab_cl");
    const hco3 = getNum("ab_hco3");
    const alb = getNum("ab_alb");

    if (![na, k, cl, hco3, alb].every(Number.isFinite)) {
      setHTML("resultadoAnionGap", "Please complete all fields with valid numbers.");
      return;
    }

    const ag = (na + k) - (cl + hco3);
    const agCorr = ag + 2.5 * (4 - alb);

    setHTML(
      "resultadoAnionGap",
      `<strong>AG:</strong> ${fmt(ag, 1)} mEq/L<br>
       <strong>Corrected AG:</strong> ${fmt(agCorr, 1)} mEq/L`
    );
  };

  // =========================
  // 2) Delta/Delta
  // ΔAG = AG - 12
  // ΔHCO3 = 24 - HCO3
  // Ratio = ΔAG / ΔHCO3
  // =========================
  window.calcularDeltaGap = function () {
    const ag = getNum("dd_ag");
    const hco3 = getNum("dd_hco3");

    if (![ag, hco3].every(Number.isFinite)) {
      setHTML("resultadoDeltaGap", "Please enter valid numbers.");
      setHTML("interpretacionDeltaGap", "");
      return;
    }

    const dAG = ag - 12;
    const dHCO3 = 24 - hco3;

    if (dHCO3 === 0) {
      setHTML("resultadoDeltaGap", "<strong>Δ/Δ:</strong> —");
      setHTML("interpretacionDeltaGap", "ΔHCO₃ is zero (cannot divide).");
      return;
    }

    const ratio = dAG / dHCO3;

    let interp = "";
    if (ratio < 0.4) interp = "Suggests pure non–anion gap metabolic acidosis (NAGMA).";
    else if (ratio < 0.8) interp = "Suggests mixed HAGMA + NAGMA.";
    else if (ratio <= 2.0) interp = "Consistent with high anion gap metabolic acidosis (HAGMA).";
    else interp = "Suggests concurrent metabolic alkalosis or chronic respiratory acidosis.";

    setHTML("resultadoDeltaGap", `<strong>Δ/Δ:</strong> ${fmt(ratio, 2)}`);
    setHTML("interpretacionDeltaGap", interp);
  };

  // =========================
  // 3) Corrected Sodium (Hyperglycemia)
  // Na_corr = Na + 1.6*((Glucose - 100)/100) for Glu > 100
  // =========================
  window.calcularSodioCorregido = function () {
    const na = getNum("na_meas");
    const glu = getNum("glu");

    if (![na, glu].every(Number.isFinite)) {
      setHTML("resultadoNaCorregido", "Please enter valid numbers.");
      return;
    }

    const factor = glu > 100 ? 1.6 * ((glu - 100) / 100) : 0;
    const naCorr = na + factor;

    setHTML(
      "resultadoNaCorregido",
      `<strong>Corrected Na⁺:</strong> ${fmt(naCorr, 1)} mEq/L`
    );
  };

  // =========================
  // 4) Corrected Calcium (Albumin)
  // Ca_corr = Ca + 0.8*(4 - Alb)
  // =========================
  window.calcularCalcioCorregido = function () {
    const ca = getNum("ca_meas");
    const alb = getNum("alb_meas");

    if (![ca, alb].every(Number.isFinite)) {
      setHTML("resultadoCaCorregido", "Please enter valid numbers.");
      return;
    }

    const caCorr = ca + 0.8 * (4 - alb);

    setHTML(
      "resultadoCaCorregido",
      `<strong>Corrected Ca:</strong> ${fmt(caCorr, 2)}`
    );
  };
})();
