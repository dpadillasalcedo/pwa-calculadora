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
   UI helpers (cards/badges)
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
   VENTILACION MECANICA
========================= */
function calcularPesoIdeal() {
  const talla = num("talla");
  const sexoEl = document.getElementById("sexo");
  if (!sexoEl) return;
  const sexo = sexoEl.value;

  if (!Number.isFinite(talla) || talla <= 0) {
    document.getElementById("resultadoPeso").innerText = "Ingrese una talla válida en cm";
    return;
  }

  let pesoIdeal;
  if (sexo === "hombre") {
    pesoIdeal = 50 + 0.91 * (talla - 152.4);
  } else if (sexo === "mujer") {
    pesoIdeal = 45 + 0.91 * (talla - 152.4);
  } else {
    document.getElementById("resultadoPeso").innerText = "Seleccione el sexo";
    return;
  }

  document.getElementById("resultadoPeso").innerText = `Peso ideal: ${pesoIdeal.toFixed(1)} kg`;
}

function ajustarPCO2() {
  const pco2Act = num("pco2Act");
  const pco2Des = num("pco2Des");
  const resultado = document.getElementById("resultadoPCO2");
  if (!resultado) return;

  if (!Number.isFinite(pco2Act) || !Number.isFinite(pco2Des) || pco2Act <= 0 || pco2Des <= 0) {
    resultado.innerText = "Ingrese PCO₂ actual y PCO₂ deseada (valores > 0)";
    return;
  }

  const selected = document.querySelector('input[name="ajuste"]:checked');
  if (!selected) {
    resultado.innerText = "Seleccione el parámetro a ajustar";
    return;
  }

  const ajuste = selected.value;
  let texto = "";

  if (ajuste === "fr") {
    const fr = num("fr");
    if (!Number.isFinite(fr) || fr <= 0) {
      resultado.innerText = "Ingrese FR actual (valor > 0)";
      return;
    }
    texto = `FR ajustada: ${(fr * (pco2Act / pco2Des)).toFixed(1)} rpm`;
  }

  if (ajuste === "vt") {
    const vt = num("vt");
    if (!Number.isFinite(vt) || vt <= 0) {
      resultado.innerText = "Ingrese VT actual (valor > 0)";
      return;
    }
    texto = `VT ajustado: ${(vt * (pco2Act / pco2Des)).toFixed(0)} mL`;
  }

  if (ajuste === "vmin") {
    const vmin = num("vmin");
    if (!Number.isFinite(vmin) || vmin <= 0) {
      resultado.innerText = "Ingrese VMIN actual (valor > 0)";
      return;
    }
    texto = `VMIN ajustada: ${(vmin * (pco2Act / pco2Des)).toFixed(1)} L/min`;
  }

  resultado.innerText = texto;
}

/* =========================
   ECOCARDIOGRAFIA
========================= */
function calcularGCEco() {
  const dtsvi = num("dtsvi");
  const vti = num("vti");
  const fc = num("fc");
  const resultado = document.getElementById("resultadoGCEco");
  if (!resultado) return;

  if (anyNaN([dtsvi, vti, fc])) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  if (dtsvi <= 0 || vti <= 0 || fc <= 0) {
    resultado.innerText = "Valores inválidos (deben ser > 0)";
    return;
  }

  const csa = Math.PI * Math.pow(dtsvi / 2, 2);
  const vs = csa * vti;
  const gc = (vs * fc) / 1000;

  resultado.innerHTML =
    "<b>Resultados ecocardiográficos:</b><br>" +
    `Área TSVI: ${csa.toFixed(2)} cm²<br>` +
    `Volumen sistólico: ${vs.toFixed(1)} mL<br>` +
    `<b>Gasto cardíaco: ${gc.toFixed(2)} L/min</b>`;
}

