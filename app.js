/* =========================
   PESO IDEAL
========================= */
function calcularPesoIdeal() {
  const tallaInput = document.getElementById("talla");
  const sexoInput = document.getElementById("sexo");
  const resultado = document.getElementById("resultadoPeso");

  if (!tallaInput || !sexoInput || !resultado) {
    alert("Error interno: campos no encontrados");
    return;
  }

  const talla = parseFloat(tallaInput.value);
  const sexo = sexoInput.value;

  if (isNaN(talla) || talla <= 0) {
    resultado.innerText = "Ingrese una talla válida en cm";
    return;
  }

  let pesoIdeal;

  if (sexo === "hombre") {
    pesoIdeal = 50 + 0.91 * (talla - 152.4);
  } else if (sexo === "mujer") {
    pesoIdeal = 45 + 0.91 * (talla - 152.4);
  } else {
    resultado.innerText = "Seleccione el sexo";
    return;
  }

  resultado.innerText =
    "Peso ideal: " + pesoIdeal.toFixed(1) + " kg";
}

/* =========================
   AJUSTE DE PCO₂
========================= */
function ajustarPCO2() {
  const pco2Act = parseFloat(document.getElementById("pco2Act").value);
  const pco2Des = parseFloat(document.getElementById("pco2Des").value);
  const resultado = document.getElementById("resultadoPCO2");

  if (isNaN(pco2Act) || isNaN(pco2Des)) {
    resultado.innerText =
      "Ingrese PCO₂ actual y PCO₂ deseada";
    return;
  }

  const ajuste = document.querySelector(
    'input[name="ajuste"]:checked'
  ).value;

  let texto = "";

  if (ajuste === "fr") {
    const fr = parseFloat(document.getElementById("fr").value);
    if (isNaN(fr)) {
      resultado.innerText = "Ingrese FR actual";
      return;
    }
    texto = "FR ajustada: " + (fr * (pco2Act / pco2Des)).toFixed(1) + " rpm";
  }

  if (ajuste === "vt") {
    const vt = parseFloat(document.getElementById("vt").value);
    if (isNaN(vt)) {
      resultado.innerText = "Ingrese VT actual";
      return;
    }
    texto = "VT ajustado: " + (vt * (pco2Act / pco2Des)).toFixed(0) + " mL";
  }

  if (ajuste === "vmin") {
    const vmin = parseFloat(document.getElementById("vmin").value);
    if (isNaN(vmin)) {
      resultado.innerText = "Ingrese VMIN actual";
      return;
    }
    texto =
      "VMIN ajustada: " + (vmin * (pco2Act / pco2Des)).toFixed(1) + " L/min";
  }

  resultado.innerText = texto;
}

/* =========================
   GASTO CARDÍACO MANUAL
========================= */
function mostrarGCManual() {
  const gc = parseFloat(document.getElementById("gcManual").value);
  const resultado = document.getElementById("resultadoGCManual");

  if (isNaN(gc) || gc <= 0) {
    resultado.innerText = "Ingrese un GC válido";
    return;
  }

  resultado.innerText =
    "Gasto cardíaco registrado: " + gc.toFixed(2) + " L/min";
}

/* =========================
   GASTO CARDÍACO POR ECO
========================= */
function calcularGCEco() {
  const dtsvi = parseFloat(document.getElementById("dtsvi").value);
  const vti = parseFloat(document.getElementById("vti").value);
  const fc = parseFloat(document.getElementById("fc").value);
  const resultado = document.getElementById("resultadoGCEco");

  if (isNaN(dtsvi) || isNaN(vti) || isNaN(fc)) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  if (dtsvi <= 0 || vti <= 0 || fc <= 0) {
    resultado.innerText = "Valores inválidos";
    return;
  }

  // Área TSVI (cm²)
  const csa = Math.PI * Math.pow(dtsvi / 2, 2);

  // Volumen sistólico (mL)
  const vs = csa * vti;

  // Gasto cardíaco (L/min)
  const gc = (vs * fc) / 1000;

  resultado.innerHTML =
    "<b>Resultados ecocardiográficos:</b><br>" +
    "Área TSVI: " + csa.toFixed(2) + " cm²<br>" +
    "Volumen sistólico: " + vs.toFixed(1) + " mL<br>" +
    "<b>Gasto cardíaco: " + gc.toFixed(2) + " L/min</b>";
}

