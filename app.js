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

  resultado.innerHTML =
  "<b>OXIGENACIÓN</b><br>" +
  "CaO₂: " + CaO2.toFixed(2) + " mL/dL (VN 16–22)<br>" +
  "CvO₂: " + CvO2.toFixed(2) + " mL/dL (VN 12–16)<br>" +
  "ΔO₂: " + deltaO2.toFixed(2) + " mL/dL (VN 4–6)<br><br>" +

  "<b>CO₂</b><br>" +
  "ΔCO₂: " + deltaCO2.toFixed(2) + " (VN 2–6)<br>" +
  "Cociente respiratorio (CR): " + CR.toFixed(2) +
  " (VN <1; 1–1.4 sospecha; >1.4 anaerobiosis)<br><br>" +

  "<b>TRANSPORTE</b><br>" +
  "DO₂: " + DO2.toFixed(0) + " mL/min (VN 900–1100)<br>" +
  "VO₂: " + VO2.toFixed(0) + " mL/min (VN 200–250)<br>" +
  "REO₂: " + (REO2 * 100).toFixed(1) + " % (VN 20–30)<br><br>" +

  "<b>PERFUSIÓN</b><br>" +
  "RVS: " + RVS.toFixed(0) + " dyn·s·cm⁻⁵ (VN 800–1200)<br>" +
  "PPR: " + PPR.toFixed(0) + " mmHg (VN >60)<br>" +
  "PPC: " + PPC.toFixed(0) + " mmHg (VN 60–70)";
}

