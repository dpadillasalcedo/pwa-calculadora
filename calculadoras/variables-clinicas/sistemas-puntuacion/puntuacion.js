function getValue(id) {
  const el = document.getElementById(id);
  return el.value === "" ? null : Number(el.value);
}

function resetSelects(ids, resultId) {
  ids.forEach(id => document.getElementById(id).selectedIndex = 0);
  document.getElementById(resultId).textContent = "";
}

/* ========= SOFA-2 ========= */
function calcSOFA() {
  const ids = ["sofa_neuro","sofa_resp","sofa_cardio","sofa_liver","sofa_renal","sofa_hemo"];
  let total = 0;

  for (let id of ids) {
    const v = getValue(id);
    if (v === null) {
      sofa_result.textContent = "⚠️ Complete todas las variables";
      return;
    }
    total += v;
  }
  sofa_result.textContent = `SOFA-2 total: ${total} puntos`;
}

function resetSOFA() {
  resetSelects(
    ["sofa_neuro","sofa_resp","sofa_cardio","sofa_liver","sofa_renal","sofa_hemo"],
    "sofa_result"
  );
}

/* ========= APACHE II ========= */
function calcAPACHE() {
  const ids = ["apache_phys","apache_age","apache_chronic"];
  let total = 0;

  for (let id of ids) {
    const v = getValue(id);
    if (v === null) {
      apache_result.textContent = "⚠️ Complete todas las variables";
      return;
    }
    total += v;
  }
  apache_result.textContent = `APACHE II total: ${total} puntos`;
}

function resetAPACHE() {
  resetSelects(
    ["apache_phys","apache_age","apache_chronic"],
    "apache_result"
  );
}

/* ========= SAPS II ========= */
function calcSAPS() {
  const ids = ["saps_phys","saps_age","saps_adm"];
  let total = 0;

  for (let id of ids) {
    const v = getValue(id);
    if (v === null) {
      saps_result.textContent = "⚠️ Complete todas las variables";
      return;
    }
    total += v;
  }
  saps_result.textContent = `SAPS II total: ${total} puntos`;
}

function resetSAPS() {
  resetSelects(
    ["saps_phys","saps_age","saps_adm"],
    "saps_result"
  );
}
