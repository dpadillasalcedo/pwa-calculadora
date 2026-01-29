/* =========================
   HELPERS
========================= */
function getNum(id) {
  const el = document.getElementById(id);
  if (!el) return null;
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
   ANION GAP CORREGIDO
========================= */
function calcularAnionGapCorregido() {
  const na = getNum("ab_na");
  const k = getNum("ab_k");
  const cl = getNum("ab_cl");
  const hco3 = getNum("ab_hco3");
  let alb = getNum("ab_alb");

  if ([na,k,cl,hco3].some(v => v === null)) {
    setText("resultadoAnionGap","Complete todos los valores");
    return;
  }
  if (!Number.isFinite(alb) || alb <= 0) alb = 4;

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  setHTML(
    "resultadoAnionGap",
    `<strong>AG:</strong> ${ag.toFixed(1)} mEq/L<br>
     <strong>AG corregido:</strong> ${agCorr.toFixed(1)} mEq/L`
  );
}

/* =========================
   DELTA / DELTA
========================= */
function calcularDeltaGap() {
  const ag = getNum("dd_ag");
  const hco3 = getNum("dd_hco3");

  if (ag === null || hco3 === null) {
    setText("resultadoDeltaGap","—");
    setText("interpretacionDeltaGap","Complete AG y HCO₃.");
    return;
  }

  const delta = (ag - 12) / (24 - hco3);
  if (!Number.isFinite(delta)) {
    setText("resultadoDeltaGap","No interpretable");
    return;
  }

  let interp =
    delta < 1 ? "Acidosis metabólica hiperclorémica asociada."
    : delta <= 2 ? "Acidosis metabólica con AG elevado pura."
    : "Alcalosis metabólica asociada.";

  setHTML("resultadoDeltaGap", `<strong>Δ/Δ:</strong> ${delta.toFixed(2)}`);
  setText("interpretacionDeltaGap", interp);
}

/* =========================
   SODIO CORREGIDO
========================= */
function calcularSodioCorregido() {
  const na = getNum("na_meas");
  const glu = getNum("glu");

  if (na === null || glu === null) {
    setText("resultadoNaCorregido","Complete Na y glucosa");
    return;
  }

  const nac = na + (glu > 100 ? 1.6 * ((glu - 100) / 100) : 0);

  setHTML(
    "resultadoNaCorregido",
    `<strong>Na corregido:</strong> ${nac.toFixed(1)} mEq/L`
  );
}

/* =========================
   CALCIO CORREGIDO
========================= */
function calcularCalcioCorregido() {
  const ca = getNum("ca_meas");
  let alb = getNum("alb_meas");

  if (ca === null) {
    setText("resultadoCaCorregido","Complete calcio");
    return;
  }
  if (!Number.isFinite(alb) || alb <= 0) alb = 4;

  const cac = ca + 0.8 * (4 - alb);

  setHTML(
    "resultadoCaCorregido",
    `<strong>Ca corregido:</strong> ${cac.toFixed(2)} mg/dL`
  );
}
