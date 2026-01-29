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
   PBW (ARDSnet)
========================================================= */
function calcularPesoIdeal() {
  const talla = numVal("talla");
  const sexo = document.getElementById("sexo")?.value;

  if (!talla || talla < 80 || talla > 250) {
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

  if (!pco2Act || !pco2Des) {
    setHTML("resultadoPCO2", "Ingrese PCO₂ actual y deseada.");
    return;
  }

  let vmin = numVal("vmin_actual");
  const fr = numVal("fr_actual");
  const vt = numVal("vt_actual");

  if (!vmin && fr && vt) {
    vmin = (fr * vt) / 1000;
  }

  if (!vmin) {
    setHTML("resultadoPCO2", "Ingrese ventilación minuto o FR + VT.");
    return;
  }

  const ratio = pco2Act / pco2Des;
  const vminObjetivo = vmin * ratio;

  // Propuestas orientativas
  const frObjetivo = fr ? fr * ratio : null;
  const vtMax = vt ? vt * ratio : null;

  setHTML(
    "resultadoPCO2",
    `<strong>Ventilación minuto objetivo:</strong> ${vminObjetivo.toFixed(2)} L/min`
  );

  let detalle = `<strong>Relación aplicada:</strong> ${ratio.toFixed(2)}×<br>`;

  if (frObjetivo) {
    detalle += `• FR sugerida: <strong>${frObjetivo.toFixed(0)} rpm</strong><br>`;
  }

  if (vtMax) {
    detalle += `• VT máximo orientativo: <strong>${vtMax.toFixed(0)} mL</strong><br>`;
  }

  detalle += `<em>Ajustar priorizando seguridad pulmonar.</em>`;

  setHTML("resultadoPCO2Detalle", detalle);
}
