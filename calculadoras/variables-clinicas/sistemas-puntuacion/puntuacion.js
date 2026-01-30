/* =====================================================
   SOFA-2
===================================================== */
function calcSOFA() {
  const campos = [
    "sofa_neuro",
    "sofa_resp",
    "sofa_cardio",
    "sofa_liver",
    "sofa_renal",
    "sofa_hemo"
  ];

  let total = 0;
  campos.forEach(id => {
    total += Number(document.getElementById(id).value);
  });

  let interpretacion = "";
  if (total <= 5) interpretacion = "Disfunción orgánica leve";
  else if (total <= 9) interpretacion = "Disfunción orgánica moderada";
  else if (total <= 12) interpretacion = "Disfunción orgánica severa";
  else interpretacion = "Alto riesgo de mortalidad";

  document.getElementById("sofa_result").textContent =
    `SOFA-2 total: ${total} puntos`;
  document.getElementById("interpretacionSOFA")?.remove();
}



/* =====================================================
   APACHE II
   (estructura completa + interpretación)
===================================================== */
function calcAPACHE() {
  const fisio = Number(document.getElementById("apache_phys").value);
  const edad = Number(document.getElementById("apache_age").value);
  const cronica = Number(document.getElementById("apache_chronic").value);

  const total = fisio + edad + cronica;

  let interpretacion = "";
  if (total < 10) {
    interpretacion = "Gravedad baja · Mortalidad estimada < 10%";
  } else if (total < 20) {
    interpretacion = "Gravedad moderada · Mortalidad estimada 10–30%";
  } else if (total < 30) {
    interpretacion = "Gravedad alta · Mortalidad estimada 30–60%";
  } else {
    interpretacion = "Gravedad extrema · Mortalidad estimada > 60%";
  }

  document.getElementById("apache_result").textContent =
    `APACHE II total: ${total} puntos`;
  document.getElementById("interpretacionAPACHE").textContent =
    interpretacion;
}



/* =====================================================
   SAPS II
   (estructura completa + interpretación)
===================================================== */
function calcSAPS() {
  const fisio = Number(document.getElementById("saps_phys").value);
  const edad = Number(document.getElementById("saps_age").value);
  const ingreso = Number(document.getElementById("saps_adm").value);

  const total = fisio + edad + ingreso;

  let interpretacion = "";
  if (total < 20) {
    interpretacion = "Riesgo bajo · Mortalidad estimada < 10%";
  } else if (total < 40) {
    interpretacion = "Riesgo intermedio · Mortalidad estimada 10–30%";
  } else if (total < 60) {
    interpretacion = "Riesgo alto · Mortalidad estimada 30–60%";
  } else {
    interpretacion = "Riesgo muy alto · Mortalidad estimada > 60%";
  }

  document.getElementById("saps_result").textContent =
    `SAPS II total: ${total} puntos`;
  document.getElementById("interpretacionSAPS").textContent =
    interpretacion;
}
