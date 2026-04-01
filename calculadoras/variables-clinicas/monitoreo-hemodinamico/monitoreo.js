function getNum(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  return Number(el.value);
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

  // Gasto cardíaco
  const gc = ((Math.PI * (d / 2) ** 2) * vti * fc) / 1000;

  // Umbral de respuesta (+15%)
  const gc15 = gc * 1.15;

  const normal = "Normal: 4–6 L/min";

  let interp =
    gc < 4 ? "Bajo gasto cardíaco" :
    gc <= 6 ? "Gasto cardíaco normal" :
    "Estado hiperdinámico";

  setHTML(
    "resultadoGCEco",
    `
    <strong>GC:</strong> ${gc.toFixed(2)} L/min<br>
    <strong>GC +15% (respondedor):</strong> ${gc15.toFixed(2)} L/min
    `
  );

  setHTML(
    "interpretacionGCEco",
    `
    ${interp} (${normal}).<br>
    Se considera <strong>respondedor</strong> si el GC alcanza o supera 
    <strong>${gc15.toFixed(2)} L/min</strong>.
    `
  );
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

  setHTML("resultadoFA", `<strong>FA:</strong> ${fa.toFixed(1)} %`);
  setHTML("interpretacionFA", `${interp} (Normal: 28–45%)`);
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

  let interpDO2 =
    DO2 < 900 ? "Aporte de oxígeno insuficiente." :
    "Aporte de oxígeno adecuado.";

  let interpERO2 =
    ERO2 < 25 ? "Extracción baja." :
    ERO2 <= 30 ? "Extracción adecuada." :
    "Extracción aumentada.";

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
    `<strong>RVS:</strong> ${rvs.toFixed(0)} dyn·s·cm⁻⁵ (800–1200)`
  );
  setHTML("interpretacionRVS", interp);
}

function calcular() {

  let ppv = parseFloat(document.getElementById("ppv").value);
  let svv = parseFloat(document.getElementById("svv").value);
  let map = parseFloat(document.getElementById("map").value);
  let vaso = parseFloat(document.getElementById("vaso").value);

  if (isNaN(ppv) || isNaN(svv)) {
    alert("Completar PPV y SVV");
    return;
  }

  let eadyn = ppv / svv;

  let html = `
    <div class="result">
      Eadyn: ${eadyn.toFixed(2)}
    </div>
  `;

  // Interpretación
  if (eadyn > 1) {
    html += `
      <div class="result good">
        ✔ Buen acoplamiento ventrículo-arterial <br>
        → El volumen probablemente aumente la presión arterial <br>
        → Considerar descenso de vasopresor
      </div>
    `;
  } 
  else if (eadyn >= 0.8 && eadyn <= 1) {
    html += `
      <div class="result warn">
        ⚠ Zona gris <br>
        → Respuesta incierta <br>
        → Integrar con clínica (lactato, eco, perfusión)
      </div>
    `;
  } 
  else {
    html += `
      <div class="result bad">
        ✖ Desacople ventrículo-arterial <br>
        → El volumen NO aumentará presión <br>
        → Mantener o aumentar vasopresor
      </div>
    `;
  }

  // Destete
  if (!isNaN(map) && !isNaN(vaso)) {
    if (map >= 65 && eadyn > 0.9 && vaso < 0.1) {
      html += `
        <div class="result good">
          🟢 Candidato a destete de vasopresor
        </div>
      `;
    } else {
      html += `
        <div class="result warn">
          🟡 No óptimo para destete aún
        </div>
      `;
    }
  }

  html += `
    <div class="note">
      Eadyn = PPV / SVV. Válido en VM controlada, ritmo sinusal y sin esfuerzo respiratorio.
    </div>
  `;

  document.getElementById("resultado").innerHTML = html;
}
