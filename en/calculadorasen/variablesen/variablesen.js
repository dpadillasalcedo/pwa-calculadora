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

/* =========================================================
   DRIVING PRESSURE (ΔP = Pplat − PEEP)
========================================================= */
function calcularDeltaP() {
  const pplat = numVal("pplat");
  const peep = numVal("peep");

  if (pplat === null || peep === null) {
    setHTML("resultadoDeltaP", "Ingrese Pplat y PEEP.");
    setHTML("interpretacionDeltaP", "");
    return;
  }

  if (pplat <= peep) {
    setHTML("resultadoDeltaP", "Valores no válidos: Pplat debe ser mayor que PEEP.");
    setHTML("interpretacionDeltaP", "");
    return;
  }

  const deltaP = pplat - peep;

  let interpretacion = "";
  if (deltaP <= 12) {
    interpretacion = "ΔP <strong>baja</strong>. Perfil ventilatorio más protector.";
  } else if (deltaP <= 15) {
    interpretacion = "ΔP <strong>intermedia</strong>. Vigilar tendencia y mecánica pulmonar.";
  } else {
    interpretacion =
      "<strong>ΔP elevada</strong>. Se asocia a mayor riesgo de lesión pulmonar.<br><br>" +
      "<strong>Sugerencias:</strong><ul>" +
      "<li>Reducir VT (ideal 6 ml/kg PBW).</li>" +
      "<li>Revisar compliance y estrategia de PEEP.</li>" +
      "<li>Considerar pronación / reclutamiento según caso.</li>" +
      "</ul>";
  }

  setHTML(
    "resultadoDeltaP",
    `<strong>Driving Pressure (ΔP):</strong> ${deltaP.toFixed(1)} cmH₂O`
  );
  setHTML("interpretacionDeltaP", interpretacion);
}

/* =========================================================
   EXPOSE GLOBAL (por onclick inline)
========================================================= */
window.calcularPesoIdeal = calcularPesoIdeal;
window.ajustarPCO2 = ajustarPCO2;
window.calcularDeltaP = calcularDeltaP;
