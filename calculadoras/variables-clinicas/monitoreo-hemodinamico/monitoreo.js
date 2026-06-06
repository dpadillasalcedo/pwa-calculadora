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

function getNum(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;

  const value = Number(el.value);
  return Number.isFinite(value) ? value : null;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function claseValor(valor, bajo, alto) {
  if (valor < bajo || valor > alto) return "result-warn";
  return "result-normal";
}

function calcularSwanGanz() {
  const PAS = getNum("pas");
  const PAD = getNum("pad");
  const FC = getNum("fc");
  const GC = getNum("gc");
  const SC = getNum("sc");

  const PVC = getNum("pvc");
  const PAPM = getNum("papm");
  const PAPD = getNum("papd");
  const PW = getNum("pw");

  const Hb = getNum("hb");
  const SaO2 = getNum("sao2");
  const SvO2 = getNum("svo2");

  const PaO2 = getNum("pao2");
  const PvO2 = getNum("pvo2");

  const campos = [
    PAS, PAD, FC, GC, SC,
    PVC, PAPM, PAPD, PW,
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

  const RVP_WU = (PAPM - PW) / GC;
  const RVP = RVP_WU * 80;

  const TPG = PAPM - PW;
  const DPG = PAPD - PW;

  const CaO2 =
    (Hb * 1.34 * (SaO2 / 100)) +
    (PaO2 * 0.0031);

  const CvO2 =
    (Hb * 1.34 * (SvO2 / 100)) +
    (PvO2 * 0.0031);

  const IDO2 = IC * CaO2 * 10;
  const IVO2 = IC * (CaO2 - CvO2) * 10;
  const EXTO2 = (IVO2 / IDO2) * 100;

  setHTML("r_tam", `<span class="${claseValor(TAM, 70, 100)}">${TAM.toFixed(1)} mmHg</span>`);
  setHTML("r_ic", `<span class="${claseValor(IC, 2.5, 4.5)}">${IC.toFixed(2)} L/min/m²</span>`);
  setHTML("r_vs", `<span class="${claseValor(VS, 60, 100)}">${VS.toFixed(0)} mL/lat</span>`);
  setHTML("r_ivs", `<span class="${claseValor(IVS, 33, 47)}">${IVS.toFixed(1)} mL/lat/m²</span>`);
  setHTML("r_itsvi", `<span class="${claseValor(ITSVI, 45, 60)}">${ITSVI.toFixed(1)} g·m/m²</span>`);
  setHTML("r_itsvd", `<span class="${claseValor(ITSVD, 5, 10)}">${ITSVD.toFixed(1)} g·m/m²</span>`);
  setHTML("r_rvs", `<span class="${claseValor(RVS, 800, 1200)}">${RVS.toFixed(0)} dyn·s·cm⁻⁵</span>`);
  setHTML("r_rvp", `<span class="${RVP > 160 ? "result-bad" : "result-normal"}">${RVP.toFixed(0)} dyn·s·cm⁻⁵</span>`);
  setHTML("r_rvp_wu", `<span class="${RVP_WU > 2 ? "result-bad" : "result-normal"}">${RVP_WU.toFixed(2)} WU</span>`);
  setHTML("r_tpg", `<span class="${TPG >= 12 ? "result-warn" : "result-normal"}">${TPG.toFixed(1)} mmHg</span>`);
  setHTML("r_dpg", `<span class="${DPG >= 7 ? "result-bad" : "result-normal"}">${DPG.toFixed(1)} mmHg</span>`);
  setHTML("r_cao2", `<span class="${claseValor(CaO2, 16, 22)}">${CaO2.toFixed(2)} mL/dL</span>`);
  setHTML("r_cvo2", `<span class="${claseValor(CvO2, 12, 16)}">${CvO2.toFixed(2)} mL/dL</span>`);
  setHTML("r_ido2", `<span class="${claseValor(IDO2, 500, 700)}">${IDO2.toFixed(0)} mL/min/m²</span>`);
  setHTML("r_ivo2", `<span class="${claseValor(IVO2, 110, 160)}">${IVO2.toFixed(0)} mL/min/m²</span>`);
  setHTML("r_ext", `<span class="${claseValor(EXTO2, 20, 30)}">${EXTO2.toFixed(1)} %</span>`);

  let perfil = [];

  if (PAPM <= 20) {
    perfil.push("✅ No cumple criterio hemodinámico de hipertensión pulmonar: PAPM ≤ 20 mmHg.");
  }

  if (PAPM > 20 && PW <= 15 && RVP_WU > 2) {
    perfil.push("🫁 Hipertensión pulmonar precapilar: PAPM > 20 mmHg, PW/PCP ≤ 15 mmHg y RVP > 2 WU.");
  }

  if (PAPM > 20 && PW > 15 && RVP_WU <= 2) {
    perfil.push("🫁 Hipertensión pulmonar postcapilar aislada: PAPM > 20 mmHg, PW/PCP > 15 mmHg y RVP ≤ 2 WU. Sugiere origen por corazón izquierdo.");
  }

  if (PAPM > 20 && PW > 15 && RVP_WU > 2) {
    perfil.push("🫁 Hipertensión pulmonar combinada pre y postcapilar: PAPM > 20 mmHg, PW/PCP > 15 mmHg y RVP > 2 WU.");
  }

  if (PAPM > 20 && PW <= 15 && RVP_WU <= 2) {
    perfil.push("⚠ PAPM elevada con PW/PCP normal, pero RVP no elevada. Revisar mediciones, gasto cardíaco alto o situación hiperdinámica.");
  }

  if (DPG >= 7) {
    perfil.push("🔴 DPG elevado: sugiere componente vascular pulmonar significativo o remodelado vascular pulmonar.");
  } else {
    perfil.push("✅ DPG no elevado: menor evidencia de componente vascular pulmonar fijo por este parámetro.");
  }

  if (TPG >= 12) {
    perfil.push("🟠 TPG elevado: gradiente transpulmonar aumentado.");
  }

  if (RVP_WU > 2) {
    perfil.push("🟠 RVP elevada: aumento de poscarga del ventrículo derecho.");
  }

  if (PW > 15) {
    perfil.push("🟣 PW/PCP elevada: sugiere aumento de presiones de llenado izquierdas.");
  }

  if (IC < 2.2) perfil.push("🔴 Bajo índice cardíaco.");
  if (IC > 4.5) perfil.push("🟠 Estado hiperdinámico.");

  if (VS < 60) perfil.push("🔴 Volumen sistólico bajo.");
  if (IVS < 33) perfil.push("🟡 Índice de volumen sistólico bajo.");

  if (ITSVD < 5) perfil.push("🟡 Trabajo sistólico ventricular derecho bajo.");
  if (ITSVI < 45) perfil.push("🟡 Trabajo sistólico ventricular izquierdo bajo.");

  if (CaO2 < 16) perfil.push("🔴 Bajo contenido arterial de oxígeno.");
  if (CvO2 < 12) perfil.push("🟡 Bajo contenido venoso de oxígeno.");

  if (IDO2 < 500) perfil.push("🔴 Bajo aporte indexado de oxígeno.");
  if (EXTO2 > 30) perfil.push("🔴 Extracción tisular de oxígeno aumentada.");

  setHTML(
    "interpretacionSwan",
    `
    <strong>Interpretación hemodinámica:</strong>
    <ul>
      <li>${perfil.join("</li><li>")}</li>
    </ul>

    <p>
      <strong>Nota:</strong> La clasificación de hipertensión pulmonar requiere integración clínica.
      La PW/PCP debe estar correctamente medida, idealmente al final de la espiración.
      El DPG se interpreta como apoyo y no reemplaza la clasificación basada en PAPM, PW/PCP y RVP.
    </p>
    `
  );
}
