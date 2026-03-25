console.log("ventilationen.js loaded successfully");

/* =========================================================
   HELPERS
========================================================= */
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function numVal(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  setHTML("resultadoPeso", "");
  setHTML("resultadoPCO2", "");
  setHTML("resultadoPCO2Detalle", "");
  setHTML("resultadoDeltaP", "");
  setHTML("interpretacionDeltaP", "");
});

/* =========================================================
   PBW (ARDSnet)
========================================================= */
function calculatePBW() {
  const height = numVal("height");
  const sex = document.getElementById("sex")?.value;

  if (height === null || height < 80 || height > 250) {
    setHTML("resultadoPeso", "Enter a valid height (80–250 cm).");
    return;
  }

  if (!sex) {
    setHTML("resultadoPeso", "Select sex.");
    return;
  }

  const base = sex === "male" ? 50 : 45.5;
  const pbw = base + 0.91 * (height - 152.4);

  const vt6 = pbw * 6;
  const vt7 = pbw * 7;
  const vt8 = pbw * 8;

  setHTML(
    "resultadoPeso",
    `<strong>PBW:</strong> ${pbw.toFixed(1)} kg<br>
     <strong>Protective VT:</strong><br>
     • 6 mL/kg → <strong>${vt6.toFixed(0)} mL</strong><br>
     • 7 mL/kg → <strong>${vt7.toFixed(0)} mL</strong><br>
     • 8 mL/kg → <strong>${vt8.toFixed(0)} mL</strong>`
  );
}

/* =========================================================
   PCO2 ADJUSTMENT
========================================================= */
function adjustPCO2() {
  const pco2Current = numVal("pco2Current");
  const pco2Target = numVal("pco2Target");

  if (pco2Current === null || pco2Target === null || pco2Current <= 0 || pco2Target <= 0) {
    setHTML("resultadoPCO2", "Enter current and target PCO₂ values (> 0).");
    setHTML("resultadoPCO2Detalle", "");
    return;
  }

  let minuteVentCurrent = numVal("minuteVentCurrent");
  const rr = numVal("rrCurrent");
  const vt = numVal("vtCurrent");

  if ((minuteVentCurrent === null || minuteVentCurrent <= 0) && rr && vt) {
    minuteVentCurrent = (rr * vt) / 1000;
  }

  if (minuteVentCurrent === null || minuteVentCurrent <= 0) {
    setHTML("resultadoPCO2", "Enter minute ventilation or RR + VT.");
    setHTML("resultadoPCO2Detalle", "");
    return;
  }

  const ratio = pco2Current / pco2Target;
  const minuteVentTarget = minuteVentCurrent * ratio;

  setHTML(
    "resultadoPCO2",
    `<strong>Target minute ventilation:</strong> ${minuteVentTarget.toFixed(2)} L/min`
  );

  let detail = `<strong>Applied ratio:</strong> ${ratio.toFixed(2)}×<br>
                <strong>Current minute ventilation:</strong> ${minuteVentCurrent.toFixed(2)} L/min<br>
                <strong>Target minute ventilation:</strong> ${minuteVentTarget.toFixed(2)} L/min<br>`;

  if (rr !== null && rr > 0) {
    const rrTarget = rr * ratio;
    detail += `• <strong>Suggested RR</strong> (if VT is kept constant): ${rrTarget.toFixed(0)} breaths/min<br>`;
    detail += `• <strong>Increase in RR</strong>: ${(rrTarget - rr).toFixed(0)} breaths/min<br>`;
  }

  if (vt !== null && vt > 0) {
    const vtMax = vt * ratio;
    detail += `• <strong>Estimated maximum VT</strong> (if RR is kept constant): ${vtMax.toFixed(0)} mL<br>`;
    detail += `• <strong>Increase in VT</strong>: ${(vtMax - vt).toFixed(0)} mL<br>`;
  }

  detail += `<em>Note: adjust while prioritizing lung safety (protective VT, plateau pressure, ΔP, etc.).</em>`;

  setHTML("resultadoPCO2Detalle", detail);
}

