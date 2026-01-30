function calcularSOFA() {
  const total =
    +sofa_resp.value +
    +sofa_neuro.value +
    +sofa_cardio.value +
    +sofa_coag.value +
    +sofa_hep.value +
    +sofa_renal.value;

  let mort, msg;
  if (total <= 1) { mort = "<5%"; msg = "Riesgo bajo"; }
  else if (total <= 4) { mort = "5–10%"; msg = "Disfunción leve"; }
  else if (total <= 8) { mort = "15–25%"; msg = "Disfunción moderada"; }
  else if (total <= 12) { mort = "40–50%"; msg = "Falla orgánica severa"; }
  else { mort = ">80%"; msg = "Falla multiorgánica"; }

  resultadoSOFA.innerHTML = `SOFA-2 total: <strong>${total}</strong>`;
  interpretacionSOFA.innerHTML = `Mortalidad estimada: <strong>${mort}</strong><br>${msg}`;
}

function calcularAPACHE() {
  const total =
    +apache_phys.value +
    +apache_age.value +
    +apache_chronic.value;

  let mort;
  if (total < 10) mort = "<10%";
  else if (total < 20) mort = "15–25%";
  else if (total < 30) mort = "40–55%";
  else mort = ">75%";

  resultadoAPACHE.innerHTML = `APACHE II: <strong>${total}</strong>`;
  interpretacionAPACHE.innerHTML = `Mortalidad hospitalaria estimada: <strong>${mort}</strong>`;
}

function calcularSAPS() {
  const total =
    +saps_phys.value +
    +saps_age.value +
    +saps_adm.value;

  let mort;
  if (total < 30) mort = "<10%";
  else if (total < 40) mort = "10–25%";
  else if (total < 50) mort = "30–50%";
  else mort = ">75%";

  resultadoSAPS.innerHTML = `SAPS II: <strong>${total}</strong>`;
  interpretacionSAPS.innerHTML = `Mortalidad hospitalaria estimada: <strong>${mort}</strong>`;
}
