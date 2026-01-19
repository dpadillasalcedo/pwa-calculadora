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

