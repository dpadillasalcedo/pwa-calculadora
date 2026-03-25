function getNum(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  return Number(el.value);
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* =========================
   ECHO CARDIAC OUTPUT
========================= */
function calculateEchoCO() {
  const d = getNum("eco_dtsvi");
  const vti = getNum("eco_vti");
  const hr = getNum("eco_fc");

  if ([d, vti, hr].includes(null)) return;

  const co = ((Math.PI * (d / 2) ** 2) * vti * hr) / 1000;
  const co15 = co * 1.15;

  const normal = "Normal range: 4–6 L/min";

  const interp =
    co < 4
      ? "Low cardiac output"
      : co <= 6
        ? "Normal cardiac output"
        : "Hyperdynamic state";

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
    ${interp} (${normal}).<br>
    The patient is considered a <strong>responder</strong> if cardiac output reaches or exceeds
    <strong>${co15.toFixed(2)} L/min</strong>.
    `
  );
}

/* =========================
   FRACTIONAL SHORTENING
========================= */
function calculateFS() {
  const dd = getNum("fa_ddvi");
  const ds = getNum("fa_dsvi");

  if (dd === null || ds === null || ds >= dd) return;

  const fs = ((dd - ds) / dd) * 100;

  const interp =
    fs < 28
      ? "Depressed systolic function"
      : fs <= 45
        ? "Preserved systolic function"
        : "Hyperdynamic state";

  setHTML("resultadoFA", `<strong>FS:</strong> ${fs.toFixed(1)} %`);
  setHTML("interpretacionFA", `${interp} (Normal: 28–45%)`);
}

/* =========================
   OXYGENATION
========================= */
function calculateOxygenation() {
  const co = getNum("oxi_gc");
  const hb = getNum("oxi_hb");
  const sao2 = getNum("oxi_sao2");
  const pao2 = getNum("oxi_pao2");
  const svo2 = getNum("oxi_svo2");
  const pvo2 = getNum("oxi_pvo2");

  if ([co, hb, sao2, pao2, svo2, pvo2].includes(null)) return;

  const CaO2 = hb * 1.34 * (sao2 / 100) + pao2 * 0.003;
  const CvO2 = hb * 1.34 * (svo2 / 100) + pvo2 * 0.003;

  const DO2 = co * CaO2 * 10;
  const VO2 = co * (CaO2 - CvO2) * 10;
  const ERO2 = (VO2 / DO2) * 100;

  const interpDO2 =
    DO2 < 900
      ? "Inadequate oxygen delivery."
      : "Adequate oxygen delivery.";

  const interpERO2 =
    ERO2 < 25
      ? "Low extraction."
      : ERO2 <= 30
        ? "Adequate extraction."
        : "Increased extraction.";

  setHTML(
    "resultadoOxigenacionDetalle",
    `<ul>
      <li><strong>DO₂:</strong> ${DO2.toFixed(0)} mL/min (900–1100) → ${interpDO2}</li>
      <li><strong>VO₂:</strong> ${VO2.toFixed(0)} mL/min (200–250)</li>
      <li><strong>ERO₂:</strong> ${ERO2.toFixed(1)} % (25–30) → ${interpERO2}</li>
    </ul>`
  );
}

/* =========================
   SVR
========================= */
function calculateSVR() {
  const map = getNum("rvs_tam");
  const cvp = getNum("rvs_pvc") || 0;
  const co = getNum("rvs_gc");

  if (map === null || co === null) return;

  const svr = ((map - cvp) / co) * 80;

  const interp =
    svr < 800
      ? "Low vascular resistance"
      : svr <= 1200
        ? "Normal vascular resistance"
        : "Elevated vascular resistance";

  setHTML(
    "resultadoRVS",
    `<strong>SVR:</strong> ${svr.toFixed(0)} dyn·s·cm⁻⁵ (800–1200)`
  );

  setHTML("interpretacionRVS", interp);
}

/* =========================
   OPTIONAL GLOBAL ALIASES
========================= */
window.calculateEchoCO = calculateEchoCO;
window.calculateFS = calculateFS;
window.calculateOxygenation = calculateOxygenation;
window.calculateSVR = calculateSVR;
