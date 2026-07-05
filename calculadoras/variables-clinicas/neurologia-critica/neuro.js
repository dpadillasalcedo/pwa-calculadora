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


function resetCAMICU() {
  ["cam_step1","cam_step2","cam_step3","cam_step4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("card_step2")?.classList.add("hidden");
  document.getElementById("cam_step3_wrap")?.classList.add("hidden");
  document.getElementById("cam_step4_wrap")?.classList.add("hidden");
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
  const step3Wrap = document.getElementById("cam_step3_wrap");
  const step4Wrap = document.getElementById("cam_step4_wrap");
  const wait = document.getElementById("cam_wait");
  const resultado = document.getElementById("resultadoCAMICU");
  const interpretacion = document.getElementById("interpretacionCAMICU");

  resultado.innerHTML = "";
  interpretacion.innerHTML = "";

  if (!s1) {
    card2?.classList.add("hidden");
    step3Wrap?.classList.add("hidden");
    step4Wrap?.classList.add("hidden");
    wait?.classList.add("hidden");
    return;
  }

  if (s1 === "0") {
    card2?.classList.add("hidden");
    step3Wrap?.classList.add("hidden");
    step4Wrap?.classList.add("hidden");
    wait?.classList.add("hidden");

    resultado.innerHTML = "<strong>CAM-ICU:</strong> Negativo.";
    resultado.className = "resultado result-ok";
    interpretacion.innerHTML =
      "Paso 1 negativo. Sin inicio agudo o curso fluctuante: delirium descartado.";
    return;
  }

  card2?.classList.remove("hidden");

  if (!s2) {
    step3Wrap?.classList.add("hidden");
    step4Wrap?.classList.add("hidden");
    wait?.classList.remove("hidden");
    return;
  }

  wait?.classList.add("hidden");

  if (s2 === "0") {
    step3Wrap?.classList.add("hidden");
    step4Wrap?.classList.add("hidden");

    resultado.innerHTML = "<strong>CAM-ICU:</strong> Negativo.";
    resultado.className = "resultado result-ok";
    interpretacion.innerHTML =
      "Paso 2 negativo. Sin inatención: delirium descartado.";
    return;
  }

  step3Wrap?.classList.remove("hidden");

  if (!s3) {
    step4Wrap?.classList.add("hidden");
    return;
  }

  if (s3 === "1") {
    step4Wrap?.classList.add("hidden");

    resultado.innerHTML = "<strong>CAM-ICU:</strong> Positivo.";
    resultado.className = "resultado result-bad";
    interpretacion.innerHTML =
      "Paso 1 y Paso 2 positivos, con Paso 3 positivo: CAM-ICU positivo.";
    return;
  }

  step4Wrap?.classList.remove("hidden");

  if (!s4) return;

  if (s4 === "1") {
    resultado.innerHTML = "<strong>CAM-ICU:</strong> Positivo.";
    resultado.className = "resultado result-bad";
    interpretacion.innerHTML =
      "Paso 1 y Paso 2 positivos, Paso 3 negativo y Paso 4 positivo: CAM-ICU positivo.";
    return;
  }

  resultado.innerHTML = "<strong>CAM-ICU:</strong> Negativo.";
  resultado.className = "resultado result-ok";
  interpretacion.innerHTML =
    "Paso 1 y Paso 2 positivos, pero Paso 3 y Paso 4 negativos: CAM-ICU negativo.";
}

document.getElementById("camicu")?.addEventListener("change", (e) => {
  if (e.target.tagName === "SELECT" && e.target.id.startsWith("cam_step")) {
    evaluarCAMICU();
  }
});

document.getElementById("cam_reset")?.addEventListener("click", resetCAMICU);

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



    /* =========================================================
       ICH SCORE · HEMORRAGIA INTRAPARENQUIMATOSA
    ========================================================= */

    function resetICH() {

      [
        "ich_gcs",
        "ich_volumen",
        "ich_ivh",
        "ich_infratentorial",
        "ich_edad"
      ].forEach((id) => {
        const el = $(id);
        if (el) el.value = "";
      });

      setResultBox("resultadoICH");
      setHTML("interpretacionICH");
    }

    function calcularICH() {

      const gcs = getSelectInt("ich_gcs");
      const volumen = getSelectInt("ich_volumen");
      const ivh = getSelectInt("ich_ivh");
      const infra = getSelectInt("ich_infratentorial");
      const edad = getSelectInt("ich_edad");

      if (
        gcs === null ||
        volumen === null ||
        ivh === null ||
        infra === null ||
        edad === null
      ) {
        setResultBox(
          "resultadoICH",
          "Completar todas las variables.",
          "result-warn"
        );
        setHTML("interpretacionICH");
        return;
      }

      let total = 0;

      // GCS
      total += gcs;

      // Volumen hematoma
      total += volumen;

      // Hemorragia intraventricular
      total += ivh;

      // Origen infratentorial
      total += infra;

      // Edad
      total += edad;

      let riesgo = "";
      let clase = "";

      if (total <= 1) {
        riesgo = "Bajo riesgo";
        clase = "result-ok";
      } else if (total <= 3) {
        riesgo = "Riesgo moderado";
        clase = "result-warn";
      } else {
        riesgo = "Alto riesgo de mortalidad";
        clase = "result-bad";
      }

      setResultBox(
        "resultadoICH",
        `<strong>ICH Score:</strong> ${total} / 6 · ${riesgo}`,
        clase
      );

      setHTML(
        "interpretacionICH",
        `
        Escala pronóstica en hemorragia intracerebral espontánea.
        Puntajes elevados se asocian con peor pronóstico funcional y mayor mortalidad.
        `
      );
    }
