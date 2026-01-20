/* =========================
   Helpers
========================= */
function num(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const v = parseFloat(el.value);
  return Number.isFinite(v) ? v : NaN;
}

function anyNaN(arr) {
  return arr.some(v => !Number.isFinite(v));
}

function safeDiv(n, d) {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return NaN;
  return n / d;
}

function clampPercent(p) {
  if (!Number.isFinite(p)) return NaN;
  return Math.max(0, Math.min(100, p));
}

/* =========================
   UI helpers
========================= */
function badge(value, opts = {}) {
  const { min = null, max = null, unit = "", digits = 2, danger = false } = opts;
  const n = Number(value);
  const txt = Number.isFinite(n) ? n.toFixed(digits) : "—";

  let cls = "badge badge--neutral";
  if (Number.isFinite(n) && (min !== null || max !== null)) {
    const okMin = min === null || n >= min;
    const okMax = max === null || n <= max;
    cls = okMin && okMax
      ? "badge badge--ok"
      : (danger ? "badge badge--danger" : "badge badge--warn");
  }
  return `<span class="${cls}">${txt}${unit}</span>`;
}

function row(label, valueHtml, hint = "") {
  return `
    <div class="row">
      <div class="row__label">${label}</div>
      <div class="row__value">${valueHtml}</div>
      ${hint ? `<div class="row__hint">${hint}</div>` : ""}
    </div>
  `;
}

function section(title, bodyHtml) {
  return `
    <div class="card">
      <div class="card__title">${title}</div>
      <div class="card__body">${bodyHtml}</div>
    </div>
  `;
}

/* =========================
   VENTILACIÓN MECÁNICA
========================= */
function calcularPesoIdeal() {
  const talla = num("talla");
  const sexo = document.getElementById("sexo")?.value;

  if (!Number.isFinite(talla) || talla <= 0) {
    document.getElementById("resultadoPeso").innerText = "Ingrese una talla válida";
    return;
  }

  let pesoIdeal;
  if (sexo === "hombre") pesoIdeal = 50 + 0.91 * (talla - 152.4);
  else if (sexo === "mujer") pesoIdeal = 45 + 0.91 * (talla - 152.4);
  else {
    document.getElementById("resultadoPeso").innerText = "Seleccione el sexo";
    return;
  }

  document.getElementById("resultadoPeso").innerText =
    `Peso ideal: ${pesoIdeal.toFixed(1)} kg`;
}

function ajustarPCO2() {
  const pco2Act = num("pco2Act");
  const pco2Des = num("pco2Des");
  const resultado = document.getElementById("resultadoPCO2");

  if (!Number.isFinite(pco2Act) || !Number.isFinite(pco2Des) || pco2Act <= 0 || pco2Des <= 0) {
    resultado.innerText = "Ingrese PCO₂ válida";
    return;
  }

  const factor = pco2Act / pco2Des;
  const fr = num("fr");
  const vt = num("vt");
  const vmin = num("vmin");

  const partes = [];

  if (Number.isFinite(fr) && fr > 0) {
    partes.push(`FR ajustada: ${(fr * factor).toFixed(1)} rpm`);
  } else {
    partes.push("FR ajustada: — (ingrese FR)");
  }

  if (Number.isFinite(vt) && vt > 0) {
    partes.push(`VT ajustado: ${(vt * factor).toFixed(0)} mL`);
  } else {
    partes.push("VT ajustado: — (ingrese VT)");
  }

  if (Number.isFinite(vmin) && vmin > 0) {
    partes.push(`VMIN ajustada: ${(vmin * factor).toFixed(1)} L/min`);
  } else {
    partes.push("VMIN ajustada: — (ingrese VMIN)");
  }

  resultado.innerHTML = partes.join("<br>");
}


/* =========================
   ECOCARDIOGRAFÍA
========================= */
function calcularGCEco() {
  const dtsvi = num("dtsvi");
  const vti = num("vti");
  const fc = num("fc");
  const resultado = document.getElementById("resultadoGCEco");

  if (anyNaN([dtsvi, vti, fc]) || dtsvi <= 0 || vti <= 0 || fc <= 0) {
    resultado.innerText = "Complete todos los campos correctamente";
    return;
  }

  const csa = Math.PI * Math.pow(dtsvi / 2, 2);
  const vs = csa * vti;
  const gc = (vs * fc) / 1000;

  resultado.innerHTML = `
    Área TSVI: ${csa.toFixed(2)} cm²<br>
    Volumen sistólico: ${vs.toFixed(1)} mL<br>
    <b>Gasto cardíaco: ${gc.toFixed(2)} L/min</b>
    <hr>
    <b>Valores de referencia</b><br>
    Normal: 18-22 cm<br>
    Bajo: &lt; 15 cm<br>
    <br>
    <b>Respuesta a fluidos</b><br>
    Positiva si hay un cambio &gt; 12%
  `;
}

