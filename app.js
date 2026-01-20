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

  const ajuste = document.querySelector('input[name="ajuste"]:checked')?.value;
  if (!ajuste) {
    resultado.innerText = "Seleccione qué ajustar";
    return;
  }

  let texto = "";

  if (ajuste === "fr") {
    const fr = num("fr");
    texto = `FR ajustada: ${(fr * (pco2Act / pco2Des)).toFixed(1)} rpm`;
  }
  if (ajuste === "vt") {
    const vt = num("vt");
    texto = `VT ajustado: ${(vt * (pco2Act / pco2Des)).toFixed(0)} mL`;
  }
  if (ajuste === "vmin") {
    const vmin = num("vmin");
    texto = `VMIN ajustada: ${(vmin * (pco2Act / pco2Des)).toFixed(1)} L/min`;
  }

  resultado.innerText = texto;
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
  `;
}

/* =========================
   PERFUSIÓN / CO₂
========================= */
function calcularPerfusion() {
  const paco2 = num("paco2");
  const pvco2 = num("pvco2");
  const tam = num("tam");
  const pvc = num("pvc");
  const pia = num("pia");
  const pic = num("pic");

  const resultado = document.getElementById("resultadoPerfusion");

  if (anyNaN([paco2, pvco2, tam, pvc, pia, pic])) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  const deltaCO2 = pvco2 - paco2;
  const RVS = ((tam - pvc) * 80).toFixed(0);
  const PPR = tam - pia;
  const PPC = tam - pic;

  resultado.innerHTML = `
    ΔCO₂: ${deltaCO2.toFixed(1)} mmHg<br>
    RVS: ${RVS} dyn·s·cm⁻⁵<br>
    PPR: ${PPR} mmHg<br>
    PPC: ${PPC} mmHg
  `;
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
      <li><b>< −6:</b> Existe otra acidosis metabólica</li>
    </ul>
    <small>Fórmula: (AGAPp − AGAPn) − (BICAn − BICAp)</small>
  `;
}
