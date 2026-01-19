function calcularPesoIdeal() {
  const talla = parseFloat(document.getElementById("talla").value);
  const sexo = document.getElementById("sexo").value;

  if (isNaN(talla)) {
    document.getElementById("resultadoPeso").innerText =
      "Ingrese la talla";
    return;
  }

  let pesoIdeal;
  if (sexo === "hombre") {
    pesoIdeal = 50 + 0.91 * (talla - 152.4);
  } else {
    pesoIdeal = 45 + 0.91 * (talla - 152.4);
  }

  document.getElementById("resultadoPeso").innerText =
    "Peso ideal: " + pesoIdeal.toFixed(1) + " kg";
}

function ajustarPCO2() {
  const pco2Act = parseFloat(document.getElementById("pco2Act").value);
  const pco2Des = parseFloat(document.getElementById("pco2Des").value);
  const fr = parseFloat(document.getElementById("fr").value);
  const vt = parseFloat(document.getElementById("vt").value);
  const vmin = parseFloat(document.getElementById("vmin").value);

  if (isNaN(pco2Act) || isNaN(pco2Des)) {
    document.getElementById("resultadoPCO2").innerText =
      "Ingrese PCO₂ actual y deseada";
    return;
  }

  const ajuste = document.querySelector(
    'input[name="ajuste"]:checked'
  ).value;

  let resultado = "";

  if (ajuste === "fr") {
    resultado = "FR ajustada: " + (fr * (pco2Act / pco2Des)).toFixed(1);
  }

  if (ajuste === "vt") {
    resultado = "VT ajustado: " + (vt * (pco2Act / pco2Des)).toFixed(0) + " mL";
  }

  if (ajuste === "vmin") {
    resultado = "VMIN ajustada: " + (vmin * (pco2Act / pco2Des)).toFixed(1) + " L/min";
  }

  document.getElementById("resultadoPCO2").innerText = resultado;
}

