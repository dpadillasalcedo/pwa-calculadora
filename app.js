function calcular() {
  const pa = parseFloat(document.getElementById("paCO2").value);
  const pv = parseFloat(document.getElementById("pvCO2").value);

  if (isNaN(pa) || isNaN(pv)) {
    document.getElementById("resultado").innerText =
      "Ingrese ambos valores";
    return;
  }

  const deltaCO2 = pv - pa;

  document.getElementById("resultado").innerText =
    "ΔPv–aCO₂ = " + deltaCO2.toFixed(1) + " mmHg";
}
