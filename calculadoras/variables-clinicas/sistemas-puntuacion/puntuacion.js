function calcularSOFA2() {

  const total =
    Number(document.getElementById("sofa_neuro").value) +
    Number(document.getElementById("sofa_resp").value) +
    Number(document.getElementById("sofa_cardio").value) +
    Number(document.getElementById("sofa_liver").value) +
    Number(document.getElementById("sofa_renal").value) +
    Number(document.getElementById("sofa_hemo").value);

  let mortalidad, interpretacion;

  if (total <= 1) {
    mortalidad = "<5 %";
    interpretacion = "Función orgánica preservada o mínima disfunción.";
  } else if (total <= 4) {
    mortalidad = "5–10 %";
    interpretacion = "Disfunción orgánica leve.";
  } else if (total <= 8) {
    mortalidad = "15–25 %";
    interpretacion = "Disfunción orgánica moderada.";
  } else if (total <= 12) {
    mortalidad = "40–50 %";
    interpretacion = "Falla orgánica severa.";
  } else {
    mortalidad = ">80 %";
    interpretacion =
      "Falla multiorgánica. Riesgo extremadamente alto de mortalidad.";
  }

  document.getElementById("resultadoSOFA").innerHTML =
    `SOFA-2 total: <strong>${total}</strong>`;

  document.getElementById("interpretacionSOFA").innerHTML =
    `Mortalidad hospitalaria estimada: <strong>${mortalidad}</strong><br>${interpretacion}`;
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
