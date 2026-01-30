try {
  console.log("neuro.js cargado correctamente");

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
     CAM-ICU
  ========================================================= */
  function resetCAMICU() {
    ["cam_step1", "cam_step2", "cam_step3", "cam_step4"].forEach((id) => {
      const el = $(id);
      if (el) el.value = "";
    });

    $("cam_steps34")?.classList.add("hidden");
    $("cam_wait")?.classList.remove("hidden");

    setResultBox("resultadoCAMICU");
    setHTML("interpretacionCAMICU");
  }

  function evaluarCAMICU() {
    const s1 = getSelectInt("cam_step1");
    const s2 = getSelectInt("cam_step2");
    const s3 = getSelectInt("cam_step3");
    const s4 = getSelectInt("cam_step4");

    // Limpieza de salida cada vez que cambia algo
    setResultBox("resultadoCAMICU");
    setHTML("interpretacionCAMICU");

    // Si todavía no se eligió el Paso 1, no evaluamos nada
    if (s1 === null) return;

    // PASO 1 negativo → CAM-ICU negativo automático
    if (s1 === 0) {
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

    // PASO 2: si no está respondido, dejamos callout visible y ocultamos 3-4
    if (s2 === null) {
      $("cam_steps34")?.classList.add("hidden");
      $("cam_wait")?.classList.remove("hidden");
      return;
    }

    // Paso 2 negativo → CAM-ICU negativo
    if (s2 === 0) {
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

    // Si Paso 1 + Paso 2 positivos → mostrar Paso 3 y 4
    $("cam_steps34")?.classList.remove("hidden");
    $("cam_wait")?.classList.add("hidden");

    // Si todavía no contestó 3 ni 4, esperamos
    if (s3 === null && s4 === null) return;

    // CAM-ICU positivo si (Paso 3 o Paso 4) es positivo
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
      return;
    }

    // Si 3 y 4 negativos → CAM-ICU negativo
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
  }

  /* =========================================================
     NIHSS
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

    const visual = getSelectInt("n_3");
    const neglect = getSelectInt("n_11");
    const afasia = getSelectInt("n_9");

    const motorArm = safeMax(getSelectInt("n_5a"), getSelectInt("n_5b"));
    const motorLeg = safeMax(getSelectInt("n_6a"), getSelectInt("n_6b"));

    document.querySelectorAll('select[id^="n_"]').forEach((sel) => {
      const v = Number(sel.value);
      if (Number.isFinite(v)) total += v;
    });

    const discapacitante =
      visual === 2 ||
      (neglect !== null && neglect >= 1) ||
      (afasia !== null && afasia >= 1) ||
      motorArm >= 2 ||
      motorLeg >= 2;

    let clasif = "ACV severo";
    if (total <= 4) clasif = discapacitante ? "ACV menor discapacitante" : "ACV menor";
    else if (total <= 15) clasif = "ACV moderado";

    setResultBox(
      "resultadoNIHSS",
      `<strong>NIHSS:</strong> ${total} · ${clasif}`,
      clasif.includes("severo")
        ? "result-bad"
        : clasif.includes("moderado")
        ? "result-warn"
        : "result-ok"
    );
  }

  /* =========================================================
     INIT (ROBUSTO)
     - Usa event delegation para CAM-ICU (siempre responde)
  ========================================================= */
  function init() {
    // Verificación mínima
    const camSection = $("camicu");
    if (!camSection) {
      console.warn("⚠️ No se encontró #camicu. ¿Estás en la página correcta?");
    } else {
      // Listener único: funciona siempre aunque cambie el DOM
      camSection.addEventListener("change", (e) => {
        const t = e.target;
        if (t && t.tagName === "SELECT" && t.id.startsWith("cam_step")) {
          evaluarCAMICU();
        }
      });
    }

    $("cam_reset")?.addEventListener("click", resetCAMICU);
    $("nihss_reset")?.addEventListener("click", resetNIHSS);

    resetCAMICU();
    resetNIHSS();

    window.calcularNIHSS = calcularNIHSS;
    // Exponer CAM-ICU por si querés testear manualmente
    window.evaluarCAMICU = evaluarCAMICU;

    console.log("✅ neuro.js inicializado");
  }

  // init seguro sin depender de DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();


<!-- =========================
     NIHSS
========================= -->
  /* =========================================================
     NIHSS
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

    document.querySelectorAll('select[id^="n_"]').forEach((sel) => {
      const v = Number(sel.value);
      if (Number.isFinite(v)) total += v;
    });

    const hemianopsia = getSelectInt("n_3") === 2;
    const neglect = (getSelectInt("n_11") ?? 0) >= 1;
    const afasia = (getSelectInt("n_9") ?? 0) >= 1;

    const motorBrazo = safeMax(getSelectInt("n_5a"), getSelectInt("n_5b"));
    const motorPierna = safeMax(getSelectInt("n_6a"), getSelectInt("n_6b"));

    const discapacitante =
      hemianopsia || neglect || afasia || motorBrazo >= 2 || motorPierna >= 2;

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
  }

  /* =========================================================
     INIT
  ========================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    resetCAMICU();
    resetNIHSS();

    ["cam_step1","cam_step2","cam_step3","cam_step4"].forEach((id) => {
      $(id)?.addEventListener("change", evaluarCAMICU);
    });

    $("cam_reset")?.addEventListener("click", resetCAMICU);
    $("nihss_reset")?.addEventListener("click", resetNIHSS);

    window.calcularNIHSS = calcularNIHSS;
  });

} catch (err) {
  console.error("❌ Error crítico en neuro.js:", err);
}

