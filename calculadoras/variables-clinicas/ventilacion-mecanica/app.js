/* =========================================================
   VENTILACIÓN MECÁNICA
   - Peso corporal predicho (PBW)
   - Ajuste de PCO2 por ventilación minuto
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Inicializa resultados vacíos (evita textos raros en cargas parciales)
  safeSetHTML("resultadoPeso", "");
  safeSetHTML("resultadoPCO2", "");
  safeSetHTML("resultadoPCO2Detalle", "");
});

/* =========================
   Helpers seguros
========================= */
function safeSetHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function numVal(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
}

/* =========================
   1) Peso corporal predicho (PBW)
   Fórmula ARDSnet:
   Hombre: 50 + 0.91*(talla_cm - 152.4)
   Mujer:  45.5 + 0.91*(talla_cm - 152.4)
========================= */
function calcularPesoIdeal() {
  const talla = numVal("talla");
  const sexo = document.getElementById("sexo")?.value || "";

  if (talla === null || talla <= 0 || talla < 80 || talla > 250) {
    safeSetHTML("resultadoPeso", "Ingrese una <strong>talla válida</strong> (80–250 cm).");
    return;
  }

  if (sexo !== "hombre" && sexo !== "mujer") {
    safeSetHTML("resultadoPeso", "Seleccione el <strong>sexo</strong> para calcular el PBW.");
    return;
  }

  const base = sexo === "hombre" ? 50 : 45.5;
  const pbw = base + 0.91 * (talla - 152.4);

  // Recomendación VT protectora (orientativa) 6–8 mL/kg PBW
  const vt6 = pbw * 6;
  const vt8 = pbw * 8;

  safeSetHTML(
    "resultadoPeso",
    `<strong>PBW:</strong> ${pbw.toFixed(1)} kg<br>
     <strong>VT orientativo:</strong> ${vt6.toFixed(0)}–${vt8.toFixed(0)} mL (6–8 mL/kg PBW)`
  );
}

/* =========================
   2) Ajuste de PCO2 deseada
   Supuesto simplificado:
   PaCO2_actual / PaCO2_deseada = Vmin_deseada / Vmin_actual
   => Vmin_deseada = Vmin_actual * (PaCO2_actual / PaCO2_deseada)
========================= */
function ajustarPCO2() {
  const pco2Act = numVal("pco2Act");
  const pco2Des = numVal("pco2Des");

  if (pco2Act === null || pco2Des === null || pco2Act <= 0 || pco2Des <= 0) {
    safeSetHTML("resultadoPCO2", "Ingrese <strong>PCO₂ actual</strong> y <strong>deseada</strong> (valores > 0).");
    safeSetHTML("resultadoPCO2Detalle", "");
    return;
  }

  // 1) Determinar Vmin actual:
  // - Prioridad: si el usuario ingresó Vmin, usarla
  // - Si no, intentar calcular desde FR y VT
  let vminActual = numVal("vmin_actual"); // L/min

  const fr = numVal("fr_actual");
  const vt = numVal("vt_actual"); // mL

  if (vminActual === null || vminActual <= 0) {
    if (fr !== null && vt !== null && fr > 0 && vt > 0) {
      vminActual = (fr * vt) / 1000; // (rpm * mL)/1000 = L/min
    }
  }

  if (vminActual === null || vminActual <= 0) {
    safeSetHTML(
      "resultadoPCO2",
      "Ingrese <strong>ventilación minuto</strong> o <strong>FR y VT</strong> para estimar el ajuste."
    );
    safeSetHTML("resultadoPCO2Detalle", "");
    return;
  }

  const ratio = pco2Act / pco2Des;
  const vminNueva = vminActual * ratio;

  // Propuestas de ajuste simples:
  // - Mantener VT y ajustar FR (si FR y VT estaban presentes)
  // - Mantener FR y ajustar VT (si FR y VT estaban presentes)
  let detalle = `<strong>Supuesto:</strong> PCO₂ ∝ 1 / Vmin<br>
                 <strong>Vmin actual:</strong> ${vminActual.toFixed(2)} L/min<br>
                 <strong>Vmin estimada para objetivo:</strong> ${vminNueva.toFixed(2)} L/min<br>`;

  if (fr !== null && vt !== null && fr > 0 && vt > 0) {
    const frNueva = fr * ratio;
    const vtNuevo = vt * ratio;

    detalle += `<br><strong>Opciones de ajuste (orientativas):</strong><br>
      • Manteniendo VT (${vt.toFixed(0)} mL): ajustar FR ≈ <strong>${frNueva.toFixed(0)} rpm</strong><br>
      • Manteniendo FR (${fr.toFixed(0)} rpm): ajustar VT ≈ <strong>${vtNuevo.toFixed(0)} mL</strong><br>`;
  } else {
    detalle += `<br><strong>Nota:</strong> si desea propuesta FR/VT, complete <strong>FR</strong> y <strong>VT</strong>.`;
  }

  // Mensaje principal
  const direccion = ratio > 1
    ? "Para <strong>disminuir</strong> la PCO₂ hacia el objetivo, generalmente se requiere <strong>aumentar</strong> la ventilación minuto."
    : ratio < 1
      ? "Para <strong>aumentar</strong> la PCO₂ hacia el objetivo, generalmente se requiere <strong>disminuir</strong> la ventilación minuto."
      : "PCO₂ actual = deseada: no se requieren cambios por este método.";

  safeSetHTML(
    "resultadoPCO2",
    `${direccion}<br><strong>Factor de ajuste:</strong> ${ratio.toFixed(2)}×`
  );

  safeSetHTML("resultadoPCO2Detalle", detalle);

  if (typeof trackEvent === "function") {
    trackEvent("calculate_pco2_adjustment", {
      pco2_current: pco2Act,
      pco2_target: pco2Des,
      vmin_current: vminActual,
      vmin_target: vminNueva,
      ratio
    });
  }
}
