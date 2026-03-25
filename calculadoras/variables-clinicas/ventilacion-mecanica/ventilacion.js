console.log("ventilacion.js cargado correctamente");

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
  // Limpia resultados al cargar
  setHTML("resultadoPeso", "");
  setHTML("resultadoPCO2", "");
  setHTML("resultadoPCO2Detalle", "");
  setHTML("resultadoDeltaP", "");
  setHTML("interpretacionDeltaP", "");
});

/* =========================================================
   PBW (ARDSnet)
========================================================= */
function calcularPesoIdeal() {
  const talla = numVal("talla");
  const sexo = document.getElementById("sexo")?.value;

  if (talla === null || talla < 80 || talla > 250) {
    setHTML("resultadoPeso", "Ingrese una talla válida (80–250 cm).");
    return;
  }

  if (!sexo) {
    setHTML("resultadoPeso", "Seleccione el sexo.");
    return;
  }

  const base = sexo === "hombre" ? 50 : 45.5;
  const pbw = base + 0.91 * (talla - 152.4);

  const vt6 = pbw * 6;
  const vt7 = pbw * 7;
  const vt8 = pbw * 8;

  setHTML(
    "resultadoPeso",
    `<strong>PBW:</strong> ${pbw.toFixed(1)} kg<br>
     <strong>VT protector:</strong><br>
     • 6 ml/kg → <strong>${vt6.toFixed(0)} mL</strong><br>
     • 7 ml/kg → <strong>${vt7.toFixed(0)} mL</strong><br>
     • 8 ml/kg → <strong>${vt8.toFixed(0)} mL</strong>`
  );
}

/* =========================================================
   AJUSTE DE PCO2
========================================================= */
function ajustarPCO2() {
  const pco2Act = numVal("pco2Act");
  const pco2Des = numVal("pco2Des");

  if (pco2Act === null || pco2Des === null || pco2Act <= 0 || pco2Des <= 0) {
    setHTML("resultadoPCO2", "Ingrese PCO₂ actual y deseada (valores > 0).");
    setHTML("resultadoPCO2Detalle", "");
    return;
  }

  let vminActual = numVal("vmin_actual"); // L/min
  const fr = numVal("fr_actual");         // rpm
  const vt = numVal("vt_actual");         // mL

  // Si no ingresan Vmin, calcular con FR y VT
  if ((vminActual === null || vminActual <= 0) && fr && vt) {
    vminActual = (fr * vt) / 1000; // L/min
  }

  if (vminActual === null || vminActual <= 0) {
    setHTML("resultadoPCO2", "Ingrese ventilación minuto o FR + VT.");
    setHTML("resultadoPCO2Detalle", "");
    return;
  }

  const ratio = pco2Act / pco2Des;        // Vmin_obj / Vmin_act
  const vminObjetivo = vminActual * ratio;

  setHTML(
    "resultadoPCO2",
    `<strong>Ventilación minuto objetivo:</strong> ${vminObjetivo.toFixed(2)} L/min`
  );

  // Reporte: FR posible, Vmin máx, VT máx (orientativo)
  // Si el usuario dio FR y VT, proponemos:
  // - Mantener VT y subir FR
  // - Mantener FR y subir VT (como "VT máximo orientativo" según ratio)
  let detalle = `<strong>Relación aplicada:</strong> ${ratio.toFixed(2)}×<br>
                 <strong>Vmin actual:</strong> ${vminActual.toFixed(2)} L/min<br>
                 <strong>Vmin objetivo:</strong> ${vminObjetivo.toFixed(2)} L/min<br>`;

  if (fr !== null && fr > 0) {
    const frObjetivo = fr * ratio;
    detalle += `• <strong>FR sugerida</strong> (si mantienes VT): ${frObjetivo.toFixed(0)} rpm<br>`;
    detalle += `• <strong>FR a aumentar</strong>: ${(frObjetivo - fr).toFixed(0)} rpm<br>`;
  }

  if (vt !== null && vt > 0) {
    const vtMax = vt * ratio;
    detalle += `• <strong>VT máximo orientativo</strong> (si mantienes FR): ${vtMax.toFixed(0)} mL<br>`;
    detalle += `• <strong>VT a aumentar</strong>: ${(vtMax - vt).toFixed(0)} mL<br>`;
  }

  detalle += `<em>Nota: ajustar priorizando seguridad pulmonar (VT protector, presión plateau, ΔP, etc.).</em>`;

  setHTML("resultadoPCO2Detalle", detalle);
}

