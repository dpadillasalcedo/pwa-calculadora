/* =========================
   UTILIDADES
========================= */
function val(id){
  const el = document.getElementById(id);
  return el && el.value !== "" ? Number(el.value) : null;
}

function reset(ids, resultId){
  ids.forEach(id => document.getElementById(id).selectedIndex = 0);
  document.getElementById(resultId).textContent = "";
}

/* =========================
   SOFA-2
========================= */
function calcSOFA(){
  const ids = [
    "sofa_neuro",
    "sofa_resp",
    "sofa_cardio",
    "sofa_liver",
    "sofa_renal",
    "sofa_hemo"
  ];

  let total = 0;

  for (let id of ids){
    const v = val(id);
    if (v === null){
      sofa_result.textContent = "⚠️ Complete todas las variables para calcular SOFA-2";
      return;
    }
    total += v;
  }

  let mortalidad = "";
  if (total <= 1) mortalidad = "< 5 %";
  else if (total <= 3) mortalidad = "5–10 %";
  else if (total <= 5) mortalidad = "10–20 %";
  else if (total <= 9) mortalidad = "20–40 %";
  else if (total <= 12) mortalidad = "40–60 %";
  else mortalidad = "> 60 %";

  sofa_result.textContent =
    `SOFA-2 total: ${total} puntos · Mortalidad estimada: ${mortalidad}`;
}

function resetSOFA(){
  reset(
    ["sofa_neuro","sofa_resp","sofa_cardio","sofa_liver","sofa_renal","sofa_hemo"],
    "sofa_result"
  );
}

/* =========================
   APACHE II
========================= */
function calcAPACHE(){
  const ids = [
    "ap_temp","ap_map","ap_hr","ap_rr","ap_oxygen","ap_ph",
    "ap_na","ap_k","ap_cr","ap_hct","ap_wbc","ap_gcs",
    "ap_age","ap_chronic"
  ];

  let total = 0;

  for (let id of ids){
    const v = val(id);
    if (v === null){
      apache_result.textContent = "⚠️ Complete todas las variables para calcular APACHE II";
      return;
    }
    total += v;
  }

  let interpretacion = "";
  if (total < 10) interpretacion = "Gravedad leve · Mortalidad < 10 %";
  else if (total < 20) interpretacion = "Gravedad moderada · Mortalidad 10–25 %";
  else if (total < 30) interpretacion = "Gravedad grave · Mortalidad 30–50 %";
  else interpretacion = "Gravedad crítica · Mortalidad > 60 %";

  apache_result.textContent =
    `APACHE II total: ${total} puntos · ${interpretacion}`;
}

function resetAPACHE(){
  reset(
    ["ap_temp","ap_map","ap_hr","ap_rr","ap_oxygen","ap_ph","ap_na","ap_k",
     "ap_cr","ap_hct","ap_wbc","ap_gcs","ap_age","ap_chronic"],
    "apache_result"
  );
}

/* =========================
   SAPS II
========================= */
function calcSAPS(){
  const ids = [
    "saps_age","saps_hr","saps_sys","saps_temp","saps_gcs","saps_uo",
    "saps_bun","saps_wbc","saps_k","saps_na","saps_hco3",
    "saps_bili","saps_adm"
  ];

  let total = 0;

  for (let id of ids){
    const v = val(id);
    if (v === null){
      saps_result.textContent = "⚠️ Complete todas las variables para calcular SAPS II";
      return;
    }
    total += v;
  }

  let riesgo = "";
  if (total < 20) riesgo = "Riesgo bajo · Mortalidad < 10 %";
  else if (total < 40) riesgo = "Riesgo intermedio · Mortalidad 10–30 %";
  else if (total < 60) riesgo = "Riesgo alto · Mortalidad 30–60 %";
  else riesgo = "Riesgo muy alto · Mortalidad > 60 %";

  saps_result.textContent =
    `SAPS II total: ${total} puntos · ${riesgo}`;
}

function resetSAPS(){
  reset(
    ["saps_age","saps_hr","saps_sys","saps_temp","saps_gcs","saps_uo",
     "saps_bun","saps_wbc","saps_k","saps_na","saps_hco3",
     "saps_bili","saps_adm"],
    "saps_result"
  );
}
