/* =========================================================
   UTILIDADES
========================================================= */
function sumBySelector(selector){
  let t = 0;
  document.querySelectorAll(selector).forEach(el=>{
    t += Number(el.value || 0);
  });
  return t;
}

function resetBySelector(selector){
  document.querySelectorAll(selector).forEach(el=>{
    el.selectedIndex = 0;
  });
}

/* =========================================================
   SOFA-2 (6 sistemas) — TABLA OFICIAL
   HTML esperado:
   <select class="sofa"> con valores 0–4 para:
   - Neuro
   - Resp
   - CV
   - Hepático
   - Renal
   - Hemostasia
========================================================= */
function calcSOFA(){
  const total = sumBySelector('.sofa');

  const res = document.getElementById('sofa_result');
  const mort = document.getElementById('sofa_mortality');

  res.textContent = `SOFA-2 total: ${total}`;

  mort.textContent =
    total <= 1  ? 'Mortalidad estimada <10%' :
    total <= 5  ? 'Mortalidad estimada 10–20%' :
    total <= 9  ? 'Mortalidad estimada 20–40%' :
    total <= 12 ? 'Mortalidad estimada 40–50%' :
                  'Mortalidad estimada >50–90%';
}

function resetSOFA(){
  resetBySelector('.sofa');
  document.getElementById('sofa_result').textContent = '';
  document.getElementById('sofa_mortality').textContent = '';
}

/* =========================================================
   APACHE II — COMPLETO
   12 VARIABLES FISIOLÓGICAS (APS) + EDAD + COMORBILIDAD

   HTML esperado (todos <select> con puntaje ya calculado):
   Fisiológicas (12):
   - #ap_temp
   - #ap_map
   - #ap_hr
   - #ap_rr
   - #ap_ox (PaO2 o A–a según FiO2)
   - #ap_ph
   - #ap_na
   - #ap_k
   - #ap_crea (ya considera ARF x2 si aplica)
   - #ap_hct
   - #ap_wbc
   - #ap_gcs (usar 15 − GCS real)

   Otros:
   - #ap_age
   - #ap_chronic
========================================================= */
function calcAPACHE(){
  const aps =
    Number(ap_temp.value) +
    Number(ap_map.value) +
    Number(ap_hr.value) +
    Number(ap_rr.value) +
    Number(ap_ox.value) +
    Number(ap_ph.value) +
    Number(ap_na.value) +
    Number(ap_k.value) +
    Number(ap_crea.value) +
    Number(ap_hct.value) +
    Number(ap_wbc.value) +
    Number(ap_gcs.value);

  const age = Number(ap_age.value);
  const chronic = Number(ap_chronic.value);

  const total = aps + age + chronic;

  document.getElementById('apache_result').textContent =
    `APACHE II total: ${total}`;

  document.getElementById('apache_mortality').textContent =
    total < 10 ? 'Mortalidad aproximada ~5%' :
    total < 20 ? 'Mortalidad aproximada ~15%' :
    total < 30 ? 'Mortalidad aproximada ~35%' :
                 'Mortalidad aproximada >50%';
}

function resetAPACHE(){
  resetBySelector('#ap_temp, #ap_map, #ap_hr, #ap_rr, #ap_ox, #ap_ph, #ap_na, #ap_k, #ap_crea, #ap_hct, #ap_wbc, #ap_gcs, #ap_age, #ap_chronic');
  document.getElementById('apache_result').textContent = '';
  document.getElementById('apache_mortality').textContent = '';
}

/* =========================================================
   SAPS II — COMPLETO (17 VARIABLES)
   HTML esperado: <select> con el puntaje SAPS de cada variable

   IDs esperados:
   - s_age
   - s_hr
   - s_sbp
   - s_temp
   - s_gcs
   - s_pafi
   - s_urine
   - s_urea
   - s_wbc
   - s_k
   - s_na
   - s_hco3
   - s_bili
   - s_admission
   - s_chronic
   - s_aids
   - s_cancer
========================================================= */
function calcSAPS(){
  const score =
    Number(s_age.value) +
    Number(s_hr.value) +
    Number(s_sbp.value) +
    Number(s_temp.value) +
    Number(s_gcs.value) +
    Number(s_pafi.value) +
    Number(s_urine.value) +
    Number(s_urea.value) +
    Number(s_wbc.value) +
    Number(s_k.value) +
    Number(s_na.value) +
    Number(s_hco3.value) +
    Number(s_bili.value) +
    Number(s_admission.value) +
    Number(s_chronic.value) +
    Number(s_aids.value) +
    Number(s_cancer.value);

  // Fórmula logística oficial SAPS II
  const logit = -7.7631 + (0.0737 * score);
  const mortality = (Math.exp(logit) / (1 + Math.exp(logit))) * 100;

  document.getElementById('saps_result').textContent =
    `SAPS II total: ${score}`;

  document.getElementById('saps_mortality').textContent =
    `Mortalidad estimada: ${mortality.toFixed(1)}%`;
}

function resetSAPS(){
  resetBySelector('#s_age, #s_hr, #s_sbp, #s_temp, #s_gcs, #s_pafi, #s_urine, #s_urea, #s_wbc, #s_k, #s_na, #s_hco3, #s_bili, #s_admission, #s_chronic, #s_aids, #s_cancer');
  document.getElementById('saps_result').textContent = '';
  document.getElementById('saps_mortality').textContent = '';
}
