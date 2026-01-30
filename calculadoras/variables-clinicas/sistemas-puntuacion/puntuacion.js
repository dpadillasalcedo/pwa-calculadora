/* =====================================================
   UTILIDADES GENERALES
===================================================== */
function getValue(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  return Number(el.value);
}

function resetForm(ids, resultId) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });
  document.getElementById(resultId).textContent = "";
}

/* =====================================================
   SOFA (SIMPLIFICADO – CORREGIDO)
===================================================== */
function calcSOFA() {
  const variables = [
    "sofa_neuro",
    "sofa_resp",
    "sofa_cardio",
    "sofa_liver",
    "sofa_renal",
    "sofa_hemo"
  ];

  let total = 0;

  for (let id of variables) {
    const value = getValue(id);
    if (value === null) {
      document.getElementById("sofa_result").textContent =
        "⚠️ Complete todas las variables para calcular SOFA";
      return;
    }
    total += value;
  }

  document.getElementById("sofa_result").textContent =
    `SOFA total: ${total} puntos`;
}

function resetSOFA() {
  resetForm(
    [
      "sofa_neuro",
      "sofa_resp",
      "sofa_cardio",
      "sofa_liver",
      "sofa_renal",
      "sofa_hemo"
    ],
    "sofa_result"
  );
}

/* =====================================================
   APACHE II (COMPLETO)
   12 fisiológicas + edad + crónicos
===================================================== */
function calcAPACHE() {
  const variables = [
    "ap_temp",
    "ap_map",
    "ap_hr",
    "ap_rr",
    "ap_oxygen",
    "ap_ph",
    "ap_na",
    "ap_k",
    "ap_cr",
    "ap_hct",
    "ap_wbc",
    "ap_gcs",
    "ap_age",
    "ap_chronic"
  ];

  let total = 0;

  for (let id of variables) {
    const value = getValue(id);
    if (value === null) {
      document.getElementById("apache_result").textContent =
        "⚠️ Complete todas las variables para calcular APACHE II";
      return;
    }
    total += value;
  }

  document.getElementById("apache_result").textContent =
    `APACHE II total: ${total} puntos`;
}

function resetAPACHE() {
  resetForm(
    [
      "ap_temp",
      "ap_map",
      "ap_hr",
      "ap_rr",
      "ap_oxygen",
      "ap_ph",
      "ap_na",
      "ap_k",
      "ap_cr",
      "ap_hct",
      "ap_wbc",
      "ap_gcs",
      "ap_age",
      "ap_chronic"
    ],
    "apache_result"
  );
}

/* =====================================================
   SAPS II (COMPLETO)
===================================================== */
function calcSAPS() {
  const variables = [
    "saps_age",
    "saps_hr",
    "saps_sys",
    "saps_temp",
    "saps_gcs",
    "saps_uo",
    "saps_bun",
    "saps_wbc",
    "saps_k",
    "saps_na",
    "saps_hco3",
    "saps_bili",
    "saps_adm"
  ];

  let total = 0;

  for (let id of variables) {
    const value = getValue(id);
    if (value === null) {
      document.getElementById("saps_result").textContent =
        "⚠️ Complete todas las variables para calcular SAPS II";
      return;
    }
    total += value;
  }

  document.getElementById("saps_result").textContent =
    `SAPS II total: ${total} puntos`;
}

function resetSAPS() {
  resetForm(
    [
      "saps_age",
      "saps_hr",
      "saps_sys",
      "saps_temp",
      "saps_gcs",
      "saps_uo",
      "saps_bun",
      "saps_wbc",
      "saps_k",
      "saps_na",
      "saps_hco3",
      "saps_bili",
      "saps_adm"
    ],
    "saps_result"
  );
}
