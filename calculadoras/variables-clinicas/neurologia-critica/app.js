/* =========================================================
   NEUROLOGÍA CRÍTICA
   CAM-ICU · NIHSS
========================================================= */

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initCAMICU();
});

/* =========================
   CAM-ICU · DELIRIUM
========================= */

function initCAMICU() {
  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();
}

/* =========================
   PASO 1
========================= */
function camicuPaso1() {
  const v1 = getVal("camicu_c1");

  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();

  if (v1 === null) return;

  if (v1 === 1) {
    mostrarPaso(2);
  }

  if (v1 === 0) {
    mostrarResultadoCAMICU(false);
  }
}

/* =========================
   PASO 2
========================= */
function camicuPaso2() {
  const v2 = getVal("camicu_c2");

  ocultarDesdePaso(3);
  limpiarResultadoCAMICU();

  if (v2 === null) return;

  if (v2 === 1) {
    mostrarPaso(3);
  } else {
    mostrarResultadoCAMICU(false);
  }
}

/* =========================
   PASO 3
========================= */
function camicuPaso3() {
  const v3 = getVal("camicu_c3");

  ocultarDesdePaso(4);
  limpiarResultadoCAMICU();

  if (v3 === null) return;

  if (v3 === 1) {
    mostrarResultadoCAMICU(true);
  } else {
    mostrarPaso(4);
    setHTML(
      "resultadoCAMICU",
      "CAM-ICU <strong>NO EVALUABLE</strong>"
    );
    setHTML(
      "interpretacionCAMICU",
      "El criterio 3 es negativo. Complete el criterio 4 para concluir la evaluación."
    );
  }
}

/* =*
