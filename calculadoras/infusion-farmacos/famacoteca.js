(() => {
  // Marca para verificar que el script cargó
  window.__drugCalcLoaded = true;

  // Convierte "1,5" a 1.5 y parsea a número
  function toNum(v) {
    if (typeof v !== "string") v = String(v ?? "");
    v = v.replace(",", ".").trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  }

  function calcForCard(card) {
    const sel = card.querySelector("select.dilucion");
    const concEl = card.querySelector(".concentracion");
    const pesoEl = card.querySelector("input.peso");
    const velEl = card.querySelector("input.velocidad");
    const resEl = card.querySelector(".resultado");

    // Si falta algo, no rompe (pero tampoco calcula)
    if (!sel || !concEl || !pesoEl || !velEl || !resEl) return;

    const opt = sel.options[sel.selectedIndex];
    const mg = toNum(opt?.dataset?.mg);
    const ml = toNum(opt?.dataset?.ml);

    // Si no hay dilución válida, limpiar
    if (!Number.isFinite(mg) || !Number.isFinite(ml) || ml <= 0) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      card.dataset.concentracion = "";
      return;
    }

    // Concentración mcg/ml
    const concentracion = (mg * 1000) / ml;
    card.dataset.concentracion = String(concentracion);
    concEl.textContent = `${concentracion.toFixed(1)} mcg/ml`;

    // Inputs
    const peso = toNum(pesoEl.value);
    const velocidad = toNum(velEl.value);

    // Si falta peso o velocidad, mostrar guión
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

  // Recalcular al cambiar dilución
  document.addEventListener("change", (e) => {
    const sel = e.target.closest("select.dilucion");
    if (!sel) return;

    const card = sel.closest(".drug-card");
    if (!card) return;

    calcForCard(card);
  });

  // Recalcular al tipear peso o velocidad
  document.addEventListener("input", (e) => {
    if (!e.target.matches("input.peso, input.velocidad")) return;

    const card = e.target.closest(".drug-card");
    if (!card) return;

    calcForCard(card);
  });

  // Inicializa cards existentes
  function init() {
    document.querySelectorAll(".drug-card").forEach(calcForCard);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
