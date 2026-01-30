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
  const s1 = getSelectInt("cam_step1"); // Inicio agudo / curso fluctuante
  const s2 = getSelectInt("cam_step2"); // Inatención
  const s3 = getSelectInt("cam_step3"); // Alteración conciencia (RASS ≠ 0)
  const s4 = getSelectInt("cam_step4"); // Pensamiento desorganizado

  // Reset visual previo
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
      "No cumple criterio de inicio agudo o curso fluctuante. Delirium descartado."
    );
    return;
  }

  /* =========================
     PASO 2
     Inatención
  ========================= */
  if (s2 === null) {
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
      "No se detecta inatención. Delirium descartado."
    );
    return;
  }

  /* =========================
     PASOS 3 y 4
     (habilitados solo si 1 + 2 positivos)
  ========================= */
  $("cam_steps34")?.classList.remove("hidden");
  $("cam_wait")?.classList.add("hidden");

  if (s3 === null && s4 === null) return;

  /* =========================
     PASO 3 (RASS ≠ 0)
     o PASO 4 positivo
  ========================= */
  if (s3 === 1 || s4 === 1) {
    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Positivo.",
      "result-bad"
    );

    setHTML(
      "interpretacionCAMICU",
      "Cumple criterios CAM-ICU: inicio agudo + inatención y alteración del nivel de conciencia (RASS ≠ 0) y/o pensamiento desorganizado."
    );
    return;
  }

  /* =========================
     PASOS 3 y 4 negativos
  ========================= */
  if (s3 === 0 && s4 === 0) {
    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Negativo.",
      "result-ok"
    );

    setHTML(
      "interpretacionCAMICU",
      "No se evidencia alteración del nivel de conciencia (RASS = 0) ni pensamiento desorganizado."
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

    document
      .querySelectorAll('select[id^="n_"]')
      .forEach((sel) => {
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
    if (total <= 4) {
      clasif = discapacitante
        ? "ACV menor discapacitante"
        : "ACV menor";
    } else if (total <= 15) {
      clasif = "ACV moderado";
    }

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
     INIT (defer-safe)
  ========================================================= */
  resetCAMICU();
  resetNIHSS();

  ["cam_step1", "cam_step2", "cam_step3", "cam_step4"].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("change", evaluarCAMICU);
  });

  $("cam_reset")?.addEventListener("click", resetCAMICU);
  $("nihss_reset")?.addEventListener("click", resetNIHSS);

  /* =========================================================
     GLOBAL
  ========================================================= */
  window.calcularNIHSS = calcularNIHSS;

} catch (err) {
  console.error("❌ Error crítico en neuro.js:", err);
}
