console.log("neuro.js cargado correctamente");

/* =========================================================
   HELPERS
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

function show(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

function resetSelectInside(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sel = el.querySelector("select");
  if (sel) sel.value = "";
}

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("camicu")) initCAMICU();
});

/* =========================================================
   CAM-ICU · DELIRIUM
   Regla: POSITIVO si 1 + 2 y (3 o 4).
   Conclusiones tempranas válidas:
   - Si Paso 1 = NO => NEGATIVO (no cumple 1)
   - Si Paso 2 = NO => NEGATIVO (no cumple 2)
   - Si Paso 3 = SÍ => POSITIVO (cumple 3, no requiere 4)
   - Si Paso 3 = NO => necesita Paso 4 para concluir
========================================================= */

function initCAMICU() {
  // Oculta pasos 2-4 y limpia resultados
  hide("camicu_paso2");
  hide("camicu_paso3");
  hide("camicu_paso4");

  resetSelectInside("camicu_paso2");
  resetSelectInside("camicu_paso3");
  resetSelectInside("camicu_paso4");

  limpiarResultadoCAMICU();
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
      "Cumple criterios diagnósticos de <strong>delirium</strong> (Feature 1 + 2 y 3/4)."
    );
  } else {
    setHTML("resultadoCAMICU", "CAM-ICU <strong>NEGATIVO</strong>");
    setHTML(
      "interpretacionCAMICU",
      "No cumple criterios diagnósticos de delirium en esta evaluación."
    );
  }
}

function camicuPaso1() {
  const v1 = getVal("camicu_c1");

  // Reset hacia adelante
  hide("camicu_paso2");
  hide("camicu_paso3");
  hide("camicu_paso4");
  resetSelectInside("camicu_paso2");
  resetSelectInside("camicu_paso3");
  resetSelectInside("camicu_paso4");
  limpiarResultadoCAMICU();

  if (v1 === null) return;

  if (v1 === 1) {
    // Continúa
    show("camicu_paso2");
    setHTML(
      "interpretacionCAMICU",
      "Continuar con <strong>Paso 2</strong> (inatención)."
    );
    return;
  }

  // Conclusión temprana válida: si Feature 1 NO, no puede ser positivo
  mostrarResultadoCAMICU(false);
}

function camicuPaso2() {
  const v2 = getVal("camicu_c2");

  // Reset hacia adelante
  hide("camicu_paso3");
  hide("camicu_paso4");
  resetSelectInside("camicu_paso3");
  resetSelectInside("camicu_paso4");
  limpiarResultadoCAMICU();

  if (v2 === null) return;

  if (v2 === 1) {
    show("camicu_paso3");
    setHTML(
      "interpretacionCAMICU",
      "Continuar con <strong>Paso 3</strong>. Si es positivo, ya concluye sin Paso 4."
    );
    return;
  }

  // Conclusión temprana válida: si Feature 2 NO, no puede ser positivo
  mostrarResultadoCAMICU(false);
}

function camicuPaso3() {
  const v3 = getVal("camicu_c3");

  // Reset hacia adelante
  hide("camicu_paso4");
  resetSelectInside("camicu_paso4");
  limpiarResultadoCAMICU();

  if (v3 === null) return;

  if (v3 === 1) {
    // Conclusión temprana válida: 1 y 2 ya se asumieron Sí si llegaste acá
    mostrarResultadoCAMICU(true);
    return;
  }

  // Si Feature 3 NO, recién concluye al evaluar Feature 4
  show("camicu_paso4");
  setHTML(
    "resultadoCAMICU",
    "CAM-ICU: falta confirmar el <strong>Paso 4</strong> para concluir."
  );
  setHTML(
    "interpretacionCAMICU",
    "Como el <strong>Paso 3</strong> es negativo, el diagnóstico depende de si el <strong>Paso 4</strong> es positivo."
  );
}

function camicuPaso4() {
  const v4 = getVal("camicu_c4");
  limpiarResultadoCAMICU();

  if (v4 === null) return;

  // Si llegaste al paso 4, es porque 1 y 2 fueron Sí y 3 fue No.
  // Conclusión: positivo si 4 es Sí, si no => negativo.
  mostrarResultadoCAMICU(v4 === 1);
}

/* =========================================================
   NIHSS · STROKE SCALE (COMPLETO)
========================================================= */

