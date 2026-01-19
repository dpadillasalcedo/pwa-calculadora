function calcularPesoIdeal() {
  const tallaInput = document.getElementById("talla");
  const sexoInput = document.getElementById("sexo");
  const resultado = document.getElementById("resultadoPeso");

  if (!tallaInput || !sexoInput) {
    resultado.innerText = "Error: input no encontrado";
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


function ajustarPCO2() {
  const pco2Act = parseFloat(document.getElementById("pco2Act").value);
  const pco2Des = parseFloat(document.getElementById("pco2Des").value);

  if (isNaN(pco2Act) || isNaN(pco2Des)) {
    document.getElementById("resultadoPCO2").innerText =
      "Ingrese PCO₂ actual y PCO₂ deseada";
    return;
  }

  const ajuste = document.querySelector(
    'input[name="ajuste"]:checked'
  ).value;

  let resultadoTexto = "";

  if (ajuste === "fr") {
    const fr = parseFloat(document.getElementById("fr").value);
    if (isNaN(fr)) {
      document.getElementById("resultadoPCO2").innerText =
        "Ingrese FR actual";
      return;
    }
    const frNueva = fr * (pco2Act / pco2Des);
    resultadoTexto = "FR ajustada: " + frNueva.toFixed(1) + " rpm";
  }

  if (ajuste === "vt") {
    const vt = parseFloat(document.getElementById("vt").value);
    if (isNaN(vt)) {
      document.getElementById("resultadoPCO2").innerText =
        "Ingrese VT actual";
      return;
    }
    const vtNuevo = vt * (pco2Act / pco2Des);
    resultadoTexto = "VT ajustado: " + vtNuevo.toFixed(0) + " mL";
  }

  if (ajuste === "vmin") {
    const vmin = parseFloat(document.getElementById("vmin").value);
    if (isNaN(vmin)) {
      document.getElementById("resultadoPCO2").innerText =
        "Ingrese VMIN actual";
      return;
    }
    const vminNuevo = vmin * (pco2Act / pco2Des);
    resultadoTexto =
      "VMIN ajustada: " + vminNuevo.toFixed(1) + " L/min";
  }

  document.getElementById("resultadoPCO2").innerText = resultadoTexto;
}
