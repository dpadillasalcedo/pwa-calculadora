<script>
/* ===============================
   FUNCIÓN GENÉRICA DE SUMA
================================ */
function sumClass(className){
  let total = 0;

  document.querySelectorAll("." + className).forEach(el => {
    if (el.value !== "") {
      total += Number(el.value);
    }
  });

  return total;
}

/* ===============================
   SOFA-2
================================ */
function calcSOFA(){
  const total = sumClass("sofa");

  document.getElementById("sofa_result").textContent =
    "SOFA-2 total: " + total;
}

function resetSOFA(){
  document.querySelectorAll(".sofa").forEach(el => {
    el.value = "";
  });

  document.getElementById("sofa_result").textContent = "";
}

/* ===============================
   APACHE II
================================ */
function calcAPACHE(){
  const total = sumClass("apache");

  document.getElementById("apache_result").textContent =
    "APACHE II total: " + total;

  let interpretacion = "";

  if (total < 10) {
    interpretacion = "Severidad baja";
  } else if (total < 20) {
    interpretacion = "Severidad moderada";
  } else if (total < 30) {
    interpretacion = "Severidad alta";
  } else {
    interpretacion = "Severidad muy alta";
  }

  document.getElementById("apache_note").textContent = interpretacion;
}

function resetAPACHE(){
  document.querySelectorAll(".apache").forEach(el => {
    el.value = "";
  });

  document.getElementById("apache_result").textContent = "";
  document.getElementById("apache_note").textContent = "";
}

/* ===============================
   SAPS II
================================ */
function calcSAPS(){
  const total = sumClass("saps");

  document.getElementById("saps_result").textContent =
    "SAPS II total: " + total;
}

function resetSAPS(){
  document.querySelectorAll(".saps").forEach(el => {
    el.value = "";
  });

  document.getElementById("saps_result").textContent = "";
}
</script>
