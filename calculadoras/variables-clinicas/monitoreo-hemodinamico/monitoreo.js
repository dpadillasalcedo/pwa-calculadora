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

function calcularEadyn() {

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

/* =========================
   SWAN-GANZ
========================= */

function calcularSwanGanz() {

    const PAS = getNum("pas");
    const PAD = getNum("pad");
    const FC = getNum("fc");
    const GC = getNum("gc");
    const SC = getNum("sc");

    const PVC = getNum("pvc");
    const PAPM = getNum("papm");
    const PW = getNum("pw");

    const Hb = getNum("hb");
    const SaO2 = getNum("sao2");
    const SvO2 = getNum("svo2");

    const PaO2 = getNum("pao2");
    const PvO2 = getNum("pvo2");

    if (
        [
            PAS, PAD, FC, GC, SC,
            PVC, PAPM, PW,
            Hb, SaO2, SvO2,
            PaO2, PvO2
        ].includes(null)
    ) {
        alert("Complete todos los campos");
        return;
    }

    if (FC <= 0 || GC <= 0 || SC <= 0) {
        alert("FC, GC y SC deben ser mayores que cero");
        return;
    }

    /* =====================
       CÁLCULOS
    ===================== */

    const TAM = PAD + ((PAS - PAD) / 3);

    const IC = GC / SC;

    const IVS = (IC / FC) * 1000;

    const ITSVI = IVS * (TAM - PW) * 0.0136;

    const ITSVD = IVS * (PAPM - PVC) * 0.0136;

    const RVS = ((TAM - PVC) * 80) / GC;

    const RVP = ((PAPM - PW) * 80) / GC;

    const CaO2 =
        (Hb * 1.39 * (SaO2 / 100)) +
        (PaO2 * 0.0031);

    const CvO2 =
        (Hb * 1.39 * (SvO2 / 100)) +
        (PvO2 * 0.0031);

    const IDO2 = IC * CaO2 * 10;

    const IVO2 = IC * (CaO2 - CvO2) * 10;

    const EXTO2 = (IVO2 / IDO2) * 100;

    /* =====================
       RESULTADOS
    ===================== */

    setHTML("r_tam", TAM.toFixed(1) + " mmHg");

    setHTML("r_ic", IC.toFixed(2) + " L/min/m²");

    setHTML("r_ivs", IVS.toFixed(1) + " mL/lat/m²");

    setHTML("r_itsvi", ITSVI.toFixed(1) + " g·m/m²");

    setHTML("r_itsvd", ITSVD.toFixed(1) + " g·m/m²");

    setHTML("r_rvs", RVS.toFixed(0) + " dyn·s·cm⁻⁵");

    setHTML("r_rvp", RVP.toFixed(0) + " dyn·s·cm⁻⁵");

    setHTML("r_cao2", CaO2.toFixed(2) + " mL/dL");

    setHTML("r_cvo2", CvO2.toFixed(2) + " mL/dL");

    setHTML("r_ido2", IDO2.toFixed(0) + " mL/min/m²");

    setHTML("r_ivo2", IVO2.toFixed(0) + " mL/min/m²");

    setHTML("r_ext", EXTO2.toFixed(1) + " %");

    /* =====================
       INTERPRETACIÓN
    ===================== */

    let perfil = [];

    if (IC < 2.2)
        perfil.push("🔴 Bajo índice cardíaco");

    if (IC > 4.5)
        perfil.push("🟠 Estado hiperdinámico");

    if (RVS < 800)
        perfil.push("🟢 Vasoplejía / shock distributivo");

    if (RVS > 1500)
        perfil.push("🟣 Vasoconstricción sistémica elevada");

    if (PW > 18)
        perfil.push("🔴 Presiones de llenado izquierdas elevadas");

    if (PAPM > 20)
        perfil.push("🟠 Hipertensión pulmonar");

    if (ITSVD < 7)
        perfil.push("🟡 Disfunción ventricular derecha");

    if (ITSVI < 44)
        perfil.push("🟡 Disfunción ventricular izquierda");

    if (EXTO2 > 30)
        perfil.push("🔴 Aumento de extracción tisular de O₂");

    if (perfil.length === 0)
        perfil.push("✅ Perfil hemodinámico dentro de parámetros habituales");

    setHTML(
        "interpretacionSwan",
        "<ul><li>" + perfil.join("</li><li>") + "</li></ul>"
    );
}
