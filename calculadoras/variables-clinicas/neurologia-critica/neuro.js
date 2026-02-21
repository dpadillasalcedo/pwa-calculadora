(() => {
  "use strict";

  try {
    console.log("✅ neuro.js cargado correctamente");

    /* =========================================================
       HELPERS
    ========================================================= */
    const $ = (id) => document.getElementById(id);

    const setHTML = (id, html = "") => {
      const el = $(id);
      if (el) el.innerHTML = html;
    };

    const getSelectInt = (id) => {
      const el = $(id);
      if (!el || el.value === "") return null;
      const n = Number(el.value);
      return Number.isFinite(n) ? n : null;
    };

    const safeMax = (a, b) => {
      if (a === null && b === null) return 0;
      if (a === null) return b;
      if (b === null) return a;
      return Math.max(a, b);
    };

    const setResultBox = (id, html = "", kind = null) => {
      const el = $(id);
      if (!el) return;
      el.classList.remove("result-ok", "result-bad", "result-warn");
      if (kind) el.classList.add(kind);
      el.innerHTML = html;
    };


/* =========================================================
   CAM-ICU · PASO A PASO FUNCIONAL
   Regla: (1 + 2) y (3 o 4)
========================================================= */

function resetCAMICU() {

  ["cam_step1","cam_step2","cam_step3","cam_step4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("card_step2")?.classList.add("hidden");
  document.getElementById("cam_steps34")?.classList.add("hidden");
  document.getElementById("cam_wait")?.classList.add("hidden");

  document.getElementById("resultadoCAMICU").innerHTML = "";
  document.getElementById("interpretacionCAMICU").innerHTML = "";
}


function evaluarCAMICU() {

  const s1 = document.getElementById("cam_step1")?.value;
  const s2 = document.getElementById("cam_step2")?.value;
  const s3 = document.getElementById("cam_step3")?.value;
  const s4 = document.getElementById("cam_step4")?.value;

  const card2 = document.getElementById("card_step2");
  const steps34 = document.getElementById("cam_steps34");
  const wait = document.getElementById("cam_wait");
  const resultado = document.getElementById("resultadoCAMICU");
  const interpretacion = document.getElementById("interpretacionCAMICU");

  resultado.innerHTML = "";
  interpretacion.innerHTML = "";

  /* =========================
     PASO 1
  ========================= */

  if (!s1) {
    card2?.classList.add("hidden");
    steps34?.classList.add("hidden");
    wait?.classList.add("hidden");
    return;
  }

  if (s1 === "0") {

    card2?.classList.add("hidden");
    steps34?.classList.add("hidden");
    wait?.classList.add("hidden");

    resultado.innerHTML = "<strong>CAM-ICU:</strong> Negativo.";
    resultado.className = "resultado result-ok";

    interpretacion.innerHTML =
      "Paso 1 negativo (sin inicio agudo o curso fluctuante). Delirium descartado.";

    return;
  }

  /* =========================
     PASO 2
  ========================= */

  card2?.classList.remove("hidden");

  if (!s2) {
    steps34?.classList.add("hidden");
    wait?.classList.remove("hidden");
    return;
  }

  wait?.classList.add("hidden");

  if (s2 === "0") {

    steps34?.classList.add("hidden");

    resultado.innerHTML = "<strong>CAM-ICU:</strong> Negativo.";
    resultado.className = "resultado result-ok";

    interpretacion.innerHTML =
      "Paso 2 negativo (sin inatención). Delirium descartado.";

    return;
  }

  /* =========================
     PASO 3
  ========================= */

  steps34?.classList.remove("hidden");

  if (!s3) return;

  if (s3 === "1") {

    resultado.innerHTML = "<strong>CAM-ICU:</strong> Positivo.";
    resultado.className = "resultado result-bad";

    interpretacion.innerHTML =
      "Paso 3 positivo (RASS distinto de 0).";

    return;
  }

  /* =========================
     PASO 4
  ========================= */

  if (!s4) return;

  if (s4 === "1") {

    resultado.innerHTML = "<strong>CAM-ICU:</strong> Positivo.";
    resultado.className = "resultado result-bad";

    interpretacion.innerHTML =
      "Paso 4 positivo (pensamiento desorganizado).";

    return;
  }

  /* =========================
     PASO 3 y 4 NEGATIVOS
  ========================= */

  resultado.innerHTML = "<strong>CAM-ICU:</strong> Negativo.";
  resultado.className = "resultado result-ok";

  interpretacion.innerHTML =
    "Paso 3 y Paso 4 negativos (RASS = 0 y sin pensamiento desorganizado).";
}


/* =========================================================
   LISTENERS
========================================================= */

document.getElementById("camicu")?.addEventListener("change", (e) => {
  if (e.target.tagName === "SELECT" && e.target.id.startsWith("cam_step")) {
    evaluarCAMICU();
  }
});

document.getElementById("cam_reset")?.addEventListener("click", resetCAMICU);


/* Inicializar estado */
resetCAMICU();

    

    /* =========================================================
       NIHSS
       Clasificación automática:
       - NIHSS ≤ 4 -> ACV menor
         -> ACV menor con síntomas discapacitantes si:
            * Hemianopsia homónima (n_3 === 2)
            * Neglect (n_11 ≥ 1)
            * Afasia (n_9 ≥ 1)
            * Déficit motor contra gravedad (n_5x ≥ 2 o n_6x ≥ 2)
       - NIHSS 5–15 -> ACV moderado
       - NIHSS > 15 -> ACV severo
    ========================================================= */

    function resetNIHSS() {
      [
        "n_1a","n_1b","n_1c","n_2","n_3","n_4",
        "n_5a","n_5b","n_6a","n_6b",
        "n_7","n_8","n_9","n_10","n_11"
      ].forEach((id) => {
        const el = $(id);
        if (el) el.value = "";
      });

      setResultBox("resultadoNIHSS");
      setHTML("interpretacionNIHSS");
    }

    function calcularNIHSS() {
      let total = 0;

      // suma SOLO dentro del panel NIHSS (robusto)
      document
        .querySelectorAll('#nihss select[id^="n_"]')
        .forEach((sel) => {
          const v = Number(sel.value);
          if (Number.isFinite(v)) total += v;
        });

      // Discapacitantes (según tu definición)
      const hemianopsia = getSelectInt("n_3") === 2;
      const neglect = (getSelectInt("n_11") ?? 0) >= 1;
      const afasia = (getSelectInt("n_9") ?? 0) >= 1;

      const motorBrazo = safeMax(getSelectInt("n_5a"), getSelectInt("n_5b"));
      const motorPierna = safeMax(getSelectInt("n_6a"), getSelectInt("n_6b"));
      const motorContraGravedad = motorBrazo >= 2 || motorPierna >= 2;

      const discapacitante =
        hemianopsia || neglect || afasia || motorContraGravedad;

      let clasif = "ACV severo";
      let clase = "result-bad";

      if (total <= 4) {
        clasif = discapacitante
          ? "ACV menor con síntomas discapacitantes"
          : "ACV menor";
        clase = discapacitante ? "result-warn" : "result-ok";
      } else if (total <= 15) {
        clasif = "ACV moderado";
        clase = "result-warn";
      }

      setResultBox(
        "resultadoNIHSS",
        `<strong>NIHSS:</strong> ${total} · ${clasif}`,
        clase
      );

      const hallazgos = [];
      if (hemianopsia) hallazgos.push("Hemianopsia homónima");
      if (neglect) hallazgos.push("Neglect");
      if (afasia) hallazgos.push("Afasia");
      if (motorContraGravedad) hallazgos.push("Déficit motor contra gravedad");

      setHTML(
        "interpretacionNIHSS",
        hallazgos.length
          ? `<strong>Síntomas discapacitantes:</strong> ${hallazgos.join(", ")}.`
          : ""
      );
    }

    /* =========================================================
       INIT
    ========================================================= */
    function init() {
      // CAM-ICU: escuchar cambios dentro del panel
      const camSection = $("camicu");
      if (camSection) {
        camSection.addEventListener("change", (e) => {
          const t = e.target;
          if (t && t.tagName === "SELECT" && t.id.startsWith("cam_step")) {
            evaluarCAMICU();
          }
        });
      }

      // Botones CAM-ICU
      $("cam_reset")?.addEventListener("click", resetCAMICU);

      // Botones NIHSS
      $("nihss_reset")?.addEventListener("click", resetNIHSS);
      $("nihss_calc")?.addEventListener("click", calcularNIHSS);

      // Exponer por si querés testear desde consola / onclick legacy
      window.evaluarCAMICU = evaluarCAMICU;
      window.resetCAMICU = resetCAMICU;
      window.calcularNIHSS = calcularNIHSS;
      window.resetNIHSS = resetNIHSS;

      // Estado inicial
      resetCAMICU();
      resetNIHSS();

      console.log("✅ neuro.js inicializado");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }

  } catch (err) {
    console.error("❌ Error crítico en neuro.js:", err);
  }
})();

// ==========================
// GLASGOW COMA SCALE
// ==========================

const gcsEye = document.getElementById("gcs_eye");
const gcsVerbal = document.getElementById("gcs_verbal");
const gcsMotor = document.getElementById("gcs_motor");
const gcsCalc = document.getElementById("gcs_calc");
const gcsReset = document.getElementById("gcs_reset");

const resultadoGCS = document.getElementById("resultadoGCS");
const interpretacionGCS = document.getElementById("interpretacionGCS");

if (gcsCalc) {
  gcsCalc.addEventListener("click", () => {

    const eye = parseInt(gcsEye.value);
    const verbal = parseInt(gcsVerbal.value);
    const motor = parseInt(gcsMotor.value);

    if (isNaN(eye) || isNaN(verbal) || isNaN(motor)) {
      resultadoGCS.textContent = "Completar todas las variables.";
      interpretacionGCS.textContent = "";
      return;
    }

    const total = eye + verbal + motor;

    resultadoGCS.textContent = `Glasgow total: ${total} (E${eye} V${verbal} M${motor})`;

    let interpretacion = "";
    let clase = "";

    if (total >= 13) {
      interpretacion = "Lesión leve.";
      clase = "ok";
    } else if (total >= 9) {
      interpretacion = "Lesión moderada.";
      clase = "warn";
    } else {
      interpretacion = "Lesión grave. Considerar protección de vía aérea.";
      clase = "bad";
    }

    interpretacionGCS.textContent = interpretacion;
    resultadoGCS.className = `resultado ${clase}`;
  });
}

if (gcsReset) {
  gcsReset.addEventListener("click", () => {
    gcsEye.value = "";
    gcsVerbal.value = "";
    gcsMotor.value = "";
    resultadoGCS.textContent = "";
    interpretacionGCS.textContent = "";
    resultadoGCS.className = "resultado";
  });
}
