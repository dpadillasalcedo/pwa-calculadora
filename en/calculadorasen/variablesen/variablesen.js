console.log("neuro.js cargado correctamente");

/* =========================================================
   HELPERS
========================================================= */
function $(id) {
  return document.getElementById(id);
}

function setHTML(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}

function getSelectInt(id) {
  const el = $(id);
  if (!el) return null;
  if (el.value === "") return null;
  const n = Number(el.value);
  return Number.isFinite(n) ? n : null;
}

function setResultBox(id, html, kind) {
  const el = $(id);
  if (!el) return;
  el.classList.remove("result-ok", "result-bad", "result-warn");
  if (kind) el.classList.add(kind);
  el.innerHTML = html;
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // CAM-ICU init
  resetCAMICU();

  // NIHSS init
  resetNIHSS();

  // Bind CAM-ICU events
  ["cam_step1", "cam_step2", "cam_step3", "cam_step4"].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("change", evaluarCAMICU);
  });

  const camReset = $("cam_reset");
  if (camReset) camReset.addEventListener("click", resetCAMICU);

  const nihssReset = $("nihss_reset");
  if (nihssReset) nihssReset.addEventListener("click", resetNIHSS);
});

/* =========================================================
   CAM-ICU (paso a paso)
   - No muestra resultado hasta completar paso 3 o 4
   - Excepto: si paso 1 o 2 es negativo, muestra negativo temprano
========================================================= */
function resetCAMICU() {
  ["cam_step1","cam_step2","cam_step3","cam_step4"].forEach((id) => {
    const el = $(id);
    if (el) el.value = "";
  });

  const steps34 = $("cam_steps34");
  if (steps34) steps34.classList.add("hidden");

  const wait = $("cam_wait");
  if (wait) wait.classList.remove("hidden");

  setResultBox("resultadoCAMICU", "", null);
  setHTML("interpretacionCAMICU", "");
}

function evaluarCAMICU() {
  const s1 = getSelectInt("cam_step1"); // 1 sí, 0 no
  const s2 = getSelectInt("cam_step2");
  const s3 = getSelectInt("cam_step3");
  const s4 = getSelectInt("cam_step4");

  const steps34 = $("cam_steps34");
  const wait = $("cam_wait");

  // Aún no completó paso 1 y 2 → no mostrar resultado
  if (s1 === null || s2 === null) {
    if (steps34) steps34.classList.add("hidden");
    if (wait) wait.classList.remove("hidden");
    setResultBox("resultadoCAMICU", "", null);
    setHTML("interpretacionCAMICU", "");
    return;
  }

  // Si alguno es negativo temprano → conclusión negativa inmediata
  if (s1 === 0 || s2 === 0) {
    if (steps34) steps34.classList.add("hidden");
    if (wait) wait.classList.add("hidden");

    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Negativo (criterios iniciales no cumplen).",
      "result-ok"
    );

    setHTML(
      "interpretacionCAMICU",
      "Si cambia el estado mental o la atención, repetir la evaluación. Interpretar en contexto clínico."
    );
    return;
  }

  // Paso 1 y 2 positivos → habilitar pasos 3/4
  if (steps34) steps34.classList.remove("hidden");
  if (wait) wait.classList.add("hidden");

  // Regla del usuario:
  // No mostrar resultado hasta completar paso 3 o 4,
  // salvo negativo temprano (ya cubierto).
  const has3 = (s3 !== null);
  const has4 = (s4 !== null);

  if (!has3 && !has4) {
    setResultBox(
      "resultadoCAMICU",
      "Completar <strong>Paso 3</strong> o <strong>Paso 4</strong> para concluir la evaluación.",
      "result-warn"
    );
    setHTML("interpretacionCAMICU", "");
    return;
  }

  // Conclusión:
  // Positivo si 1 + 2 + (3 o 4)
  const positivo = (s3 === 1) || (s4 === 1);

  // Si se respondió uno de los pasos y es positivo → ya concluye positivo
  if (positivo) {
    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> <strong>Positivo</strong> (1 + 2 + (3 o 4)).",
      "result-bad"
    );

    setHTML(
      "interpretacionCAMICU",
      "Compatible con delirium según CAM-ICU. Confirmar factores precipitantes (sepsis, hipoxemia, sedación, abstinencia, etc.) y plan de manejo."
    );
    return;
  }

  // Si ninguno de los respondidos es positivo, solo podemos concluir negativo si:
  // - se completaron ambos (3 y 4) y ambos negativos
  if (has3 && has4 && s3 === 0 && s4 === 0) {
    setResultBox(
      "resultadoCAMICU",
      "<strong>CAM-ICU:</strong> Negativo (pasos 3 y 4 negativos).",
      "result-ok"
    );

    setHTML(
      "interpretacionCAMICU",
      "Si hay sospecha clínica, repetir evaluación y revisar sedación/analgesia, sueño, dolor y entorno."
    );
    return;
  }

  // Si solo completó 3 o 4 (y fue negativo), falta el otro para concluir negativo
  setResultBox(
    "resultadoCAMICU",
    "Resultado aún <strong>inconcluso</strong>: falta completar el otro paso (3 o 4) para descartar.",
    "result-warn"
  );
  setHTML("interpretacionCAMICU", "");
}

