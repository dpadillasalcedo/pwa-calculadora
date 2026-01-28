console.log("neuro.js cargado correctamente");

/* =========================================================
   NEUROLOGÍA CRÍTICA
   CAM-ICU · NIHSS · Hunt & Hess · Marshall
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("camicu")) {
    initCAMICU();
  }
});

/* =========================================================
   HELPERS GLOBALES
========================================================= */

function getVal(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* =========================================================
   CAM-ICU · DELIRIUM  
========================================================= */

let camicu = {
  p1: null,
  p2: null,
  p3: null,
  p4: null
};

function initCAMICU() {
  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();
}

function camicuPaso1(v) {
  camicu.p1 = Number(v);
  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();

  if (camicu.p1 === 1) mostrarPaso(2);
}

function camicuPaso2(v) {
  camicu.p2 = Number(v);
  ocultarDesdePaso(3);
  limpiarResultadoCAMICU();

  if (camicu.p2 !== null) mostrarPaso(3);
}

function camicuPaso3(v) {
  camicu.p3 = Number(v);
  ocultarDesdePaso(4);
  limpiarResultadoCAMICU();

  if (camicu.p3 !== null) mostrarPaso(4);
}

function camicuPaso4(v) {
  camicu.p4 = Number(v);

  if (
    camicu.p1 === null ||
    camicu.p2 === null ||
    camicu.p3 === null ||
    camicu.p4 === null
  ) return;

  const positivo =
    camicu.p1 === 1 &&
    camicu.p2 === 1 &&
    (camicu.p3 === 1 || camicu.p4 === 1);

  mostrarResultadoCAMICU(positivo);
}

/* ---------- helpers ---------- */

function mostrarPaso(n) {
  const paso = document.getElementById(`camicu_paso${n}`);
  if (paso) paso.hidden = false;
}

function ocultarDesdePaso(n) {
  for (let i = n; i <= 4; i++) {
    const paso = document.getElementById(`camicu_paso${i}`);
    if (paso) {
      paso.hidden = true;
      const sel = paso.querySelector("select");
      if (sel) sel.value = "";
    }
  }
}

function limpiarResultadoCAMICU() {
  setHTML("resultadoCAMICU", "");
  setHTML("interpretacionCAMICU", "");
}

function mostrarResultadoCAMICU(positivo) {
  if (positivo) {
    setHTML("resultadoCAMICU", "CAM-ICU <strong>POSITIVO</strong>");
    setHTML(
      "interpretacionCAMICU",
      "El paciente cumple criterios de <strong>delirium</strong> según CAM-ICU."
    );
  } else {
    setHTML("resultadoCAMICU", "CAM-ICU <strong>NEGATIVO</strong>");
    setHTML(
      "interpretacionCAMICU",
      "No cumple criterios diagnósticos de delirium al momento de la evaluación."
    );
  }
}

/* =========================================================
   NIHSS · STROKE SCALE
========================================================= */

function calcularNIHSS() {
  const ids = [
    "nihss_1a","nihss_1b","nihss_1c",
    "nihss_2","nihss_3","nihss_4",
    "nihss_motor","nihss_ataxia",
    "nihss_sens","nihss_lang",
    "nihss_dys","nihss_neglect"
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);

    if (!el) {
      setHTML("resultadoNIHSS", "Error de configuración NIHSS.");
      setHTML("interpretacionNIHSS", "");
      return;
    }

    const v = Number(el.value);

    if (!Number.isFinite(v)) {
      setHTML(
        "resultadoNIHSS",
        "<strong>NIHSS:</strong> evaluación incompleta"
      );
      setHTML(
        "interpretacionNIHSS",
        "Debe completar todos los ítems para obtener el puntaje."
      );
      return;
    }

    total += v;
  }

  let interpretacion = "";
  if (total === 0) interpretacion = "Sin déficit neurológico.";
  else if (total <= 4) interpretacion = "ACV menor.";
  else if (total <= 15) interpretacion = "ACV moderado.";
  else if (total <= 20) interpretacion = "ACV moderado–severo.";
  else interpretacion = "ACV severo.";

  setHTML("resultadoNIHSS", `<strong>NIHSS total:</strong> ${total}`);
  setHTML(
    "interpretacionNIHSS",
    `<strong>Interpretación:</strong> ${interpretacion}`
  );
}

/* =========================================================
   HUNT & HESS · HSA
========================================================= */

function calcularHuntHess() {
  const v = getVal("hunt_hess");

  if (v === null) {
    setHTML("resultadoHuntHess", "Seleccione un grado clínico.");
    setHTML("interpretacionHuntHess", "");
    return;
  }

  setHTML("resultadoHuntHess", `Hunt & Hess: Grado ${v}`);
  setHTML(
    "interpretacionHuntHess",
    "Clasificación clínica para estimar gravedad y pronóstico."
  );
}

/* =========================================================
   MARSHALL SCORE · TCE
========================================================= */

function calcularMarshall() {
  const v = getVal("marshall_score");

  if (v === null) {
    setHTML("resultadoMarshall", "Seleccione una categoría.");
    setHTML("interpretacionMarshall", "");
    return;
  }

  setHTML("resultadoMarshall", `Marshall: Categoría ${v}`);
  setHTML(
    "interpretacionMarshall",
    "Clasificación tomográfica para estratificación de riesgo."
  );
}
