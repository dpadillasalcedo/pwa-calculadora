/* =========================================================
   NEUROLOGÍA CRÍTICA
   CAM-ICU · NIHSS · Hunt & Hess · Marshall
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initCAMICU();
});

/* =========================================================
   CAM-ICU · DELIRIUM
========================================================= */

function initCAMICU() {
  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();
}

function camicuPaso1() {
  const v1 = getVal("camicu_c1");
  ocultarDesdePaso(2);
  limpiarResultadoCAMICU();

  if (v1 === null) return;
  if (v1 === 1) mostrarPaso(2);
  if (v1 === 0) mostrarResultadoCAMICU(false);
}

function camicuPaso2() {
  const v2 = getVal("camicu_c2");
  ocultarDesdePaso(3);
  limpiarResultadoCAMICU();

  if (v2 === null) return;
  if (v2 === 1) mostrarPaso(3);
  else mostrarResultadoCAMICU(false);
}

function camicuPaso3() {
  const v3 = getVal("camicu_c3");
  ocultarDesdePaso(4);
  limpiarResultadoCAMICU();

  if (v3 === null) return;

  if (v3 === 1) {
    mostrarResultadoCAMICU(true);
  } else {
    mostrarPaso(4);
    setHTML("resultadoCAMICU", "CAM-ICU <strong>NO EVALUABLE</strong>");
    setHTML(
      "interpretacionCAMICU",
      "El criterio 3 es negativo. Complete el criterio 4 para concluir la evaluación."
    );
  }
}

function camicuPaso4() {
  const v4 = getVal("camicu_c4");
  if (v4 === null) return;
  mostrarResultadoCAMICU(v4 === 1);
}

/* ---------- Helpers CAM-ICU ---------- */

function getVal(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
}

function mostrarPaso(n) {
  const paso = document.getElementById(`camicu_paso${n}`);
  if (paso) paso.style.display = "block";
}

function ocultarDesdePaso(n) {
  for (let i = n; i <= 4; i++) {
    const paso = document.getElementById(`camicu_paso${i}`);
    if (paso) {
      paso.style.display = "none";
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
      "Cumple criterios diagnósticos de <strong>delirium</strong>."
    );
  } else {
    setHTML("resultadoCAMICU", "CAM-ICU <strong>NEGATIVO</strong>");
    setHTML(
      "interpretacionCAMICU",
      "No cumple criterios diagnósticos de delirium."
    );
  }
}

/* =========================================================
   NIHSS
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
      setHTML("resultadoNIHSS", "<strong>NIHSS:</strong> Error de configuración");
      setHTML("interpretacionNIHSS", "");
      return;
    }

    const v = Number(el.value);
    if (!Number.isFinite(v) || v < 0) {
      setHTML("resultadoNIHSS", "<strong>NIHSS:</strong> Complete todos los ítems");
      setHTML("interpretacionNIHSS", "");
      return;
    }

    total += v;
  }

  const interpretacion =
    total === 0 ? "Sin déficit neurológico."
    : total <= 4 ? "ACV minor."
    : total <= 15 ? "ACV moderado."
    : total <= 20 ? "ACV moderado–severo."
    : "ACV severo.";

  setHTML("resultadoNIHSS", `<strong>NIHSS total:</strong> ${total}`);
  setHTML(
    "interpretacionNIHSS",
    `<strong>Interpretación:</strong> ${interpretacion}`
  );

  if (typeof trackEvent === "function") {
    trackEvent("calculate_nihss_score", { nihss_score: total });
  }
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

  con

