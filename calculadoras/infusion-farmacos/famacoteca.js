console.log("farmacoteca.js activo");

document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("dilucion")) return;

  const card = e.target.closest(".drug-card");
  if (!card) return;

  const opt = e.target.selectedOptions[0];
  const conc = parseFloat(opt?.dataset?.mcgPerMl);

  const concEl = card.querySelector(".concentracion");
  const resEl = card.querySelector(".resultado");

  if (!Number.isFinite(conc)) {
    concEl.textContent = "—";
    resEl.textContent = "—";
    return;
  }

  concEl.textContent = `${conc.toFixed(1)} mcg/ml`;
  calcular(card);
});

document.addEventListener("input", function (e) {
  if (!e.target.classList.contains("peso") && !e.target.classList.contains("velocidad")) return;

  const card = e.target.closest(".drug-card");
  if (!card) return;

  calcular(card);
});

function calcular(card) {
  const conc = parseFloat(
    card.querySelector(".dilucion")?.selectedOptions[0]?.dataset?.mcgPerMl
  );
  const peso = parseFloat(card.querySelector(".peso")?.value);
  const velocidad = parseFloat(card.querySelector(".velocidad")?.value);
  const resEl = card.querySelector(".resultado");

  if (
    !Number.isFinite(conc) ||
    !Number.isFinite(peso) || peso <= 0 ||
    !Number.isFinite(velocidad) || velocidad <= 0
  ) {
    resEl.textContent = "—";
    return;
  }

  // mcg/kg/min = (ml/h * mcg/ml) / (kg * 60)
  const gammas = (velocidad * conc) / (peso * 60);
  resEl.textContent = `${gammas.toFixed(3)} mcg/kg/min`;
}

// Toggle ficha
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".toggle-sheet");
  if (!btn) return;

  const card = btn.closest(".drug-card");
  const sheet = card.querySelector(".drug-sheet");

  const expanded = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!expanded));
  sheet.classList.toggle("hidden");
  btn.textContent = expanded ? "Ver ficha" : "Ocultar ficha";
});