/* =========================
   OXIGENACION (INDEPENDIENTE)
========================= */
function calcularOxigenacion() {
  const gc = num("gc");
  const hb = num("hb");
  const sao2 = num("sao2");
  const svo2 = num("svo2");
  const pao2 = num("pao2");
  const pvo2 = num("pvo2");
  const resultado = document.getElementById("resultadoOxigenacion");
  if (!resultado) return;

  if (anyNaN([gc, hb, sao2, svo2, pao2, pvo2])) {
    resultado.innerText = "Complete GC, Hb, SaO₂, SvO₂, PaO₂ y PvO₂";
    return;
  }
  if (gc <= 0 || hb <= 0) {
    resultado.innerText = "GC y Hb deben ser > 0";
    return;
  }

  const CaO2 = (1.34 * hb * (sao2 / 100)) + (0.003 * pao2);
  const CvO2 = (1.34 * hb * (svo2 / 100)) + (0.003 * pvo2);
  const deltaO2 = CaO2 - CvO2;

  // Transporte (independiente del bloque de perfusión)
  const DO2 = gc * CaO2 * 10;
  const VO2 = gc * deltaO2 * 10;
  const REO2 = safeDiv(VO2, DO2);
  const REO2pct = clampPercent(REO2 * 100);

  resultado.innerHTML = `
    <div class="grid">
      ${section("Oxigenación · Contenido de O₂", [
        row("CaO₂", badge(CaO2, { min: 16, max: 22, unit: " mL/dL", digits: 2 }), "VN 16–22"),
        row("CvO₂", badge(CvO2, { min: 12, max: 16, unit: " mL/dL", digits: 2 }), "VN 12–16"),
        row("ΔO₂", badge(deltaO2, { min: 4, max: 6, unit: " mL/dL", digits: 2 }), "VN 4–6"),
      ].join(""))}

      ${section("Transporte de O₂", [
        row("DO₂", badge(DO2, { min: 900, max: 1100, unit: " mL/min", digits: 0 }), "VN 900–1100"),
        row("VO₂", badge(VO2, { min: 200, max: 250, unit: " mL/min", digits: 0 }), "VN 200–250"),
        row("REO₂", badge(REO2pct, { min: 20, max: 30, unit: " %", digits: 1 }), "VN 20–30 %"),
      ].join(""))}
    </div>
  `;
}

/* =========================
   CO2 + TRANSPORTE + PERFUSION (INDEPENDIENTE)
   - Calcula CO2 gap, DO2/VO2/REO2 y presiones/perfusion
   - Recalcula CaO2/CvO2 internamente para DO2/VO2 (no depende del boton de oxigenacion)
========================= */
function calcularPerfusion() {
  const gc = num("gc");
  const hb = num("hb");
  const sao2 = num("sao2");
  const svo2 = num("svo2");
  const pao2 = num("pao2");
  const pvo2 = num("pvo2");

  const paco2 = num("paco2");
  const pvco2 = num("pvco2");

  const tam = num("tam");
  const pvc = num("pvc");
  const pia = num("pia");
  const pic = num("pic");

  const resultado = document.getElementById("resultadoPerfusion");
  if (!resultado) return;

  if (anyNaN([gc, hb, sao2, svo2, pao2, pvo2, paco2, pvco2, tam, pvc, pia, pic])) {
    resultado.innerText = "Complete todos los campos requeridos";
    return;
  }
  if (gc <= 0 || hb <= 0) {
    resultado.innerText = "GC y Hb deben ser > 0";
    return;
  }

  // O2 (para DO2 / VO2)
  const CaO2 = (1.34 * hb * (sao2 / 100)) + (0.003 * pao2);
  const CvO2 = (1.34 * hb * (svo2 / 100)) + (0.003 * pvo2);
  const deltaO2 = CaO2 - CvO2;

  // Brecha de CO2 (mmHg)
  const deltaCO2 = pvco2 - paco2; // VN 2–6 mmHg

  // Transporte
  const DO2 = gc * CaO2 * 10;
  const VO2 = gc * deltaO2 * 10;
  const REO2 = safeDiv(VO2, DO2);
  const REO2pct = clampPercent(REO2 * 100);

  // Indicador (nota: mezcla unidades si se usa deltaCO2 mmHg con deltaO2 mL/dL)
  const CR = safeDiv(deltaCO2, deltaO2);

  // Perfusión
  const RVS = safeDiv((tam - pvc), gc);
  const RVS80 = Number.isFinite(RVS) ? (RVS * 80) : NaN;
  const PPR = tam - pia;
  const PPC = tam - pic;

  resultado.innerHTML = `
    <div class="grid">
      ${section("CO₂", [
        row("ΔCO₂ (PCO₂v − PCO₂a)", badge(deltaCO2, { min: 2, max: 6, unit: " mmHg", digits: 2 }), "VN 2–6 mmHg"),
        row("Cociente (ΔCO₂/ΔO₂)", badge(CR, { min: null, max: 1.0, digits: 2, danger: true }), "VN <1; 1–1.4 sospecha; >1.4 anaerobiosis"),
      ].join(""))}

      ${section("Transporte", [
        row("DO₂", badge(DO2, { min: 900, max: 1100, unit: " mL/min", digits: 0 }), "VN 900–1100"),
        row("VO₂", badge(VO2, { min: 200, max: 250, unit: " mL/min", digits: 0 }), "VN 200–250"),
        row("REO₂", badge(REO2pct, { min: 20, max: 30, unit: " %", digits: 1 }), "VN 20–30 %"),
      ].join(""))}

      ${section("Perfusión", [
        row("RVS", badge(RVS80, { min: 800, max: 1200, unit: " dyn·s·cm⁻⁵", digits: 0 }), "VN 800–1200"),
        row("PPR (TAM − PIA)", badge(PPR, { min: 60, max: null, unit: " mmHg", digits: 0 }), "VN >60"),
        row("PPC (TAM − PIC)", badge(PPC, { min: 60, max: 70, unit: " mmHg", digits: 0 }), "VN 60–70"),
      ].join(""))}
    </div>
  `;
}