function calcularNIHSS() {
  const ids = [
    "nihss_1a", "nihss_1b", "nihss_1c",
    "nihss_2", "nihss_3", "nihss_4",
    "nihss_5a", "nihss_5b",
    "nihss_6a", "nihss_6b",
    "nihss_7", "nihss_8", "nihss_9",
    "nihss_10", "nihss_11"
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      setHTML("resultadoNIHSS", "<strong>NIHSS:</strong> Error de configuración (ID faltante).");
      setHTML("interpretacionNIHSS", `No se encontró el campo: <code>${id}</code>`);
      return;
    }

    if (el.value === "") {
      setHTML("resultadoNIHSS", "<strong>NIHSS:</strong> evaluación incompleta");
      setHTML("interpretacionNIHSS", "Complete todos los ítems para obtener el puntaje total.");
      return;
    }

    const v = Number(el.value);
    if (!Number.isFinite(v) || v < 0) {
      setHTML("resultadoNIHSS", "<strong>NIHSS:</strong> valor inválido");
      setHTML("interpretacionNIHSS", "Revise los valores seleccionados.");
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
  setHTML("interpretacionNIHSS", `<strong>Interpretación:</strong> ${interpretacion}`);
}


console.log("fisher.js cargado correctamente");

/* =========================================================
   FISHER · HEMORRAGIA SUBARACNOIDEA
========================================================= */

function calcularFisher() {
  const sel = document.getElementById("fisher_score");
  const v = sel ? Number(sel.value) : null;

  if (!v) {
    setHTML("resultadoFisher", "Seleccione un grado de la escala de Fisher.");
    setHTML("interpretacionFisher", "");
    return;
  }

  const info = {
    1: {
      titulo: "Grado I",
      desc: "No se observa sangre subaracnoidea en la TAC.",
      riesgo: "Riesgo bajo de vasoespasmo."
    },
    2: {
      titulo: "Grado II",
      desc: "Sangre subaracnoidea difusa en capas delgadas (< 1 mm).",
      riesgo: "Riesgo bajo–moderado de vasoespasmo."
    },
    3: {
      titulo: "Grado III",
      desc: "Coágulos localizados o capa de sangre ≥ 1 mm.",
      riesgo: "Alto riesgo de vasoespasmo."
    },
    4: {
      titulo: "Grado IV",
      desc: "Hemorragia intraventricular o intraparenquimatosa asociada.",
      riesgo: "Riesgo elevado de vasoespasmo y peor pronóstico."
    }
  };

  const d = info[v];

  setHTML(
    "resultadoFisher",
    `Fisher: <strong>${d.titulo}</strong>`
  );

  setHTML(
    "interpretacionFisher",
    `<strong>Hallazgo en TAC:</strong> ${d.desc}<br>
     <strong>Orientación clínica:</strong> ${d.riesgo}`
  );
}

/* =========================================================
   HELPER LOCAL
   (usa el mismo patrón que neuro.js)
========================================================= */

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

         
/* =========================================================
   HUNT & HESS · HSA (con info útil)
========================================================= */

function calcularHuntHess() {
  const v = getVal("hunt_hess");

  if (v === null) {
    setHTML("resultadoHuntHess", "Seleccione un grado clínico.");
    setHTML("interpretacionHuntHess", "");
    return;
  }

  const info = {
    1: {
      titulo: "Grado I",
      desc: "Asintomático o cefalea leve; rigidez nucal mínima.",
      sev: "Menor severidad · mejor pronóstico relativo."
    },
    2: {
      titulo: "Grado II",
      desc: "Cefalea moderada–severa, rigidez nucal; sin déficit focal importante.",
      sev: "Severidad baja–moderada."
    },
    3: {
      titulo: "Grado III",
      desc: "Somnolencia, confusión o déficit neurológico leve.",
      sev: "Severidad moderada · mayor riesgo de complicaciones."
    },
    4: {
      titulo: "Grado IV",
      desc: "Estupor, déficit focal moderado–severo.",
      sev: "Alta severidad · pronóstico reservado."
    },
    5: {
      titulo: "Grado V",
      desc: "Coma profundo, postura de descerebración/decorticación posible.",
      sev: "Muy alta severidad · pronóstico muy reservado."
    }
  };

  const d = info[v];

  setHTML("resultadoHuntHess", `Hunt & Hess: <strong>${d.titulo}</strong>`);
  setHTML(
    "interpretacionHuntHess",
    `<strong>Clínica típica:</strong> ${d.desc}<br><strong>Orientación:</strong> ${d.sev}`
  );
}

/* =========================================================
   MARSHALL SCORE · TCE (con descripción)
========================================================= */

function calcularMarshall() {
  const v = getVal("marshall_score");

  if (v === null) {
    setHTML("resultadoMarshall", "Seleccione una categoría.");
    setHTML("interpretacionMarshall", "");
    return;
  }

  const info = {
    1: "I · TAC normal.",
    2: "II · Lesiones difusas (cisternas presentes, desviación línea media 0–5 mm) y/o lesiones < 25 ml.",
    3: "III · Edema con cisternas comprimidas/ausentes; desviación línea media 0–5 mm; sin lesión > 25 ml.",
    4: "IV · Desviación de línea media > 5 mm; sin lesión > 25 ml.",
    5: "V · Lesión evacuada.",
    6: "VI · Lesión no evacuada > 25 ml."
  };

  setHTML("resultadoMarshall", `Marshall: <strong>Categoría ${v}</strong>`);
  setHTML("interpretacionMarshall", info[v] || "Clasificación tomográfica para estratificar riesgo y pronóstico.");
}
