document.addEventListener("DOMContentLoaded", function () {

  const calcBtn = document.getElementById("nihss_calc");
  const resetBtn = document.getElementById("nihss_reset");

  const resultado = document.getElementById("resultadoNIHSS");
  const interpretacion = document.getElementById("interpretacionNIHSS");

  const campos = [
    "n_1a","n_1b","n_1c","n_2","n_3","n_4",
    "n_5a","n_5b","n_6a","n_6b",
    "n_7","n_8","n_9","n_10","n_11"
  ];

  function calcularNIHSS() {
    let total = 0;

    for (let id of campos) {
      const valor = document.getElementById(id).value;
      if (valor === "") {
        resultado.innerHTML = "⚠ Complete todos los campos";
        interpretacion.innerHTML = "";
        return;
      }
      total += parseInt(valor);
    }

    resultado.innerHTML = `NIHSS Total: ${total}`;

    let texto = "";

    if (total === 0) {
      texto = "Sin déficit neurológico clínicamente significativo.";
    } else if (total >= 1 && total <= 4) {
      texto = "ACV leve.";
    } else if (total >= 5 && total <= 15) {
      texto = "ACV moderado.";
    } else if (total >= 16 && total <= 20) {
      texto = "ACV moderado-severo.";
    } else {
      texto = "ACV severo.";
    }

    interpretacion.innerHTML = texto;
  }

  function resetNIHSS() {
    campos.forEach(id => {
      document.getElementById(id).value = "";
    });
    resultado.innerHTML = "";
    interpretacion.innerHTML = "";
  }

  calcBtn.addEventListener("click", calcularNIHSS);
  resetBtn.addEventListener("click", resetNIHSS);

});