/* =========================
   OXIGENACIÓN
========================= */
function calcularOxigenacion() {
  const gc = num("gc");
  const hb = num("hb");
  const sao2 = num("sao2");
  const svo2 = num("svo2");
  const pao2 = num("pao2");
  const pvo2 = num("pvo2");
  const resultado = document.getElementById("resultadoOxigenacion");

  if (anyNaN([gc, hb, sao2, svo2, pao2, pvo2]) || gc <= 0 || hb <= 0) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  const CaO2 = (1.34 * hb * sao2 / 100) + (0.003 * pao2);
  const CvO2 = (1.34 * hb * svo2 / 100) + (0.003 * pvo2);
  const deltaO2 = CaO2 - CvO2;

  const DO2 = gc * CaO2 * 10;
  const VO2 = gc * deltaO2 * 10;
  const REO2 = clampPercent((VO2 / DO2) * 100);

  resultado.innerHTML = `
    CaO₂: ${CaO2.toFixed(2)}<br>
    CvO₂: ${CvO2.toFixed(2)}<br>
    ΔO₂: ${deltaO2.toFixed(2)}<br>
    DO₂: ${DO2.toFixed(0)} mL/min<br>
    VO₂: ${VO2.toFixed(0)} mL/min<br>
    <b>REO₂: ${REO2.toFixed(1)} %</b>
    <hr>
    <b>Valores de referencia REO₂</b><br>
    Normal (Reposo): 15-33%<br>
    Ejercicio Intenso: Puede llegar al 70%.<br>
    &rarr; <b>Bajo:</b> Indica que se entrega más oxígeno del que se consume (flujo alto o bajo consumo), común en sepsis.<br>
    &rarr; <b>Alto:</b> Indica que los tejidos están extrayendo una gran proporción de O₂ disponible, señal de bajo gasto cardíaco o aumento de la demanda.
  `;
}


/* =========================
   PERFUSIÓN / CO₂
========================= */
function calcularDeltaCO2() {
  const paco2 = num("paco2");
  const pvco2 = num("pvco2");
  const resultado = document.getElementById("resultadoCO2");

  if (anyNaN([paco2, pvco2])) {
    resultado.innerText = "Complete PaCO₂ y PvCO₂";
    return;
  }

  const deltaCO2 = pvco2 - paco2;
  resultado.innerHTML = `
    <b>ΔCO₂:</b> ${deltaCO2.toFixed(1)} mmHg
    <hr>
    <b>Interpretación</b>
    <div class="note">
      → Una brecha Pv-aCO₂ elevada (<b>&gt; 6 mmHg</b>) en la sepsis detecta disoxia estancada, ya sea relacionada con un bajo gasto cardíaco o un trastorno en el flujo sanguíneo microcirculatorio
    </div>
  `;
}

function calcularRVS() {
  const tam = num("tam");
  const pvc = num("pvc");
  // Permite usar un GC específico para RVS; si no existe, toma el GC general de oxigenación.
  let gc = num("gc_rvs");
  if (!Number.isFinite(gc)) gc = num("gc");

  const resultado = document.getElementById("resultadoRVS");

  if (anyNaN([tam, pvc, gc]) || gc <= 0) {
    resultado.innerText = "Complete TAM, PVC y GC";
    return;
  }

  const rvs = ((tam - pvc) / gc) * 79.92;
  resultado.innerHTML = `
    <b>RVS:</b> ${rvs.toFixed(0)} dyn·s·cm⁻⁵<br>
    <small>Fórmula: ((TAM − PVC) / GC) × 79.92</small>
  `;
}

function calcularPPR() {
  const tam = num("tam");
  const pia = num("pia");
  const resultado = document.getElementById("resultadoPPR");

  if (anyNaN([tam, pia])) {
    resultado.innerText = "Complete TAM y PIA";
    return;
  }

  const ppr = tam - pia;
  resultado.innerHTML = `
    <b>PPR:</b> ${ppr.toFixed(0)} mmHg<br>
    <small>Fórmula: TAM − PIA</small>
  `;
}

function calcularPPC() {
  const tam = num("tam");
  const pic = num("pic");
  const resultado = document.getElementById("resultadoPPC");

  if (anyNaN([tam, pic])) {
    resultado.innerText = "Complete TAM y PIC";
    return;
  }

  const ppc = tam - pic;
  resultado.innerHTML = `
    <b>PPC:</b> ${ppc.toFixed(0)} mmHg<br>
    <small>Fórmula: TAM − PIC</small>
  `;
}