/* =========================
   ESTADO ACIDO - BASE (INDEPENDIENTE)
========================= */
function calcularCompensacion() {
  const hco3a = num("hco3a");
  const paco2 = num("paco2");
  const resultado = document.getElementById("resultadoCompensacion");
  if (!resultado) return;

  if (!Number.isFinite(hco3a)) {
    resultado.innerText = "Ingrese HCO₃⁻ arterial";
    return;
  }

  // PCO2 esperada en acidosis metabolica (Winter)
  const pco2AcMet = (1.5 * hco3a) + 8;
  const pco2AcMetMin = pco2AcMet - 2;
  const pco2AcMetMax = pco2AcMet + 2;

  // PCO2 esperada en alcalosis metabolica
  const pco2AlMet = (0.7 * hco3a) + 21;
  const pco2AlMetMin = pco2AlMet - 2;
  const pco2AlMetMax = pco2AlMet + 2;

  // Acidosis respiratoria cronica (delta HCO3 esperado)
  if (!Number.isFinite(paco2)) {
    // Puede que no esté ingresada PaCO2: mostramos igual las dos primeras
    resultado.innerHTML = `
      <div class="grid">
        ${section("PCO₂ esperada", [
          row("Acidosis metabólica", `<span class="mono">${pco2AcMet.toFixed(1)} (±2)</span>`, `${pco2AcMetMin.toFixed(1)}–${pco2AcMetMax.toFixed(1)} mmHg`),
          row("Alcalosis metabólica", `<span class="mono">${pco2AlMet.toFixed(1)} (±2)</span>`, `${pco2AlMetMin.toFixed(1)}–${pco2AlMetMax.toFixed(1)} mmHg`),
        ].join(""))}
      </div>
      <p class="note">Nota: para acidosis respiratoria crónica, ingrese PaCO₂.</p>
    `;
    return;
  }

  const deltaHco3RespCron = (paco2 - 40) * 0.4;
  const hco3RespCronBase24 = 24 + deltaHco3RespCron;

  resultado.innerHTML = `
    <div class="grid">
      ${section("PCO₂ esperada", [
        row("Acidosis metabólica", `<span class="mono">${pco2AcMet.toFixed(1)} (±2)</span>`, `${pco2AcMetMin.toFixed(1)}–${pco2AcMetMax.toFixed(1)} mmHg`),
        row("Alcalosis metabólica", `<span class="mono">${pco2AlMet.toFixed(1)} (±2)</span>`, `${pco2AlMetMin.toFixed(1)}–${pco2AlMetMax.toFixed(1)} mmHg`),
      ].join(""))}

      ${section("Acidosis respiratoria crónica", [
        row("ΔHCO₃⁻ esperado", `<span class="mono">${deltaHco3RespCron.toFixed(1)}</span>`, "(PaCO₂ − 40) × 0.4"),
        row("HCO₃⁻ esperado", `<span class="mono">${hco3RespCronBase24.toFixed(1)}</span>`, "Si HCO₃⁻ basal ≈ 24"),
      ].join(""))}
    </div>
  `;
}

