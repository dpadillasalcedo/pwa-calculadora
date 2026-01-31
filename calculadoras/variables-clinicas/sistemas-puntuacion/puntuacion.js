/* =========================================================
   UTILIDADES COMUNES
========================================================= */
function sumBySelector(selector){
  let total = 0;
  document.querySelectorAll(selector).forEach(el => {
    if (el.value !== "") {
      total += Number(el.value);
    }
  });
  return total;
}

function resetBySelector(selector){
  document.querySelectorAll(selector).forEach(el => {
    el.selectedIndex = 0;
  });
}
/* =========================================================
   SOFA-2
========================================================= */
function calcSOFA(){
  const total = sumBySelector('.sofa');

  const res  = document.getElementById('sofa_result');
  const mort = document.getElementById('sofa_mortality');

  if (!res || !mort) return;

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

<script>
/* =========================================================
   UTILIDADES COMUNES (OBLIGATORIAS)
========================================================= */
function sumBySelector(selector){
  let total = 0;
  document.querySelectorAll(selector).forEach(el => {
    if (el.value !== "") {
      total += Number(el.value);
    }
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
========================================================= */
function calcAPACHE(){
  const aps = sumBySelector('.apache');

  const ageEl = document.getElementById('apache_age');
  const age = ageEl ? Number(ageEl.value || 0) : 0;

  const chronicEl = document.getElementById('apache_chronic');
  const chronic = chronicEl ? Number(chronicEl.value || 0) : 0;

  const total = aps + age + chronic;

  document.getElementById('apache_result').textContent =
    `APACHE II total: ${total} (APS: ${aps})`;

  document.getElementById('apache_mortality').textContent =
    total < 10 ? 'Mortalidad estimada <10%' :
    total < 20 ? 'Mortalidad estimada 15–25%' :
    total < 30 ? 'Mortalidad estimada 40–55%' :
                 'Mortalidad estimada >75%';
}

function resetAPACHE(){
  resetBySelector('.apache');
  document.getElementById('apache_age').selectedIndex = 0;
  document.getElementById('apache_chronic').selectedIndex = 0;
  document.getElementById('apache_result').textContent = '';
  document.getElementById('apache_mortality').textContent = '';
}

/* =========================================================
   SAPS II
========================================================= */
function calcSAPS(){
  const score = sumBySelector('.saps');

  document.getElementById('saps_result').textContent =
    `SAPS II total: ${score}`;

  const logit = (score - 32.6659) / 7.3068;
  const mortality = 100 / (1 + Math.exp(-logit));

  document.getElementById('saps_mortality').textContent =
    `Mortalidad hospitalaria estimada: ${mortality.toFixed(1)}%`;
}

function resetSAPS(){
  resetBySelector('.saps');
  document.getElementById('saps_result').textContent = '';
  document.getElementById('saps_mortality').textContent = '';
}