// Mantengo la función anterior para compatibilidad (si algún botón viejo quedara en caché)
function calcularPerfusion() {
  calcularDeltaCO2();
  calcularRVS();
  calcularPPR();
  calcularPPC();
}

/* =========================
   ANION GAP CORREGIDO
========================= */
function calcularAnionGapCorregido() {
  const na = num("na");
  const k = num("k");
  const cl = num("cl");
  const hco3 = num("hco3_ag");
  const alb = num("alb");
  const resultado = document.getElementById("resultadoAnionGap");

  if (anyNaN([na, k, cl, hco3, alb])) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  const ag = (na + k) - (cl + hco3);
  const agCorregido = ag + 0.25 * (4.4 - alb);

  resultado.innerHTML = `
    <b>Anion gap corregido:</b> ${agCorregido.toFixed(1)} mEq/L
  `;
}

/* =========================
   DELTA GAP / DELTA BICA
   (CORREGIDO SEGÚN INDICACIÓN)
========================= */
function calcularDeltaGap() {
  const bican = num("bican");
  const bicap = num("bicap");
  const agapn = num("agapn");
  const agapp = num("agapp");
  const resultado = document.getElementById("resultadoDeltaGap");

  if (anyNaN([bican, bicap, agapn, agapp])) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  const valor = (agapp - agapn) - (bican - bicap);

  resultado.innerHTML = `
    <b>Resultado:</b> ${valor.toFixed(1)}
    <hr>
    <b>Interpretación</b>
    <ul>
      <li><b>0 a 6:</b> Acidosis metabólica con anion gap aumentado pura</li>
      <li><b>> 6:</b> Existe una alcalosis metabólica</li>
      <li><b>> −6:</b> Existe otra acidosis metabólica</li>
    </ul>
    <small>Fórmula: (AGAPp − AGAPn) − (BICAn − BICAp)</small>
  `;
}

/* =========================
   SODIO Y CALCIO CORREGIDO
========================= */
function calcularSodioCorregido() {
  const nas = num("nas");
  const glucs = num("glucs");
  const resultado = document.getElementById("resultadoNaCorregido");

  if (anyNaN([nas, glucs])) {
    resultado.innerText = "Complete Sodio medido (NAs) y Glucosa sérica (GLUCs)";
    return;
  }

  const nac = nas + (1.6 * ((glucs - 100) / 100));
  resultado.innerHTML = `
    <b>Na corregido (NAc):</b> ${nac.toFixed(1)} mEq/L<br>
    <small>Fórmula: NAc = NAs + (1.6 × ((GLUCs − 100) / 100))</small>
  `;
}

function calcularCalcioCorregido() {
  const cas = num("cas");
  const albs = num("albs");
  const resultado = document.getElementById("resultadoCaCorregido");

  if (anyNaN([cas, albs])) {
    resultado.innerText = "Complete Calcio sérico (CAs) y Albúmina sérica (ALBs)";
    return;
  }

  const cac = cas - (0.8 * (4 - albs));
  resultado.innerHTML = `
    <b>Ca corregido (CAc):</b> ${cac.toFixed(2)}<br>
    <small>Fórmula: CAc = CAs − (0.8 × (4 − ALBs))</small>
  `;
}

/* =========================
   SOFA-2
========================= */
function calcularSOFA2() {
  const campos = [
    { id: "sofa_neuro", label: "Sistema nervioso (GCS)" },
    { id: "sofa_resp", label: "Respiratorio (PaO₂/FiO₂)" },
    { id: "sofa_cv", label: "Cardiovascular" },
    { id: "sofa_higado", label: "Hígado (Bilirrubina)" },
    { id: "sofa_rinon", label: "Riñón" },
    { id: "sofa_coag", label: "Hemostasia (Plaquetas)" },
  ];

  const valores = {};
  for (const c of campos) {
    const el = document.getElementById(c.id);
    if (!el) continue;
    const v = parseInt(el.value, 10);
    if (!Number.isFinite(v)) {
      document.getElementById("resultadoSOFA2").innerText = "Seleccione todas las variables para calcular SOFA-2";
      return;
    }
    valores[c.label] = v;
  }

  const total = Object.values(valores).reduce((a, b) => a + b, 0);

  const detalle = Object.entries(valores)
    .map(([k, v]) => `<li>${k}: <b>${v}</b></li>`)
    .join("");

  document.getElementById("resultadoSOFA2").innerHTML = `
    <b>SOFA-2 total:</b> ${total} / 24
    <hr>
    <b>Detalle por sistema</b>
    <ul>${detalle}</ul>
  `;
}
