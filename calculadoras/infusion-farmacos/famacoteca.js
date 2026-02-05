(() => {
  // Diluciones disponibles
  const diluciones = {
    "4-250": { mg: 4, ml: 250 },
    "8-100": { mg: 8, ml: 100 },
    "20-250": { mg: 20, ml: 250 }
  };

  function toNum(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  }

  function calcForCard(card) {
    const dilucionSelect = card.querySelector(".dilucion");
    const concEl = card.querySelector(".concentracion");
    const pesoInput = card.querySelector(".peso");
    const velInput = card.querySelector(".velocidad");
    const resEl = card.querySelector(".resultado");

    if (!dilucionSelect || !concEl || !pesoInput || !velInput || !resEl) return;

    const cfg = diluciones[dilucionSelect.value];

    // 1) Concentración automática según dilución
    if (!cfg) {
      card.dataset.concentracion = "";
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    const concentracion = (cfg.mg * 1000) / cfg.ml; // mcg/ml
    card.dataset.concentracion = String(concentracion);
    concEl.textContent = `${concentracion.toFixed(1)} mcg/ml`;

    // 2) Dosis (gammas) automática según peso y ml/h
    const peso = toNum(pesoInput.value);
    const velocidad = toNum(velInput.value);

    if (!Number.isFinite(peso) || peso <= 0 || !Number.isFinite(velocidad) || velocidad <= 0) {
      resEl.textContent = "—";
      return;
    }

    // mcg/kg/min = (ml/h * mcg/ml) / (kg * 60)
    const gammas = (velocidad * concentracion) / (peso * 60);
    resEl.textContent = `${gammas.toFixed(3)} mcg/kg/min`;
  }

  // Toggle ficha (delegado)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-sheet");
    if (!btn) return;

    const card = btn.closest(".drug-card");
    if (!card) return;

    const sheet = card.querySelector(".drug-sheet");
    if (!sheet) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    sheet.classList.toggle("hidden");
    btn.textContent = expanded ? "Ver ficha" : "Ocultar ficha";
  });

  // Cambios de dilución (delegado)
  document.addEventListener("change", (e) => {
    if (!e.target.matches(".dilucion")) return;
    const card = e.target.closest(".drug-card");
    if (!card) return;
    calcForCard(card);
  });

  // Inputs peso / velocidad (delegado)
  document.addEventListener("input", (e) => {
    if (!e.target.matches(".peso, .velocidad")) return;
    const card = e.target.closest(".drug-card");
    if (!card) return;
    calcForCard(card);
  });

  // Inicializa fichas ya presentes (por si ya están en DOM)
  function initExisting() {
    document.querySelectorAll(".drug-card").forEach(card => calcForCard(card));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExisting);
  } else {
    initExisting();
  }
})();
