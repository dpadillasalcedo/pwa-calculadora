<script>
/* =========================================================
   UTILIDADES
========================================================= */
function val(id) {
  const el = document.getElementById(id);
  return el && el.value !== "" ? Number(el.value) : null;
}

function reset(ids, resultId) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });
  const res = document.getElementById(resultId);
  if (res) res.textContent = "";
}

/* =========================================================
   SOFA-2
   Mortalidad aproximada basada en score total
========================================================= */
function calcSOFA() {
  const ids = [
    "sofa_neuro",
    "sofa_resp",
    "sofa_cardio",
    "sofa_liver",
    "sofa_renal",
    "sofa_hemo"
  ];

  let total = 0;

  for (const id of ids) {
    const v = val(id);
    if (v === null) {
      document.getElementById("sofa_result").textContent =
        "⚠️ Complete todas las variables para calcular SOFA-2.";
      return;
    }
    total += v;
  }

  let riesgo = "";
  let mortalidad = "";

  if (total <= 1) {
    riesgo = "Riesgo muy bajo";
    mortalidad = "< 5 %";
  } else if (total <= 3) {
    riesgo = "Disfunción orgánica leve";
    mortalidad = "5–10 %";
  } else if (total <= 5) {
    riesgo = "Disfunción orgánica moderada";
    mortalidad = "10–20 %";
  } else if (total <= 9) {
    riesgo = "Disfunción orgánica severa";
    mortalidad = "20–40 %";
  } else if (total <= 12) {
    riesgo = "Falla multiorgánica";
    mortalidad = "40–60 %";
  } else {
    riesgo = "Falla multiorgánica crítica";
    mortalidad = "> 60 %";
  }

  document.getElementById("sofa_result").textContent =
    `SOFA-2 total: ${total} puntos · ${riesgo} · Mortalidad estimada: ${mortalidad}`;
}

function resetSOFA() {
  reset(
    ["sofa_neuro", "sofa_resp", "sofa_cardio", "sofa_liver", "sofa_renal", "sofa_hemo"],
    "sofa_result"
  );
}

/* =========================================================
   APACHE II
   Mortalidad aproximada (% hospitalaria)
========================================================= */
function calcAPACHE() {
  const ids = [
    "ap_temp", "ap_map", "ap_hr", "ap_rr", "ap_oxygen", "ap_ph",
    "ap_na", "ap_k", "ap_cr", "ap_hct", "ap_wbc", "ap_gcs",
    "ap_age", "ap_chronic"
  ];

  let total = 0;

  for (const id of ids) {
    const v = val(id);
    if (v === null) {
      document.getElementById("apache_result").textContent =
        "⚠️ Complete todas las variables para calcular APACHE II.";
      return;
    }
    total += v;
  }

  let riesgo = "";
  let mortalidad = "";

  if (total < 10) {
    riesgo = "Gravedad leve";
    mortalidad = "< 10 %";
  } else if (total < 20) {
    riesgo = "Gravedad moderada";
    mortalidad = "10–25 %";
  } else if (total < 30) {
    riesgo = "Gravedad alta";
    mortalidad = "30–50 %";
  } else {
    riesgo = "Gravedad crítica";
    mortalidad = "> 60 %";
  }

  document.getElementById("apache_result").textContent =
    `APACHE II total: ${total} puntos · ${riesgo} · Mortalidad estimada: ${mortalidad}`;
}

function resetAPACHE() {
  reset(
    [
      "ap_temp", "ap_map", "ap_hr", "ap_rr", "ap_oxygen", "ap_ph",
      "ap_na", "ap_k", "ap_cr", "ap_hct", "ap_wbc", "ap_gcs",
      "ap_age", "ap_chronic"
    ],
    "apache_result"
  );
}

/* =========================================================
   SAPS II
   Mortalidad aproximada (% hospitalaria)
========================================================= */
function calcSAPS() {
  const ids = [
    "saps_age", "saps_hr", "saps_sys", "saps_temp", "saps_gcs", "saps_uo",
    "saps_bun", "saps_wbc", "saps_k", "saps_na", "saps_hco3",
    "saps_bili", "saps_adm"
  ];

  let total = 0;

  for (const id of ids) {
    const v = val(id);
    if (v === null) {
      document.getElementById("saps_result").textContent =
        "⚠️ Complete todas las variables para calcular SAPS II.";
      return;
    }
    total += v;
  }

  let riesgo = "";
  let mortalidad = "";

  if (total < 20) {
    riesgo = "Riesgo bajo";
    mortalidad = "< 10 %";
  } else if (total < 40) {
    riesgo = "Riesgo intermedio";
    mortalidad = "10–30 %";
  } else if (total < 60) {
    riesgo = "Riesgo alto";
    mortalidad = "30–60 %";
  } else {
    riesgo = "Riesgo muy alto";
    mortalidad = "> 60 %";
  }

  document.getElementById("saps_result").textContent =
    `SAPS II total: ${total} puntos · ${riesgo} · Mortalidad estimada: ${mortalidad}`;
}

function resetSAPS() {
  reset(
    [
      "saps_age", "saps_hr", "saps_sys", "saps_temp", "saps_gcs", "saps_uo",
      "saps_bun", "saps_wbc", "saps_k", "saps_na", "saps_hco3",
      "saps_bili", "saps_adm"
    ],
    "saps_result"
  );
}
</script>