function calcularDeltaP() {
  const pplat = parseFloat(document.getElementById("pplat").value);
  const peep = parseFloat(document.getElementById("peep").value);
  const vt = parseFloat(document.getElementById("vt").value);

  if (isNaN(pplat) || isNaN(peep) || isNaN(vt)) {
    document.getElementById("resultadoDeltaP").innerHTML = "⚠️ Completa todos los campos";
    document.getElementById("interpretacionDeltaP").innerHTML = "";
    return;
  }

  const deltaP = pplat - peep;

  if (deltaP <= 0) {
    document.getElementById("resultadoDeltaP").innerHTML = "⚠️ ΔP inválida";
    document.getElementById("interpretacionDeltaP").innerHTML = "";
    return;
  }

  const compliance = vt / deltaP;

  document.getElementById("resultadoDeltaP").innerHTML = `
    ΔP: <b>${deltaP.toFixed(1)} cmH₂O</b><br>
    Compliance: <b>${compliance.toFixed(1)} ml/cmH₂O</b>
  `;

  let interpretacion = "";

  // interpretación ΔP
  if (deltaP <= 15) {
    interpretacion += "ΔP dentro de rango protector. ";
  } else {
    interpretacion += "ΔP elevada → mayor riesgo de lesión pulmonar. ";
  }

  // interpretación compliance
  if (compliance > 50) {
    interpretacion += "Complacencia conservada.";
  } else if (compliance >= 30) {
    interpretacion += "Complacencia moderadamente reducida.";
  } else {
    interpretacion += "Complacencia severamente disminuida (SDRA probable).";
  }

  document.getElementById("interpretacionDeltaP").innerHTML = interpretacion;
}



function calcularComponenteResistivo() {
  const ppico = parseFloat(document.getElementById("ppico").value);
  const pplat = parseFloat(document.getElementById("pplat_res").value);
  const flujoMin = parseFloat(document.getElementById("flujo_insp").value);

  const resultado = document.getElementById("resultadoResistivo");
  const interpretacion = document.getElementById("interpretacionResistivo");

  resultado.innerHTML = "";
  interpretacion.textContent = "";

  // Validaciones
  if (isNaN(ppico) || isNaN(pplat)) {
    resultado.textContent = "⚠️ Completá Presión pico y Presión plateau.";
    return;
  }

  if (ppico < pplat) {
    resultado.textContent =
      "⚠️ La presión pico no puede ser menor que la presión plateau.";
    return;
  }

  const componenteResistivo = ppico - pplat;

  let textoResultado = `
    Componente resistivo: <b>${componenteResistivo.toFixed(1)} cmH₂O</b>
  `;

  let textoInterpretacion = "";

  // Interpretación básica (no rígida)
  if (componenteResistivo <= 5) {
    textoInterpretacion =
      "Componente resistivo dentro de rango esperado.";
  } else if (componenteResistivo <= 10) {
    textoInterpretacion =
      "Componente resistivo discretamente aumentado. Interpretar según flujo.";
  } else {
    textoInterpretacion =
      "Componente resistivo elevado. Puede sugerir aumento de resistencia o flujo alto.";
  }

  // Si hay flujo → convertir y calcular Raw
  if (!isNaN(flujoMin) && flujoMin > 0) {
    const flujoSeg = flujoMin / 60; // 🔥 conversión automática
    const raw = componenteResistivo / flujoSeg;

    textoResultado += `
      <br>Flujo: <b>${flujoMin.toFixed(1)} L/min</b> (${flujoSeg.toFixed(2)} L/s)
      <br>Resistencia (Raw): <b>${raw.toFixed(1)} cmH₂O/L/s</b>
    `;

    // Interpretación basada en evidencia (Raw)
    if (raw < 10) {
      textoInterpretacion +=
        " Resistencia de la vía aérea dentro de rango esperado.";
    } else if (raw <= 15) {
      textoInterpretacion +=
        " Resistencia moderadamente aumentada.";
    } else {
      textoInterpretacion +=
        " Resistencia elevada, sugerente de obstrucción significativa (broncoespasmo, secreciones, tubo acodado).";
    }
  } else {
    textoInterpretacion +=
      " Ingresá el flujo en L/min para calcular la resistencia (Raw).";
  }

  resultado.innerHTML = textoResultado;
  interpretacion.textContent = textoInterpretacion;
}

/* =========================================================
   EXPOSE GLOBAL (por onclick inline)
========================================================= */
window.calcularPesoIdeal = calcularPesoIdeal;
window.ajustarPCO2 = ajustarPCO2;
window.calcularDeltaP = calcularDeltaP;
