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
   CAM-ICU (PASO A PASO REAL)
   Regla: positivo si (1 + 2) y (3 o 4)
========================================================= */

function resetCAMICU() {
  ["cam_step1", "cam_step2", "cam_step3", "cam_step4"].forEach((id) => {
    const el = $(id);
    if (el) el.value = "";
  });

  // ocultar todo menos paso 1
  $("cam_step2")?.closest(".card")?.classList.add("hidden");
  $("cam_steps34")?.classList.add("hidden");
  $("cam_step4")?.closest(".card")?.classList.add("hidden");
  $("cam_wait")?.classList.add("hidden");

  setResultBox("resultadoCAMICU");
  setHTML("interpretacionCAMICU");
}

function evaluarCAMICU() {
  const s1 = getSelectInt("cam_step1");
  const s2 = getSelectInt("cam_step2");
  const s3 = getSelectInt("cam_step3");
  const s4 = getSelectInt("cam_step4");

  setResultBox("resultadoCAMICU");
  setHTML("interpretacionCAMICU");

  /* =========================
     PASO 1
  ========================= */

  // Paso 1 no respondido
  if (s1 === null) {
    $("cam_step2")?.closest(".card")?.classList.add("hidden");
    $("cam_steps34")?.classList.add("hidden");
    $("cam_wait")?.classList.add("hidden");
    return;
  }

  // Paso 1 = NO → descarta delirium
  if (s1 === 0) {
    $("cam_step2").value = "";
    $("cam_step3").value = "";
    $("cam_step4").value = "";

    $("cam_step2")?.closest(".card")?.classList.add("hidden");
    $("cam_steps34")?.classList.add("hidden");
    $("cam_wait")?.classList.add("hidden");

    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Negativo.",
      "result-ok"
    );
    setHTML(
      "interpretacionCAMICU",
      "Paso 1 negativo (sin inicio agudo o curso fluctuante). Delirium descartado."
    );
    return;
  }

  /* =========================
     PASO 2 (solo si Paso 1 = Sí)
  ========================= */

  $("cam_step2")?.closest(".card")?.classList.remove("hidden");

  if (s2 === null) {
    $("cam_steps34")?.classList.add("hidden");
    $("cam_wait")?.classList.remove("hidden");
    return;
  }

  // Paso 2 = NO → descarta delirium
  if (s2 === 0) {
    $("cam_step3").value = "";
    $("cam_step4").value = "";

    $("cam_steps34")?.classList.add("hidden");
    $("cam_wait")?.classList.add("hidden");

    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Negativo.",
      "result-ok"
    );
    setHTML(
      "interpretacionCAMICU",
      "Paso 2 negativo (sin inatención). Delirium descartado."
    );
    return;
  }

  /* =========================
     PASO 3 (solo si 1 + 2 = Sí)
  ========================= */

  $("cam_steps34")?.classList.remove("hidden");
  $("cam_step4")?.closest(".card")?.classList.add("hidden");
  $("cam_wait")?.classList.add("hidden");

  if (s3 === null) return;

  /* =========================
     PASO 4 (solo después de Paso 3)
  ========================= */

  $("cam_step4")?.closest(".card")?.classList.remove("hidden");

// CAM-ICU positivo si 3 o 4 es positivo
if (s3 === 1 || s4 === 1) {
  setResultBox(
    "resultadoCAMICU",
    "<strong>CAM-ICU:</strong> Positivo.",
    "result-bad"
  );
  setHTML(
    "interpretacionCAMICU",
    "Cumple criterios: Paso 1 + Paso 2 y (Paso 3 o Paso 4)."
  );
}

// Ambos negativos (solo si ambos fueron evaluados)
if (s3 === 0 && s4 === 0) {
  setResultBox(
    "resultadoCAMICU",
    "<strong>CAM-ICU:</strong> Negativo.",
    "result-ok"
  );
  setHTML(
    "interpretacionCAMICU",
    "Paso 3 y Paso 4 negativos (RASS = 0 y sin pensamiento desorganizado)."
  );
}


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
