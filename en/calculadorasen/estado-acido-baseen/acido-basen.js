console.log("acid-base EN JS loaded");

/* =========================
   HELPERS
========================= */
function getNum(id) {
  const el = document.getElementById(id);
  if (!el) return null;

  const val = el.value.trim();
  if (val === "") return null;

  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* =========================
   ANION GAP
========================= */
function calculateCorrectedAnionGap() {
  const na = getNum("ab_na");
  const k = getNum("ab_k");
  const cl = getNum("ab_cl");
  const hco3 = getNum("ab_hco3");
  let alb = getNum("ab_alb");

  if ([na, k, cl, hco3].includes(null)) {
    setHTML("resultadoAnionGap", "⚠️ Complete all values");
    return;
  }

  if (!alb || alb <= 0) alb = 4;

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  let interp = "";
  if (agCorr < 12) interp = "Normal";
  else if (agCorr <= 16) interp = "Mild elevation";
  else interp = "High anion gap";

  setHTML(
    "resultadoAnionGap",
    `<strong>AG:</strong> ${ag.toFixed(1)} mEq/L<br>
     <strong>Corrected AG:</strong> ${agCorr.toFixed(1)} mEq/L<br>
     <strong>Interpretation:</strong> ${interp}`
  );
}

/* =========================
   DELTA GAP
========================= */
function calculateDeltaGap() {
  const ag = getNum("dd_ag");
  const hco3 = getNum("dd_hco3");

  if (ag === null || hco3 === null) {
    setHTML("resultadoDeltaGap", "⚠️ Complete values");
    return;
  }

  if (hco3 >= 24) {
    setHTML("resultadoDeltaGap", "Not interpretable");
    return;
  }

  const delta = (ag - 12) / (24 - hco3);

  let interp = "";
  if (delta < 1) interp = "Additional metabolic acidosis";
  else if (delta <= 2) interp = "Pure AG metabolic acidosis";
  else interp = "Associated metabolic alkalosis";

  setHTML(
    "resultadoDeltaGap",
    `<strong>Δ/Δ:</strong> ${delta.toFixed(2)}<br>${interp}`
  );
}

/* =========================
   SODIUM
========================= */
function calculateCorrectedSodium() {
  const na = getNum("na_meas");
  const glu = getNum("glu");

  if (na === null || glu === null) {
    setHTML("resultadoNaCorregido", "⚠️ Complete values");
    return;
  }

  const nac = na + (glu > 100 ? 1.6 * ((glu - 100) / 100) : 0);

  setHTML(
    "resultadoNaCorregido",
    `<strong>Corrected Na:</strong> ${nac.toFixed(1)} mEq/L`
  );
}

/* =========================
   CALCIUM
========================= */
function calculateCorrectedCalcium() {
  const ca = getNum("ca_meas");
  let alb = getNum("alb_meas");

  if (ca === null) {
    setHTML("resultadoCaCorregido", "⚠️ Complete calcium");
    return;
  }

  if (!alb || alb <= 0) alb = 4;

  const cac = ca + 0.8 * (4 - alb);

  setHTML(
    "resultadoCaCorregido",
    `<strong>Corrected Ca:</strong> ${cac.toFixed(2)} mg/dL`
  );
}

/* =========================
   EXPORT (CRÍTICO)
========================= */
window.calculateCorrectedAnionGap = calculateCorrectedAnionGap;
window.calculateDeltaGap = calculateDeltaGap;
window.calculateCorrectedSodium = calculateCorrectedSodium;
window.calculateCorrectedCalcium = calculateCorrectedCalcium;