/* =========================
   UI helpers (result cards)
========================= */
function badge(value, opts = {}) {
  const { min = null, max = null, unit = "", digits = 2, danger = false } = opts;
  const n = Number(value);
  const txt = Number.isFinite(n) ? n.toFixed(digits) : "—";

  let cls = "badge badge--neutral";
  if (Number.isFinite(n) && (min !== null || max !== null)) {
    const okMin = min === null || n >= min;
    const okMax = max === null || n <= max;
    cls = okMin && okMax ? "badge badge--ok" : (danger ? "badge badge--danger" : "badge badge--warn");
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

function calcularBloquePerfusion() {
  const gc = parseFloat(document.getElementById("gc").value);
  const hb = parseFloat(document.getElementById("hb").value);
  const sao2 = parseFloat(document.getElementById("sao2").value);
  const svo2 = parseFloat(document.getElementById("svo2").value);
  const pao2 = parseFloat(document.getElementById("pao2").value);
  const pvo2 = parseFloat(document.getElementById("pvo2").value);

  const paco2 = parseFloat(document.getElementById("paco2").value);
  const pvco2 = parseFloat(document.getElementById("pvco2").value);
  const hco3a = parseFloat(document.getElementById("hco3a").value);
  const hco3v = parseFloat(document.getElementById("hco3v").value);

  const tam = parseFloat(document.getElementById("tam").value);
  const pvc = parseFloat(document.getElementById("pvc").value);
  const pia = parseFloat(document.getElementById("pia").value);
  const pic = parseFloat(document.getElementById("pic").value);

  const resultado = document.getElementById("resultadoPerfusion");

  if (
    [gc, hb, sao2, svo2, pao2, pvo2, paco2, pvco2,
     hco3a, hco3v, tam, pvc, pia, pic].some(isNaN)
  ) {
    resultado.innerText = "Complete todos los campos";
    return;
  }

  /* CONTENIDO DE O2 (mL/dL) */
  const CaO2 = (1.34 * hb * (sao2 / 100)) + (0.003 * pao2);
  const CvO2 = (1.34 * hb * (svo2 / 100)) + (0.003 * pvo2);
  const deltaO2 = CaO2 - CvO2;

  /* BRECHA DE CO2 (VN 2–6 mmHg) */
  const deltaCO2 = pvco2 - paco2; // DCO2 = PCO2v - PCO2a

  /* TRANSPORTE Y CONSUMO */
  const DO2 = gc * CaO2 * 10;
  const VO2 = gc * deltaO2 * 10;
  const REO2 = VO2 / DO2;

  /* COCIENTE RESPIRATORIO */
  const CR = deltaCO2 / deltaO2;

  /* PERFUSIÓN */
  const RVS = ((tam - pvc) / gc) * 80;
  const PPR = tam - pia;
  const PPC = tam - pic;

  // Evitar Infinity/NaN por divisiones
  const REO2pct = (Number.isFinite(REO2) && DO2 !== 0) ? (REO2 * 100) : NaN;
  const CRsafe = (Number.isFinite(CR) && deltaO2 !== 0) ? CR : NaN;

  resultado.innerHTML = `
    <div class="grid">
      ${section("Oxigenación", [
        row("CaO₂", badge(CaO2, { min: 16, max: 22, unit: " mL/dL", digits: 2 }), "VN 16–22"),
        row("CvO₂", badge(CvO2, { min: 12, max: 16, unit: " mL/dL", digits: 2 }), "VN 12–16"),
        row("ΔO₂", badge(deltaO2, { min: 4, max: 6, unit: " mL/dL", digits: 2 }), "VN 4–6"),
      ].join(""))}

      ${section("CO₂", [
        row("ΔCO₂ (PCO₂v − PCO₂a)", badge(deltaCO2, { min: 2, max: 6, unit: " mmHg", digits: 2 }), "VN 2–6 mmHg"),
        row("Cociente (ΔCO₂/ΔO₂)", badge(CRsafe, { min: null, max: 1.0, digits: 2, danger: true }), "VN <1; 1–1.4 sospecha; >1.4 anaerobiosis"),
      ].join(""))}

      ${section("Transporte", [
        row("DO₂", badge(DO2, { min: 900, max: 1100, unit: " mL/min", digits: 0 }), "VN 900–1100"),
        row("VO₂", badge(VO2, { min: 200, max: 250, unit: " mL/min", digits: 0 }), "VN 200–250"),
        row("REO₂", badge(REO2pct, { min: 20, max: 30, unit: " %", digits: 1 }), "VN 20–30 %"),
      ].join(""))}

      ${section("Perfusión", [
        row("RVS", badge(RVS, { min: 800, max: 1200, unit: " dyn·s·cm⁻⁵", digits: 0 }), "VN 800–1200"),
        row("PPR (TAM − PIA)", badge(PPR, { min: 60, max: null, unit: " mmHg", digits: 0 }), "VN >60"),
        row("PPC (TAM − PIC)", badge(PPC, { min: 60, max: 70, unit: " mmHg", digits: 0 }), "VN 60–70"),
      ].join(""))}
    </div>
  `;
}


/* =========================
   ESTADO ÁCIDO - BASE
   - Usa PaCO2 (id: paco2) y HCO3 arterial (id: hco3a) ya ingresados
   - Agrega cálculos de AG corregido por albúmina y Delta ratio
========================= */
function calcularAcidoBase() {
  const resultado = document.getElementById("resultadoAcidoBase");
  if (!resultado) return;

  // Inputs reutilizados
  const hco3a = parseFloat(document.getElementById("hco3a")?.value);
  const paco2 = parseFloat(document.getElementById("paco2")?.value);

  // Inputs nuevos
  const na = parseFloat(document.getElementById("na")?.value);
  const k = parseFloat(document.getElementById("k")?.value);
  const cl = parseFloat(document.getElementById("cl")?.value);
  const alb = parseFloat(document.getElementById("alb")?.value);

  const bican = parseFloat(document.getElementById("bican")?.value);
  const bicap = parseFloat(document.getElementById("bicap")?.value);
  const agapn = parseFloat(document.getElementById("agapn")?.value);
  const agapp = parseFloat(document.getElementById("agapp")?.value);

  // Helpers locales
  const isNum = (v) => Number.isFinite(v);

  // --- 1) COMPENSACIÓN METABÓLICA (Winter y alcalosis metabólica) ---
  let pco2ExpAcMet = NaN;
  let pco2ExpAcMetLo = NaN;
  let pco2ExpAcMetHi = NaN;

  let pco2ExpAlkMet = NaN;
  let pco2ExpAlkMetLo = NaN;
  let pco2ExpAlkMetHi = NaN;

  if (isNum(hco3a)) {
    pco2ExpAcMet = (1.5 * hco3a) + 8;
    pco2ExpAcMetLo = pco2ExpAcMet - 2;
    pco2ExpAcMetHi = pco2ExpAcMet + 2;

    pco2ExpAlkMet = (0.7 * hco3a) + 21;
    pco2ExpAlkMetLo = pco2ExpAlkMet - 2;
    pco2ExpAlkMetHi = pco2ExpAlkMet + 2;
  }

  // --- 2) ACIDOSIS RESPIRATORIA CRÓNICA ---
  // El usuario pidió: HCO3 esperado = (PaCO2 - 40) * 0.4
  // Además mostramos (opcional) HCO3 total esperado asumiendo basal 24.
  let hco3EspRespCronDelta = NaN;
  let hco3EspRespCronTotal = NaN;
  if (isNum(paco2)) {
    hco3EspRespCronDelta = (paco2 - 40) * 0.4;
    hco3EspRespCronTotal = 24 + hco3EspRespCronDelta;
  }

  // --- 3) ANION GAP con K corregido por albúmina ---
  let agap = NaN;
  let agapCorr = NaN;
  let agapCorrAdj = NaN;

  if (isNum(na) && isNum(k) && isNum(cl) && isNum(hco3a)) {
    agap = (na + k) - (cl + hco3a);
    if (isNum(alb)) {
      agapCorrAdj = 0.25 * (4.4 - alb);
      agapCorr = agap + agapCorrAdj;
    }
  }

  // --- 4) DELTA GAP / DELTA BICA ---
  let deltaRatio = NaN;
  let deltaInterpretacion = "—";

  if (isNum(agapp) && isNum(agapn) && isNum(bican) && isNum(bicap)) {
    const denom = (bican - bicap);
    deltaRatio = denom !== 0 ? ((agapp - agapn) / denom) : NaN;

    if (Number.isFinite(deltaRatio)) {
      if (deltaRatio < 0.4) {
        deltaInterpretacion = "<0.4: Acidosis metabólica hiperclorémica";
      } else if (deltaRatio >= 0.4 && deltaRatio < 0.8) {
        deltaInterpretacion = "0.4–0.8: AG elevado + AG normal (mixta / IR aislada)";
      } else if (deltaRatio >= 1 && deltaRatio <= 2) {
        deltaInterpretacion = "1–2: Acidosis metabólica con anion gap aumentado";
      } else if (deltaRatio > 2) {
        deltaInterpretacion = ">2: HCO₃ elevado preexistente (alcalosis metabólica o acidosis resp. crónica)";
      } else {
        // Cubre 0.8–1.0
        deltaInterpretacion = "0.8–1: Zona intermedia (interpretar con clínica y gases)";
      }
    }
  }

  // Render (usamos los mismos componentes visuales que perfusión)
  resultado.innerHTML = `
    <div class="grid">
      ${section("Compensación metabólica", [
        row(
          "PCO₂ esperada en acidosis metabólica",
          isNum(pco2ExpAcMet)
            ? `<div>${badge(pco2ExpAcMet, { unit: " mmHg", digits: 1 })} <span class="muted">(rango ${pco2ExpAcMetLo.toFixed(1)}–${pco2ExpAcMetHi.toFixed(1)})</span></div>`
            : badge(NaN),
          "Fórmula: (1.5 × HCO₃) + 8 (±2)"
        ),
        row(
          "PCO₂ esperada en alcalosis metabólica",
          isNum(pco2ExpAlkMet)
            ? `<div>${badge(pco2ExpAlkMet, { unit: " mmHg", digits: 1 })} <span class="muted">(rango ${pco2ExpAlkMetLo.toFixed(1)}–${pco2ExpAlkMetHi.toFixed(1)})</span></div>`
            : badge(NaN),
          "Fórmula: (0.7 × HCO₃) + 21 (±2)"
        ),
      ].join(""))}

      ${section("Acidosis respiratoria crónica", [
        row(
          "Bicarbonato esperado (ΔHCO₃)",
          badge(hco3EspRespCronDelta, { unit: " mmol/L", digits: 1 }),
          "Fórmula: (PaCO₂ − 40) × 0.4"
        ),
        row(
          "HCO₃ total esperado (si basal 24)",
          badge(hco3EspRespCronTotal, { unit: " mmol/L", digits: 1 }),
          "Referencia útil (24 + ΔHCO₃)."
        )
      ].join(""))}

      ${section("Anion gap (con K) corregido por albúmina", [
        row(
          "AG = (Na + K) − (Cl + HCO₃)",
          badge(agap, { unit: " mEq/L", digits: 1 }),
          "AG normal: <12 mEq/L"
        ),
        row(
          "Corrección por albúmina",
          badge(agapCorrAdj, { unit: "", digits: 2 }),
          "0.25 × (4.4 − ALB)"
        ),
        row(
          "AG corregido",
          badge(agapCorr, { min: null, max: 12, unit: " mEq/L", digits: 1, danger: true }),
          "AG corregido normal: <12"
        )
      ].join(""))}

      ${section("Delta gap / Delta bica", [
        row(
          "DGAP/ΔBICA",
          badge(deltaRatio, { digits: 2 }),
          "(AGAPp − AGAPn) / (BICAn − BICAp)"
        ),
        row(
          "Interpretación",
          `<span class="badge badge--neutral">${deltaInterpretacion}</span>`
        )
      ].join(""))}
    </div>
  `;
}