/* =========================
   ANION GAP CORREGIDO (INDEPENDIENTE)
   - Muestra SOLO "Anion gap corregido" como pediste
========================= */
function calcularAnionGapCorregido() {
  const na = num("na");
  const k = num("k");
  const cl = num("cl");
  const alb = num("alb");
  // Usa el input propio del bloque (independiente)
  const hco3 = num("hco3_ag");

  const resultado = document.getElementById("resultadoAnionGap");
  if (!resultado) return;

  if (anyNaN([na, k, cl, alb, hco3])) {
    resultado.innerText = "Complete Na, K, Cl, HCO₃ y Albúmina";
    return;
  }

  const ag = (na + k) - (cl + hco3);
  const correccionAlb = 0.25 * (4.4 - alb);
  const agCorregido = ag + correccionAlb;

  resultado.innerHTML = `
    <div class="grid">
      ${section("Anion gap corregido", [
        row("AG corregido", badge(agCorregido, { min: null, max: 12, unit: " mEq/L", digits: 1, danger: true }), "VN < 12 mEq/L"),
      ].join(""))}
    </div>
    <p class="note">Se calcula: (Na+K) − (Cl+HCO₃) + 0.25 × (4.4 − ALB)</p>
  `;
}

/* =========================
   DELTA GAP / DELTA BICA (INDEPENDIENTE)
========================= */
function interpretarDeltaRatio(r) {
  if (!Number.isFinite(r)) return "No calculable";
  if (r < 0.4) return "<0.4: acidosis metabólica hiperclorémica";
  if (r >= 0.4 && r <= 0.8) return "0.4–0.8: AG elevado + AG normal (ej. IR aislada)";
  if (r >= 1 && r <= 2) return "1–2: acidosis metabólica con anion gap aumentado";
  if (r > 2) return ">2: bicarbonato elevado preexistente (alcalosis metabólica o acidosis resp. crónica)";
  return "0.8–1: zona intermedia (interpretar con contexto)";
}

function calcularDeltaGap() {
  const bican = num("bican");
  const bicap = num("bicap");
  const agapn = num("agapn");
  const agapp = num("agapp");
  const resultado = document.getElementById("resultadoDeltaGap");
  if (!resultado) return;

  if (anyNaN([bican, bicap, agapn, agapp])) {
    resultado.innerText = "Complete BICAn, BICAp, AGAPn y AGAPp";
    return;
  }

  const denom = (bican - bicap);
  const ratio = safeDiv((agapp - agapn), denom);
  const interpretacion = interpretarDeltaRatio(ratio);

  resultado.innerHTML = `
    <div class="grid">
      ${section("Delta gap / Delta bica", [
        row("DGAP/ΔBICA", badge(ratio, { digits: 2 }), interpretacion),
      ].join(""))}
    </div>
    <p class="note">Fórmula: (AGAPp − AGAPn) / (BICAn − BICAp)</p>
  `;
}

// Compatibilidad con el HTML
function calcularAcidoBase() { calcularCompensacion(); }

function calcularCompensacionMetabolica(){ calcularCompensacion(); }
