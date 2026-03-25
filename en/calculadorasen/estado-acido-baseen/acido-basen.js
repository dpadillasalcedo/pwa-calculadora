/* =========================
   HELPERS
========================= */
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

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

/* =========================
   CORRECTED ANION GAP
========================= */
function calculateCorrectedAnionGap() {
  const na = getNum("ab_na");
  const k = getNum("ab_k");
  const cl = getNum("ab_cl");
  const hco3 = getNum("ab_hco3");
  let alb = getNum("ab_alb");

  if ([na, k, cl, hco3].some(v => v === null)) {
    setText("resultadoAnionGap", "Complete all values");
    return;
  }

  if (!Number.isFinite(alb) || alb <= 0) alb = 4;

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  setHTML(
    "resultadoAnionGap",
    `<strong>AG:</strong> ${ag.toFixed(1)} mEq/L<br>
     <strong>Corrected AG:</strong> ${agCorr.toFixed(1)} mEq/L`
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

  let interp =
    deltaDelta < 1
      ? "Suggests an associated additional metabolic acidosis. Evaluate hyperchloremia or other causes."
      : deltaDelta <= 2
        ? "Pure high anion gap metabolic acidosis."
        : "Suggests associated metabolic alkalosis.";

  setHTML(
    "resultadoDeltaGap",
    `<strong>Δ/Δ:</strong> ${deltaDelta.toFixed(2)}`
  );
  setText("interpretacionDeltaGap", interp);
}

/* =========================
   CORRECTED SODIUM
========================= */
function calculateCorrectedSodium() {
  const na = getNum("na_meas");
  const glu = getNum("glu");

  if (na === null || glu === null) {
    setText("resultadoNaCorregido", "Complete Na and glucose");
    return;
  }

  const nac = na + (glu > 100 ? 1.6 * ((glu - 100) / 100) : 0);

  setHTML(
    "resultadoNaCorregido",
    `<strong>Corrected Na:</strong> ${nac.toFixed(1)} mEq/L`
  );
}

/* =========================
   CORRECTED CALCIUM
========================= */
function calculateCorrectedCalcium() {
  const ca = getNum("ca_meas");
  let alb = getNum("alb_meas");

  if (ca === null) {
    setText("resultadoCaCorregido", "Complete calcium value");
    return;
  }

  if (!Number.isFinite(alb) || alb <= 0) alb = 4;

  const cac = ca + 0.8 * (4 - alb);

  setHTML(
    "resultadoCaCorregido",
    `<strong>Corrected Ca:</strong> ${cac.toFixed(2)} mg/dL`
  );
}

/* =========================
   EXPOSE FUNCTIONS
========================= */
window.calculateCorrectedAnionGap = calculateCorrectedAnionGap;
window.calculateDeltaGap = calculateDeltaGap;
window.calculateCorrectedSodium = calculateCorrectedSodium;
window.calculateCorrectedCalcium = calculateCorrectedCalcium;

/* Backward compatibility */
window.calcularAnionGapCorregido = calculateCorrectedAnionGap;
window.calcularDeltaGap = calculateDeltaGap;
window.calcularSodioCorregido = calculateCorrectedSodium;
window.calcularCalcioCorregido = calculateCorrectedCalcium;

/* Accordion rows if used */
document.querySelectorAll('.content').forEach(row => {
  row.addEventListener('click', () => {
    row.classList.toggle('active');
  });
});
