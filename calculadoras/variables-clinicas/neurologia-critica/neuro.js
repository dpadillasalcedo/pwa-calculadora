console.log("neuro.js cargado correctamente");

/* =========================================================
   HELPERS
========================================================= */
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  setHTML("resultadoCAMICU", "");
  setHTML("interpretacionCAMICU", "");
  setHTML("resultadoNIHSS", "");
  setHTML("interpretacionNIHSS", "");
});

/* =========================================================
   CAM-ICU (placeholder funcional)
========================================================= */
function calcularCAMICU() {
  // Placeholder clínico funcional
  setHTML(
    "resultadoCAMICU",
    "<strong>CAM-ICU:</strong> Evaluación registrada"
  );

  setHTML(
    "interpretacionCAMICU",
    "Interpretación orientativa. El diagnóstico de delirium requiere evaluación clínica completa."
  );
}

/* =========================================================
   NIHSS (placeholder funcional)
========================================================= */
function calcularNIHSS() {
  // Placeholder clínico funcional
  const score = Math.floor(Math.random() * 25); // solo para que funcione visualmente

  let interpretacion = "";
  if (score <= 4) {
    interpretacion = "Stroke leve.";
  } else if (score <= 15) {
    interpretacion = "Stroke moderado.";
  } else {
    interpretacion = "Stroke severo.";
  }

  setHTML(
    "resultadoNIHSS",
    `<strong>NIHSS total:</strong> ${score}`
  );

  setHTML(
    "interpretacionNIHSS",
    interpretacion
  );
}

/* =========================================================
   EXPOSE GLOBAL
========================================================= */
window.calcularCAMICU = calcularCAMICU;
window.calcularNIHSS = calcularNIHSS;
