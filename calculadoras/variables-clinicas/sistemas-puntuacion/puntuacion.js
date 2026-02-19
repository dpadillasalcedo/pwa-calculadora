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
function calcSOFA() {
  const selects = document.querySelectorAll(".sofa");
  let total = 0;
  let breakdown = [];

  selects.forEach(select => {
    const value = Number(select.value);
    if (isNaN(value) || value === 0) return;

    const label = select.closest("label").childNodes[0].textContent.trim();
    total += value;

    breakdown.push({
      system: label,
      points: value
    });
  });

  const result = document.getElementById("sofa_result");
  const mortality = document.getElementById("sofa_mortality");
  const detail = document.getElementById("sofa_breakdown");

  // Resultado total
  result.innerHTML = `<b>SOFA total:</b> ${total} puntos`;

  // Mortalidad orientativa
  let mortText = "";
  if (total === 0) mortText = "Sin disfunción orgánica.";
  else if (total <= 6) mortText = "Riesgo de mortalidad bajo–moderado.";
  else if (total <= 9) mortText = "Riesgo de mortalidad intermedio.";
  else if (total <= 12) mortText = "Riesgo de mortalidad alto.";
  else mortText = "Riesgo de mortalidad muy alto.";

  mortality.textContent = mortText;

  // Desglose clínico
  if (breakdown.length > 0) {
    let html = "<b>Desglose por sistemas comprometidos:</b><ul>";
    breakdown.forEach(item => {
      html += `<li>${item.system}: ${item.points} punto${item.points > 1 ? "s" : ""}</li>`;
    });
    html += "</ul>";

    detail.innerHTML = html;
    detail.style.display = "block";
  } else {
    detail.style.display = "none";
  }
}

function resetSOFA() {
  document.querySelectorAll(".sofa").forEach(select => {
    select.value = "";
  });

  document.getElementById("sofa_result").textContent = "";
  document.getElementById("sofa_mortality").textContent = "";
  document.getElementById("sofa_breakdown").style.display = "none";
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


/* =========================
   SOFA-1 (CLÁSICO)
========================= */

function calcSOFA1(){
  const total = sumBySelector('.sofa1');

  document.getElementById('sofa1_result').textContent =
    `SOFA-1 total: ${total}`;

  document.getElementById('sofa1_mortality').textContent =
    total <= 1  ? 'Mortalidad estimada <10%' :
    total <= 5  ? 'Mortalidad estimada 10–20%' :
    total <= 9  ? 'Mortalidad estimada 20–40%' :
    total <= 12 ? 'Mortalidad estimada 40–50%' :
                  'Mortalidad estimada >50–90%';
}

function resetSOFA1(){
  resetBySelector('.sofa1');
  document.getElementById('sofa1_result').textContent = '';
  document.getElementById('sofa1_mortality').textContent = '';
}
