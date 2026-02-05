document.addEventListener("DOMContentLoaded", function () {

  // =========================
  // Toggle ficha
  // =========================
  document.querySelectorAll(".toggle-sheet").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".drug-card");
      const sheet = card.querySelector(".drug-sheet");
      const expanded = btn.getAttribute("aria-expanded") === "true";

      btn.setAttribute("aria-expanded", String(!expanded));
      sheet.classList.toggle("hidden");
      btn.textContent = expanded ? "Ver ficha" : "Ocultar ficha";
    });
  });

  // =========================
  // Diluciones (mcg/ml)
  // =========================
  const diluciones = {
    "4-250": { mg: 4, ml: 250 },
    "8-100": { mg: 8, ml: 100 },
    "20-250": { mg: 20, ml: 250 }
  };

  // =========================
  // Lógica por ficha
  // =========================
  document.querySelectorAll(".drug-card").forEach(card => {

    const dilucionSelect = card.querySelector(".dilucion");
    const pesoInput = card.querySelector(".peso");
    const velocidadInput = card.querySelector(".velocidad");
    const concEl = card.querySelector(".concentracion");
    const resultadoEl = card.querySelector(".resultado");

    let concentracion = null; // mcg/ml

    function calcular() {
      const peso = parseFloat(pesoInput.value);
      const velocidad = parseFloat(velocidadInput.value);

      if (!concentracion || peso <= 0 || velocidad <= 0) {
        resultadoEl.textContent = "—";
        return;
      }

      const gammas = (velocidad * concentracion) / (peso * 60);
      resultadoEl.textContent = `${gammas.toFixed(3)} mcg/kg/min`;
    }

    // 👉 Cambio de dilución
    dilucionSelect.addEventListener("change", () => {
      const value = dilucionSelect.value;

      if (!diluciones[value]) {
        concentracion = null;
