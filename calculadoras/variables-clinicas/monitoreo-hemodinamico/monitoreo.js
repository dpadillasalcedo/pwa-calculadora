function getNum(id) {
  const v = document.getElementById(id).value;
  return v === "" ? null : Number(v);
}

function setHTML(id, html) {
  document.getElementById(id).innerHTML = html;
}

/* =========================
   GC ECO
========================= */
function calcularGCEco() {
  const d = getNum("eco_dtsvi"),
        vti = getNum("eco_vti"),
        fc = getNum("eco_fc");

  if ([d, vti, fc].includes(null)) return;

  const gc = ((Math.PI * (d / 2) ** 2) * vti * fc) / 1000;
  const normal = "Normal: 4–6 L/min";

  let interp =
    gc < 4 ? "Bajo gasto cardíaco" :
    gc <= 6 ? "Gasto cardíaco normal" :
    "Estado hiperdinámico";

  setHTML("resultadoGCEco", `<strong>GC:</strong> ${gc.toFixed(2)} L/min`);
  setHTML("interpretacionGCEco", `${interp} (${normal})`);
}

/* =========================
   FA
========================= */
function calcularFA() {
  const dd = getNum("fa_ddvi"),
        ds = getNum("fa_dsvi");

  if (dd === null || ds === null || ds >= dd) return;

  const fa = ((dd - ds) / dd) * 100;

  let interp =
    fa < 28 ? "Función sistólica deprimida" :
    fa <= 45 ? "Función sistólica conservada" :
    "Estado hiperdinámico";

  setHTML(
    "resultadoFA",
    `<strong>FA:</strong> ${fa.toFixed(1)} %<br>
     <span class="note">${interp} (Normal: 28–45%)</span>`
  );
}

/* =========================
   OXIGENACIÓN
========================= */
function calcularOxigenacion() {
  const gc = getNum("oxi_gc"),
        hb = getNum("oxi_hb"),
        sao2 = getNum("oxi_sao2"),
        pao2 = getNum("oxi_pao2"),
        svo2 = getNum("oxi_svo2"),
        pvo2 = getNum("oxi_pvo2");

  if ([gc, hb, sao2, pao2, svo2, pvo2].includes(null)) return;

  const CaO2 = hb * 1.34 * (sao2 / 100) + pao2 * 0.003;
  const CvO2 = hb * 1.34 * (svo2 / 100) + pvo2 * 0.003;

  const DO2 = gc * CaO2 * 10;
  const VO2 = gc * (CaO2 - CvO2) * 10;
  const ERO2 = (VO2 / DO2) * 100;
  const QR = VO2 / DO2;

  setHTML(
    "resultadoOxigenacionDetalle",
    `<ul>
      <li><strong>DO₂:</strong> ${DO2.toFixed(0)} mL/min (900–1100)</li>
      <li><strong>VO₂:</strong> ${VO2.toFixed(0)} mL/min (200–250)</li>
      <li><strong>ERO₂:</strong> ${ERO2.toFixed(1)} % (25–30)</li>
      <li><strong>QR:</strong> ${QR.toFixed(2)} (0.7–0.9)</li>
    </ul>`
  );
}

/* =========================
   RVS
========================= */
function calcularRVS() {
  const tam = getNum("rvs_tam"),
        pvc = getNum("rvs_pvc") || 0,
        gc = getNum("rvs_gc");

  if (tam === null || gc === null) return;

  const rvs = ((tam - pvc) / gc) * 80;

  let interp =
    rvs < 800 ? "Resistencia vascular baja" :
    rvs <= 1200 ? "Resistencia vascular normal" :
    "Resistencia vascular elevada";

  setHTML(
    "resultadoRVS",
    `<strong>RVS:</strong> ${rvs.toFixed(0)} dyn·s·cm⁻⁵ (800–1200)<br>
     <span class="note">${interp}</span>`
  );
}
