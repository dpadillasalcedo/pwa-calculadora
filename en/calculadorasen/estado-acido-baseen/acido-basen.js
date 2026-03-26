function getNum(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
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

  if ([na, k, cl, hco3].some(v => v === null)) {
    setHTML("resultadoAnionGap", "Complete all values");
    return;
  }

  if (!alb || alb <= 0) alb = 4;

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  setHTML(
    "resultadoAnionGap",
    `<strong>AG:</strong> ${ag.toFixed(1)}<br>
     <strong>Corrected AG:</strong> ${agCorr.toFixed(1)}`
  );
}

/* =========================
   DELTA GAP
========================= */
function calculateDeltaGap() {
  const ag = getNum("dd_ag");
  const hco3 = getNum("dd_hco3");

  if (ag === null || hco3 === null) {
    setHTML("resultadoDeltaGap", "Complete values");
    return;
  }

  const delta = (ag - 12) / (24 - hco3);

  setHTML(
    "resultadoDeltaGap",
    `<strong>Δ/Δ:</strong> ${delta.toFixed(2)}`
  );
}

/* =========================
   SODIUM
========================= */
function calculateCorrectedSodium() {
  const na = getNum("na_meas");
  const glu = getNum("glu");

  if (na === null || glu === null) {
    setHTML("resultadoNaCorregido", "Complete values");
    return;
  }

  const nac = na + (glu > 100 ? 1.6 * ((glu - 100) / 100) : 0);

  setHTML(
    "resultadoNaCorregido",
    `<strong>Corrected Na:</strong> ${nac.toFixed(1)}`
  );
}

/* =========================
   CALCIUM
========================= */
function calculateCorrectedCalcium() {
  const ca = getNum("ca_meas");
  let alb = getNum("alb_meas");

  if (ca === null) {
    setHTML("resultadoCaCorregido", "Complete calcium");
    return;
  }

  if (!alb || alb <= 0) alb = 4;

  const cac = ca + 0.8 * (4 - alb);

  setHTML(
    "resultadoCaCorregido",
    `<strong>Corrected Ca:</strong> ${cac.toFixed(2)}`
  );
}

/* =========================
   EXPORT
========================= */
window.calculateCorrectedAnionGap = calculateCorrectedAnionGap;
window.calculateDeltaGap = calculateDeltaGap;
window.calculateCorrectedSodium = calculateCorrectedSodium;
window.calculateCorrectedCalcium = calculateCorrectedCalcium;
