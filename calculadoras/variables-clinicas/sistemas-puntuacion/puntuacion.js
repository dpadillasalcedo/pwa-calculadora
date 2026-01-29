/* =========================
   HELPERS
========================= */
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* =========================
   SOFA-2
========================= */
function calcularSOFA2() {
  const ids = [
    "sofa2_neuro",
    "sofa2_resp",
    "sofa2_cv",
    "sofa2_liver",
    "sofa2_platelets",
    "sofa2_renal"
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);

    if (!el || el.value === "") {
      setHTML(
        "resultadoSOFA2",
        "<strong>SOFA-2:</strong> Seleccione todas las variables"
      );
      setHTML("interpretacionSOFA2", "");
      return;
    }

    const value = Number(el.value);
    if (!Number.isFinite(value) || value < 0 || value > 4) {
      setHTML(
        "resultadoSOFA2",
        "<strong>SOFA-2:</strong> Error en los valores seleccionados"
      );
      setHTML("interpretacionSOFA2", "");
      return;
    }

    total += value;
  }

  let interpretacion =
    total <= 2 ? "Disfunción orgánica mínima"
    : total <= 6 ? "Disfunción orgánica leve"
    : total <= 9 ? "Disfunción orgánica moderada"
    : total <= 12 ? "Disfunción orgánica severa"
    : "Alto riesgo de mortalidad";

  setHTML(
    "resultadoSOFA2",
    `<strong>SOFA-2 total:</strong> ${total} / 24`
  );

  setHTML(
    "interpretacionSOFA2",
    interpretacion
  );

  if (typeof trackEvent === "function") {
    trackEvent("calculate_sofa2_score", { sofa2_score: total });
  }
}

/* =========================
   APACHE II
========================= */
function calcularAPACHE2() {
  const ids = [
    "ap_temp",
    "ap_map",
    "ap_hr",
    "ap_ph",
    "ap_na",
    "ap_k",
    "ap_cr",
    "ap_gcs",
    "ap_age",
    "ap_chronic"
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);

    if (!el || el.value === "") {
      setHTML(
        "resultadoAPACHE2",
        "<strong>APACHE II:</strong> Complete todas las variables"
      );
      return;
    }

    total += Number(el.value);
  }

  let riesgo =
    total < 10 ? "Bajo"
    : total < 20 ? "Moderado"
    : total < 30 ? "Alto"
    : "Muy alto";

  setHTML(
    "resultadoAPACHE2",
    `<strong>APACHE II total:</strong> ${total}<br>
     <strong>Riesgo estimado:</strong> ${riesgo}`
  );

  if (typeof trackEvent === "function") {
    trackEvent("calculate_apache2_score", { apache2_score: total });
  }
}

/* =========================
   SAPS II
========================= */
function calcularSAPS2() {
  const ids = [
    "saps_age",
    "saps_hr",
    "saps_map",
    "saps_temp",
    "saps_gcs"
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);

    if (!el || el.value === "") {
      setHTML(
        "resultadoSAPS2",
        "<strong>SAPS II:</strong> Complete todas las variables"
      );
      return;
    }

    total += Number(el.value);
  }

  let riesgo =
    total < 30 ? "Bajo"
    : total < 50 ? "Moderado"
    : "Alto";

  setHTML(
    "resultadoSAPS2",
    `<strong>SAPS II total:</strong> ${total}<br>
     <strong>Riesgo estimado:</strong> ${riesgo}`
  );

  if (typeof trackEvent === "function") {
    trackEvent("calculate_saps2_score", { saps2_score: total });
  }
}

/* =========================
   EXPONER FUNCIONES
========================= */
window.calcularSOFA2 = calcularSOFA2;
window.calcularAPACHE2 = calcularAPACHE2;
window.calcularSAPS2 = calcularSAPS2;