function calculateDeltaP() {
  const pplat = parseFloat(document.getElementById("pplat").value);
  const peep = parseFloat(document.getElementById("peep").value);
  const vt = parseFloat(document.getElementById("vt").value);

  if (isNaN(pplat) || isNaN(peep) || isNaN(vt)) {
    document.getElementById("resultadoDeltaP").innerHTML = "⚠️ Complete all fields";
    document.getElementById("interpretacionDeltaP").innerHTML = "";
    return;
  }

  const deltaP = pplat - peep;

  if (deltaP <= 0) {
    document.getElementById("resultadoDeltaP").innerHTML = "⚠️ Invalid ΔP";
    document.getElementById("interpretacionDeltaP").innerHTML = "";
    return;
  }

  const compliance = vt / deltaP;

  document.getElementById("resultadoDeltaP").innerHTML = `
    ΔP: <b>${deltaP.toFixed(1)} cmH₂O</b><br>
    Compliance: <b>${compliance.toFixed(1)} mL/cmH₂O</b>
  `;

  let interpretation = "";

  if (deltaP <= 15) {
    interpretation += "ΔP within protective range. ";
  } else {
    interpretation += "Elevated ΔP → increased risk of lung injury. ";
  }

  if (compliance > 50) {
    interpretation += "Preserved compliance.";
  } else if (compliance >= 30) {
    interpretation += "Moderately reduced compliance.";
  } else {
    interpretation += "Severely reduced compliance (possible ARDS).";
  }

  document.getElementById("interpretacionDeltaP").innerHTML = interpretation;
}

function calculateResistiveComponent() {
  const ppeak = parseFloat(document.getElementById("ppico").value);
  const pplat = parseFloat(document.getElementById("pplat_res").value);
  const flowMin = parseFloat(document.getElementById("flujo_insp").value);

  const result = document.getElementById("resultadoResistivo");
  const interpretation = document.getElementById("interpretacionResistivo");

  result.innerHTML = "";
  interpretation.textContent = "";

  if (isNaN(ppeak) || isNaN(pplat)) {
    result.textContent = "⚠️ Complete Peak Pressure and Plateau Pressure.";
    return;
  }

  if (ppeak < pplat) {
    result.textContent =
      "⚠️ Peak pressure cannot be lower than plateau pressure.";
    return;
  }

  const resistiveComponent = ppeak - pplat;

  let resultText = `
    Resistive component: <b>${resistiveComponent.toFixed(1)} cmH₂O</b>
  `;

  let interpretationText = "";

  if (resistiveComponent <= 5) {
    interpretationText =
      "Resistive component within expected range.";
  } else if (resistiveComponent <= 10) {
    interpretationText =
      "Mildly increased resistive component. Interpret according to flow.";
  } else {
    interpretationText =
      "Elevated resistive component. May suggest increased resistance or high flow.";
  }

  if (!isNaN(flowMin) && flowMin > 0) {
    const flowSec = flowMin / 60;
    const raw = resistiveComponent / flowSec;

    resultText += `
      <br>Flow: <b>${flowMin.toFixed(1)} L/min</b> (${flowSec.toFixed(2)} L/s)
      <br>Airway resistance (Raw): <b>${raw.toFixed(1)} cmH₂O/L/s</b>
    `;

    if (raw < 10) {
      interpretationText +=
        " Airway resistance within expected range.";
    } else if (raw <= 15) {
      interpretationText +=
        " Moderately increased airway resistance.";
    } else {
      interpretationText +=
        " Elevated airway resistance, suggesting significant obstruction (bronchospasm, secretions, or kinked tube).";
    }
  } else {
    interpretationText +=
      " Enter inspiratory flow in L/min to calculate airway resistance (Raw).";
  }

  result.innerHTML = resultText;
  interpretation.textContent = interpretationText;
}

/* =========================================================
   EXPOSE GLOBAL
========================================================= */
window.calculatePBW = calculatePBW;
window.adjustPCO2 = adjustPCO2;
window.calculateDeltaP = calculateDeltaP;
window.calculateResistiveComponent = calculateResistiveComponent;
