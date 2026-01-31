/* =========================================================
   UTILIDADES
========================================================= */
function sumBySelector(selector){
  let t = 0;
  document.querySelectorAll(selector).forEach(el=>{
    t += Number(el.value ?? 0);
  });
  return t;
}

function resetBySelector(selector){
  document.querySelectorAll(selector).forEach(el=>{
    // vuelve al primer option (placeholder o "0")
    el.selectedIndex = 0;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

/* =========================================================
   SOFA-2
========================================================= */
function calcSOFA(e){
  // Evita submit/recarga si el botón está dentro de un form
  if (e) e.preventDefault();

  const total = sumBySelector('.sofa');

  const res  = document.getElementById('sofa_result');
  const mort = document.getElementById('sofa_mortality');

  if (!res || !mort){
    console.error('Faltan elementos #sofa_result o #sofa_mortality en el HTML');
    return;
  }

  res.textContent = `SOFA-2 total: ${total}`;

  mort.textContent =
    total <= 1  ? 'Mortalidad estimada <10%' :
    total <= 5  ? 'Mortalidad estimada 10–20%' :
    total <= 9  ? 'Mortalidad estimada 20–40%' :
    total <= 12 ? 'Mortalidad estimada 40–50%' :
                  'Mortalidad estimada >50–90%';
}

function resetSOFA(e){
  if (e) e.preventDefault();

  resetBySelector('.sofa');

  const res  = document.getElementById('sofa_result');
  const mort = document.getElementById('sofa_mortality');

  if (res)  res.textContent = '';
  if (mort) mort.textContent = '';
}

/* =========================================================
   BINDING AUTOMÁTICO (para que los botones funcionen sin onclick)
   Requiere:
   - botón calcular: id="btn_calc_sofa"
   - botón reiniciar: id="btn_reset_sofa"
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const btnCalc  = document.getElementById('btn_calc_sofa');
  const btnReset = document.getElementById('btn_reset_sofa');

  if (btnCalc)  btnCalc.addEventListener('click', calcSOFA);
  if (btnReset) btnReset.addEventListener('click', resetSOFA);
});


/* =========================================================
   UTILIDADES GENERALES
========================================================= */
function sumBySelector(selector){
  let total = 0;
  document.querySelectorAll(selector).forEach(el => {
    total += Number(el.value || 0);
  });
  return total;
}

function resetBySelector(selector){
  document.querySelectorAll(selector).forEach(el => {
    el.selectedIndex = 0;
  });
}

/* =========================================================
   APACHE II
   - APS = suma de las 12 variables fisiológicas (.apache)
   - Total = APS + edad + enfermedad crónica
========================================================= */
function calcAPACHE(){
  const aps = sumBySelector('.apache');

  const ageEl = document.getElementById('apache_age');
  const chronicEl = document.getElementById('apache_chronic');

  const age = ageEl ? Number(ageEl.value) : 0;
  const chronic = chronicEl ? Number(chronicEl.value) : 0;

  const total = aps + age + chronic;

  const res = document.getElementById('apache_result');
  const mort = document.getElementById('apache_mortality');

  if (!res || !mort) {
    console.error('Faltan elementos #apache_result o #apache_mortality');
    return;
  }

  res.textContent = `APACHE II total: ${total} (APS: ${aps})`;

  // Mortalidad orientativa clásica (no predictiva individual)
  mort.textContent =
    total < 10 ? 'Mortalidad estimada <10%' :
    total < 20 ? 'Mortalidad estimada 15–25%' :
    total < 30 ? 'Mortalidad estimada 40–55%' :
                 'Mortalidad estimada >75%';
}

/* =========================================================
   RESET APACHE II
========================================================= */
function resetAPACHE(){
  resetBySelector('.apache');

  const ageEl = document.getElementById('apache_age');
  const chronicEl = document.getElementById('apache_chronic');

  if (ageEl) ageEl.selectedIndex = 0;
  if (chronicEl) chronicEl.selectedIndex = 0;

  const res = document.getElementById('apache_result');
  const mort = document.getElementById('apache_mortality');

  if (res) res.textContent = '';
  if (mort) mort.textContent = '';
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
