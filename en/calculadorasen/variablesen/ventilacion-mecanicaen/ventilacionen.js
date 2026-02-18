/* ==========================================
   MECHANICAL VENTILATION – ICU CALCULATOR
   Critical Care Tools EN
========================================== */

function getNumber(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const val = parseFloat(el.value);
  return isNaN(val) ? NaN : val;
}

/* =========================================================
   1) PREDICTED BODY WEIGHT (PBW)
   ARDSnet Formula
========================================================= */

function calcularPesoIdeal() {

  const height = getNumber("height");
  const sex = document.getElementById("sex").value;

  if (!height || !sex) {
    document.getElementById("resultadoPeso").innerHTML =
      "Please enter height and select sex.";
    return;
  }

  let pbw;

  if (sex === "male") {
    pbw = 50 + 0.91 * (height - 152.4);
  } else {
    pbw = 45.5 + 0.91 * (height - 152.4);
  }

  const vt6 = pbw * 6;
  const vt7 = pbw * 7;
  const vt8 = pbw * 8;

  document.getElementById("resultadoPeso").innerHTML =
    "<strong>Predicted Body Weight:</strong> " + pbw.toFixed(1) + " kg<br><br>" +
    "<strong>Tidal Volume Targets:</strong><br>" +
    "6 mL/kg → <strong>" + vt6.toFixed(0) + " mL</strong><br>" +
    "7 mL/kg → <strong>" + vt7.toFixed(0) + " mL</strong><br>" +
    "8 mL/kg → <strong>" + vt8.toFixed(0) + " mL</strong>";
}


/* =========================================================
   2) PaCO2 ADJUSTMENT
   PaCO2 ∝ 1 / Minute Ventilation
========================================================= */

function ajustarPCO2() {

  const pco2Act = getNumber("pco2Act");
  const pco2Des = getNumber("pco2Des");
  const fr = getNumber("fr_actual");
  const vt = getNumber("vt_actual");
  const vminActual = getNumber("vmin_actual");

  if ([pco2Act, pco2Des, fr, vt, vminActual].some(isNaN)) {
    document.getElementById("resultadoPCO2").innerHTML =
      "Please complete all fields.";
    document.getElementById("resultadoPCO2Detalle").innerHTML = "";
    return;
  }

  // Fórmula: Vmin objetivo = Vmin actual × (PaCO2 actual / PaCO2 deseado)
  const vminObjetivo = vminActual * (pco2Act / pco2Des);

  // Propuesta 1: mantener VT y ajustar FR
  const frNueva = (vminObjetivo * 1000) / vt;

  // Propuesta 2: mantener FR y ajustar VT
  const vtNuevo = (vminObjetivo * 1000) / fr;

  document.getElementById("resultadoPCO2").innerHTML =
    "<strong>Target Minute Ventilation:</strong> " +
    vminObjetivo.toFixed(2) + " L/min";

  document.getElementById("resultadoPCO2Detalle").innerHTML =
    "<strong>If VT unchanged:</strong><br>" +
    "New RR ≈ <strong>" + frNueva.toFixed(0) + " breaths/min</strong><br><br>" +
    "<strong>If RR unchanged:</strong><br>" +
    "New VT ≈ <strong>" + vtNuevo.toFixed(0) + " mL</strong>";
}


/* =========================================================
   3) DRIVING PRESSURE
   ΔP = Plateau - PEEP
========================================================= */

function calcularDeltaP() {

  const pplat = getNumber("pplat");
  const peep = getNumber("peep");

  if ([pplat, peep].some(isNaN)) {
    document.getElementById("resultadoDeltaP").innerHTML =
      "Please enter valid pressures.";
    document.getElementById("interpretacionDeltaP").innerHTML = "";
    return;
  }

  const deltaP = pplat - peep;

  let interpretation = "";

  if (deltaP <= 13) {
    interpretation = "Acceptable driving pressure.";
  } else if (deltaP <= 15) {
    interpretation = "Borderline high. Consider optimization.";
  } else {
    interpretation = "High driving pressure. Associated with worse outcomes.";
  }

  document.getElementById("resultadoDeltaP").innerHTML =
    "<strong>ΔP:</strong> " + deltaP.toFixed(1) + " cmH₂O";

  document.getElementById("interpretacionDeltaP").innerHTML =
    interpretation;
}
