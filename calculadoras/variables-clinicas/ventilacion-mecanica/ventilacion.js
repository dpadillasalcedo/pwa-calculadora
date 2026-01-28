console.log("ventilacion.js cargado correctamente");

/* =========================================================
   VENTILACIÓN MECÁNICA
   - Peso corporal predicho (PBW)
   - Ajuste de PCO2
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  safeSetHTML("resultadoPeso", "");
  safeSetHTML("resultadoPCO2", "");
  safeSetHTML("resultadoPCO2Detalle", "");
});

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
   PBW (ARDSnet)
========================= */
function calcularPesoIdeal() {
  const talla = numVal("talla");
  const sexo = document.getElementById("sexo")?.value || "";

  if (!talla || talla < 80 || talla > 250) {
    safeSetHTML("resultadoPeso", "Ingrese una talla válida (80–250 cm).");
    return;
  }

  if (!["hombre", "mujer"].includes(sexo)) {
    safeSetHTML("resultadoPeso", "Seleccione el sexo.");
    return;
  }

  const base = sexo === "hombre" ? 50 : 45.5;
  const pbw = base + 0.91 * (talla - 152.4);

  safeSetHTML(
    "resultadoPeso",
    `<strong>PBW:</strong> ${pbw.toFixed(1)} kg<br>
     <strong>VT recomendado:</strong> ${(pbw * 6).toFixed(0)}–${(pbw * 8).toFixed(0)} mL`
  );
}

/* =========================
   Ajuste PCO2
========================= */
function ajustarPCO2() {
  const pco2Act = numVal("pco2Act");
  const pco2Des = numVal("pco2Des");

  if (!pco2Act || !pco2Des) {
    safeSetHTML("resultadoPCO2", "Ingrese PCO₂ actual y deseada.");
    return;
  }

  let vmin = numVal("vmin_actual");
  const fr = numVal("fr_actual");
  const vt = numVal("vt_actual");

  if (!vmin && fr && vt) {
    vmin = (fr * vt) / 1000;
  }

  if (!vmin) {
    safeSetHTML("resultadoPCO2", "Ingrese ventilación minuto o FR + VT.");
    return;
  }

  const ratio = pco2Act / pco2Des;
  const nuevaVmin = vmin * ratio;

  safeSetHTML(
    "resultadoPCO2",
    `Ajuste sugerido: <strong>${ratio.toFixed(2)}×</strong>`
  );

  safeSetHTML(
    "resultadoPCO2Detalle",
    `<strong>Vmin actual:</strong> ${vmin.toFixed(2)} L/min<br>
     <strong>Vmin objetivo:</strong> ${nuevaVmin.toFixed(2)} L/min`
  );
}
