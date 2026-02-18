/* ==========================================
   ACID–BASE EN – ICU CALCULATOR
   Compatible with inline onclick
========================================== */

function getNumber(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const value = parseFloat(el.value);
  return isNaN(value) ? NaN : value;
}

/* =========================
   1) CORRECTED ANION GAP
========================= */
function calcularAnionGapCorregido() {

  const na = getNumber("ab_na");
  const k = getNumber("ab_k");
  const cl = getNumber("ab_cl");
  const hco3 = getNumber("ab_hco3");
  const alb = getNumber("ab_alb");

  if ([na,k,cl,hco3,alb].some(isNaN)) {
    document.getElementById("resultadoAnionGap").innerHTML =
      "Please complete all fields.";
    return;
  }

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  document.getElementById("resultadoAnionGap").innerHTML =
    "<strong>AG:</strong> " + ag.toFixed(1) + " mEq/L<br>" +
    "<strong>Corrected AG:</strong> " + agCorr.toFixed(1) + " mEq/L";
}


/* =========================
   2) DELTA / DELTA
========================= */
function calcularDeltaGap() {

  const ag = getNumber("dd_ag");
  const hco3 = getNumber("dd_hco3");

  if ([ag,hco3].some(isNaN)) {
    document.getElementById("resultadoDeltaGap").innerHTML =
      "Please enter valid numbers.";
    document.getElementById("interpretacionDeltaGap").innerHTML = "";
    return;
  }

  const deltaAG = ag - 12;
  const deltaHCO3 = 24 - hco3;

  if (deltaHCO3 === 0) {
    document.getElementById("resultadoDeltaGap").innerHTML =
      "Cannot divide by zero.";
    return;
  }

  const ratio = deltaAG / deltaHCO3;

  let interpretation = "";

  if (ratio < 0.4)
    interpretation = "Suggests pure non–anion gap metabolic acidosis.";
  else if (ratio < 0.8)
    interpretation = "Suggests mixed HAGMA + NAGMA.";
  else if (ratio <= 2)
    interpretation = "Consistent with high anion gap metabolic acidosis.";
  else
    interpretation = "Suggests concurrent metabolic alkalosis or chronic respiratory acidosis.";

  document.getElementById("resultadoDeltaGap").innerHTML =
    "<strong>Δ/Δ:</strong> " + ratio.toFixed(2);

  document.getElementById("interpretacionDeltaGap").innerHTML =
    interpretation;
}


/* =========================
   3) CORRECTED SODIUM
========================= */
function calcularSodioCorregido() {

  const na = getNumber("na_meas");
  const glu = getNumber("glu");

  if ([na,glu].some(isNaN)) {
    document.getElementById("resultadoNaCorregido").innerHTML =
      "Please enter valid numbers.";
    return;
  }

  let correction = 0;

  if (glu > 100) {
    correction = 1.6 * ((glu - 100) / 100);
  }

  const naCorr = na + correction;

  document.getElementById("resultadoNaCorregido").innerHTML =
    "<strong>Corrected Na⁺:</strong> " + naCorr.toFixed(1) + " mEq/L";
}


/* =========================
   4) CORRECTED CALCIUM
========================= */
function calcularCalcioCorregido() {

  const ca = getNumber("ca_meas");
  const alb = getNumber("alb_meas");

  if ([ca,alb].some(isNaN)) {
    document.getElementById("resultadoCaCorregido").innerHTML =
      "Please enter valid numbers.";
    return;
  }

  const caCorr = ca + 0.8 * (4 - alb);

  document.getElementById("resultadoCaCorregido").innerHTML =
    "<strong>Corrected Ca:</strong> " + caCorr.toFixed(2);
}
