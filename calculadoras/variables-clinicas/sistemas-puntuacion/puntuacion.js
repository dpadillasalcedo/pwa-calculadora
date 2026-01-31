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
   UTILIDAD
========================================================= */
function sumBySelector(selector){
  let total = 0;
  document.querySelectorAll(selector).forEach(el=>{
    total += Number(el.value || 0);
  });
  return total;
}

/* =========================================================
   SAPS II
========================================================= */
function calcSAPS(){
  const score = sumBySelector('.saps');

  const res = document.getElementById('saps_result');
  const mort = document.getElementById('saps_mortality');

  res.textContent = `SAPS II total: ${score}`;

  // Fórmula logística SAPS II original
  const logit = (score - 32.6659) / 7.3068;
  const mortality = 100 / (1 + Math.exp(-logit));

  mort.textContent =
    `Mortalidad hospitalaria estimada: ${mortality.toFixed(1)}%`;
}

function resetSAPS(){
  document.querySelectorAll('.saps').forEach(el=>{
    el.selectedIndex = 0;
  });

  document.getElementById('saps_result').textContent = '';
  document.getElementById('saps_mortality').textContent = '';
}

