// =========================================================
// FARMACOTECA UCI – CORE JS
// Cálculo automático de infusiones (sin botones)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // =====================================================
  // Toggle ficha clínica
  // =====================================================
document.addEventListener("DOMContentLoaded", () => {

  // Toggle ficha
  document.querySelectorAll(".toggle-sheet").forEach(btn => {
    btn.addEventListener("click", () => {
      const sheet = btn.closest(".drug-card").querySelector(".drug-sheet");
      const expanded = btn.getAttribute("aria-expanded") === "true";

      btn.setAttribute("aria-expanded", !expanded);
      sheet.classList.toggle("hidden");
      btn.textContent = expanded ? "Ver ficha" : "Ocultar ficha";
    });
  });

  // Diluciones disponibles
  const diluciones = {
    "4-250": { mg: 4, ml: 250 },
    "8-100": { mg: 8, ml: 100 },
    "20-250": { mg: 20, ml: 250 }
  };

  document.querySelectorAll(".drug-card").forEach(card => {

    const dilucionSelect = card.querySelector(".dilucion");
    const pesoInput = card.querySelector(".peso");
    const velocidadInput = card.querySelector(".velocidad");
    const concentracionEl = card.querySelector(".concentracion");
    const resultadoEl = card.querySelector(".resultado");

    let concentracion = null; // mcg/ml

    function calcular() {
      const peso = parseFloat(pesoInput.value);
      const velocidad = parseFloat(velocidadInput.value);

      if (!concentracion || !peso || !velocidad) {
        resultadoEl.textContent = "—";
        return;
      }

      const gammas = (velocidad * concentracion) / (peso * 60);
      resultadoEl.textContent = `${gammas.toFixed(3)} mcg/kg/min`;
    }

    // Cambio de dilución
    dilucionSelect.addEventListener("change", () => {
      const config = diluciones[dilucionSelect.value];

      if (!config) {
        concentracion = null;
        concentracionEl.textContent = "—";
        calcular();
        return;
      }

      concentracion = (config.mg * 1000) / config.ml;
      concentracionEl.textContent = `${concentracion.toFixed(1)} mcg/ml`;
      calcular();
    });

    pesoInput.addEventListener("input", calcular);
    velocidadInput.addEventListener("input", calcular);
  });
});

