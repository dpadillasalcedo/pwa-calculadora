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
 function evaluarCAMICU() {
  const s1 = getSelectInt("cam_step1");
  const s2 = getSelectInt("cam_step2");
  const s3 = getSelectInt("cam_step3");
  const s4 = getSelectInt("cam_step4");

  setResultBox("resultadoCAMICU");
  setHTML("interpretacionCAMICU");

  /* =========================
     PASO 1
     Negativo → descarta delirium
  ========================= */
  if (s1 === null) return;

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
      "No hay inicio agudo ni curso fluctuante del estado mental. Delirium descartado."
    );
    return;
  }

  /* =========================
     PASO 2
  ========================= */
  if (s2 === null) {
    $("cam_steps34")?.classList.add("hidden");
    $("cam_wait")?.classList.remove("hidden");
    return;
  }

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
      "No se evidencia inatención. Delirium descartado."
    );
    return;
  }

  /* =========================
     PASOS 3 y 4
     Se habilitan SIEMPRE
     luego de 1 + 2 positivos
  ========================= */
  $("cam_steps34")?.classList.remove("hidden");
  $("cam_wait")?.classList.add("hidden");

  if (s3 === null && s4 === null) return;

  if (s3 === 1 || s4 === 1) {
    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Positivo.",
      "result-bad"
    );

    setHTML(
      "interpretacionCAMICU",
      "Cumple criterios CAM-ICU: inicio agudo, inatención y alteración del nivel de conciencia (RASS ≠ 0) y/o pensamiento desorganizado."
    );
    return;
  }

  if (s3 === 0 && s4 === 0) {
    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Negativo.",
      "result-ok"
    );

    setHTML(
      "interpretacionCAMICU",
      "No se detecta alteración del nivel de conciencia ni pensamiento desorganizado."
    );
  }
}


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

