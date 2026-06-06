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

  const ppv = parseFloat(document.getElementById("ppv").value);
  const svv = parseFloat(document.getElementById("svv").value);
  const map = parseFloat(document.getElementById("map").value);
  const vaso = parseFloat(document.getElementById("vaso").value);

  if (isNaN(ppv) || isNaN(svv)) {
    alert("Completar PPV y SVV");
    return;
  }

  if (svv <= 0) {
    alert("SVV debe ser mayor que cero");
    return;
  }

  const eadyn = ppv / svv;

  let html = `
    <div class="result">
      <strong>Eadyn:</strong> ${eadyn.toFixed(2)}
    </div>
  `;

  if (eadyn >= 1.0) {
    html += `
      <div class="result good">
        ✔ Eadyn elevada<br>
        → Mayor probabilidad de que un aumento del volumen sistólico se traduzca en aumento de la PAM.<br>
        → Sugiere buen acoplamiento dinámico presión-volumen.<br>
        → Si el paciente es respondedor a fluidos, el volumen podría mejorar la presión arterial.
      </div>
    `;
  } 
  else if (eadyn >= 0.8 && eadyn < 1.0) {
    html += `
      <div class="result warn">
        ⚠ Zona gris<br>
        → La respuesta de la PAM al aumento del volumen sistólico es incierta.<br>
        → Integrar con ecocardiografía, lactato, perfusión periférica, diuresis y tendencia de vasopresores.
      </div>
    `;
  } 
  else {
    html += `
      <div class="result bad">
        ✖ Eadyn baja<br>
        → Menor probabilidad de que el aumento del volumen sistólico eleve la PAM.<br>
        → Sugiere desacople presión-volumen o predominio de vasoplejía.<br>
        → Considerar optimización del tono vascular según contexto clínico.
      </div>
    `;
  }

  if (!isNaN(map) && !isNaN(vaso)) {
    if (map >= 65 && eadyn >= 1.0 && vaso <= 0.1) {
      html += `
        <div class="result good">
          🟢 Perfil compatible con posible reducción progresiva de vasopresor si la perfusión es adecuada.
        </div>
      `;
    } else if (map >= 65 && eadyn < 0.8) {
      html += `
        <div class="result warn">
          🟡 PAM aceptable, pero Eadyn baja: vigilar vasoplejía y perfusión antes de reducir vasopresor.
        </div>
      `;
    } else {
      html += `
        <div class="result warn">
          🟡 No óptimo para destete de vasopresor: valorar PAM, dosis, perfusión y tendencia clínica.
        </div>
      `;
    }
  }

  html += `
    <div class="note">
      Eadyn = PPV / SVV. Interpreta la capacidad del cambio de volumen sistólico para generar cambio de presión arterial.
      No predice por sí sola respuesta a fluidos. Usar solo en condiciones válidas: ventilación mecánica controlada,
      ritmo sinusal, ausencia de esfuerzo respiratorio significativo y mediciones confiables de PPV/SVV.
    </div>
  `;

  document.getElementById("resultado").innerHTML = html;
}

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

  const campos = [
    PAS, PAD, FC, GC, SC,
    PVC, PAPM, PW,
    Hb, SaO2, SvO2,
    PaO2, PvO2
  ];

  if (campos.includes(null)) {
    alert("Complete todos los campos");
    return;
  }

  if (FC <= 0 || GC <= 0 || SC <= 0) {
    alert("FC, GC y SC deben ser mayores que cero");
    return;
  }

  if (SaO2 < 0 || SaO2 > 100 || SvO2 < 0 || SvO2 > 100) {
    alert("SaO₂ y SvO₂ deben estar entre 0 y 100%");
    return;
  }

  const TAM = PAD + ((PAS - PAD) / 3);

  const IC = GC / SC;

  const VS = (GC * 1000) / FC;

  const IVS = VS / SC;

  const ITSVI = IVS * (TAM - PW) * 0.0136;

  const ITSVD = IVS * (PAPM - PVC) * 0.0136;

  const RVS = ((TAM - PVC) * 80) / GC;

  const RVP = ((PAPM - PW) * 80) / GC;

  const CaO2 =
    (Hb * 1.34 * (SaO2 / 100)) +
    (PaO2 * 0.0031);

  const CvO2 =
    (Hb * 1.34 * (SvO2 / 100)) +
    (PvO2 * 0.0031);

  const IDO2 = IC * CaO2 * 10;

  const IVO2 = IC * (CaO2 - CvO2) * 10;

  const EXTO2 = (IVO2 / IDO2) * 100;

  setHTML("r_tam", TAM.toFixed(1) + " mmHg");
  setHTML("r_ic", IC.toFixed(2) + " L/min/m²");
  setHTML("r_vs", VS.toFixed(0) + " mL/lat");
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

  let perfil = [];

  if (IC < 2.2) perfil.push("🔴 Bajo índice cardíaco");
  if (IC > 4.5) perfil.push("🟠 Estado hiperdinámico");

  if (VS < 60) perfil.push("🔴 Volumen sistólico bajo");
  if (VS > 100) perfil.push("🟠 Volumen sistólico elevado");

  if (IVS < 33) perfil.push("🟡 Índice de volumen sistólico bajo");
  if (IVS > 47) perfil.push("🟠 Índice de volumen sistólico elevado");

  if (RVS < 800) perfil.push("🟢 Vasoplejía / shock distributivo");
  if (RVS > 1200) perfil.push("🟣 Vasoconstricción sistémica elevada");

  if (RVP > 120) perfil.push("🟠 Resistencia vascular pulmonar elevada");

  if (PW > 18) perfil.push("🔴 Presiones de llenado izquierdas elevadas");
  if (PAPM > 20) perfil.push("🟠 Hipertensión pulmonar");

  if (ITSVI < 45) perfil.push("🟡 Trabajo sistólico ventricular izquierdo bajo");
  if (ITSVD < 5) perfil.push("🟡 Trabajo sistólico ventricular derecho bajo");

  if (CaO2 < 16) perfil.push("🔴 Bajo contenido arterial de oxígeno");
  if (CvO2 < 12) perfil.push("🟡 Bajo contenido venoso de oxígeno");

  if (IDO2 < 500) perfil.push("🔴 Bajo aporte indexado de oxígeno");
  if (IVO2 > 160) perfil.push("🟠 Consumo indexado de oxígeno elevado");

  if (EXTO2 > 30) perfil.push("🔴 Aumento de extracción tisular de O₂");
  if (EXTO2 < 20) perfil.push("🟡 Extracción tisular de O₂ baja");

  if (perfil.length === 0) {
    perfil.push("✅ Perfil hemodinámico dentro de parámetros habituales");
  }

  setHTML(
    "interpretacionSwan",
    "<strong>Interpretación:</strong><ul><li>" +
      perfil.join("</li><li>") +
    "</li></ul>"
  );
}