/* =========================================================
   NIHSS (completo)
   - Valida que todos los ítems estén seleccionados
   - Clasifica: ACV menor / moderado / severo
   - Regla especial: "ACV menor discapacitante" si puntaje bajo + flags
========================================================= */
function resetNIHSS() {
  const ids = [
    "n_1a","n_1b","n_1c","n_2","n_3","n_4","n_5a","n_5b","n_6a","n_6b",
    "n_7","n_8","n_9","n_10","n_11"
  ];
  ids.forEach((id) => {
    const el = $(id);
    if (el) el.value = "";
  });
  setResultBox("resultadoNIHSS", "", null);
  setHTML("interpretacionNIHSS", "");
}

function calcularNIHSS() {
  const items = [
    ["1a", "n_1a"],
    ["1b", "n_1b"],
    ["1c", "n_1c"],
    ["2",  "n_2"],
    ["3",  "n_3"],
    ["4",  "n_4"],
    ["5a", "n_5a"],
    ["5b", "n_5b"],
    ["6a", "n_6a"],
    ["6b", "n_6b"],
    ["7",  "n_7"],
    ["8",  "n_8"],
    ["9",  "n_9"],
    ["10", "n_10"],
    ["11", "n_11"]
  ];

  let total = 0;
  const faltantes = [];

  for (const [label, id] of items) {
    const v = getSelectInt(id);
    if (v === null) {
      faltantes.push(label);
    } else {
      total += v;
    }
  }

  if (faltantes.length > 0) {
    setResultBox(
      "resultadoNIHSS",
      `Faltan ítems por completar: <strong>${faltantes.join(", ")}</strong>.`,
      "result-warn"
    );
    setHTML("interpretacionNIHSS", "");
    return;
  }

  // Flags de “menor discapacitante”
  // - Hemianopsia homónima: visual completo (n_3 == 2)
  // - Neglect: n_11 >= 1
  // - Afasia: n_9 >= 1
  // - Déficit motor contra la gravedad: arm/leg >= 2
  const visual = getSelectInt("n_3");
  const neglect = getSelectInt("n_11");
  const afasia = getSelectInt("n_9");
  const motorArm = Math.max(getSelectInt("n_5a"), getSelectInt("n_5b"));
  const motorLeg = Math.max(getSelectInt("n_6a"), getSelectInt("n_6b"));

  const flagHemianopsiaHomonima = (visual === 2);
  const flagNeglect = (neglect !== null && neglect >= 1);
  const flagAfasia = (afasia !== null && afasia >= 1);
  const flagMotorContraGravedad =
    (motorArm !== null && motorArm >= 2) || (motorLeg !== null && motorLeg >= 2);

  const discapacitante =
    flagHemianopsiaHomonima || flagNeglect || flagAfasia || flagMotorContraGravedad;

  // Clasificación simple: menor / moderado / severo
  let clasif = "";
  if (total <= 4) {
    clasif = discapacitante ? "ACV menor discapacitante" : "ACV menor";
  } else if (total <= 15) {
    clasif = "ACV moderado";
  } else {
    clasif = "ACV severo";
  }

  const flagsTxt = [];
  if (flagHemianopsiaHomonima) flagsTxt.push("hemianopsia homónima");
  if (flagNeglect) flagsTxt.push("neglect");
  if (flagAfasia) flagsTxt.push("afasia");
  if (flagMotorContraGravedad) flagsTxt.push("déficit motor contra la gravedad");

  setResultBox(
    "resultadoNIHSS",
    `<strong>NIHSS total:</strong> ${total} · <strong>${clasif}</strong>`,
    (clasif.includes("severo") ? "result-bad" : clasif.includes("moderado") ? "result-warn" : "result-ok")
  );

  const detalleFlags = (total <= 4 && discapacitante)
    ? `<br><br><strong>Criterios de discapacidad detectados:</strong> ${flagsTxt.join(", ")}.`
    : (flagsTxt.length ? `<br><br><strong>Hallazgos presentes:</strong> ${flagsTxt.join(", ")}.` : "");

  setHTML(
    "interpretacionNIHSS",
    `Interpretación orientativa basada en puntaje total.${detalleFlags}`
  );
}

/* =========================================================
   EXPOSE GLOBAL (onclick inline)
========================================================= */
window.calcularNIHSS = calcularNIHSS;
