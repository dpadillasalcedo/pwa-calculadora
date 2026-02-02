/* =========================
   CriticalCareTools – JS
   ========================= */

// Estrategias (valores superiores)
const STRATEGIES = {
  trofico: { kcalKg: 15, protKg: 0.8 },
  full:    { kcalKg: 30, protKg: 2.0 },
  hipo:    { kcalKg: 20, protKg: 1.5 }
};

const $ = (id) => document.getElementById(id);

// Helpers
const roundKcal = (v) => Math.round(v / 10) * 10;
const roundInt  = (v) => Math.round(v);

function validNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function updateText(id, text) {
  $(id).textContent = text;
}

// Cálculo genérico
function calculate(weight, kcalKg, protKg) {
  const kcal = weight * kcalKg;
  const protein = weight * protKg;
  const kcalFromProtein = protein * 4;
  const kcalNonProtein = Math.max(0, kcal - kcalFromProtein);

  return {
    kcal: roundKcal(kcal),
    protein: roundInt(protein),
    kcalFromProtein: roundKcal(kcalFromProtein),
    kcalNonProtein: roundKcal(kcalNonProtein)
  };
}

// Recalcular todo
function recompute() {
  const pesoReal = validNumber($("pesoReal").value);
  const isObese = $("toggleObeso").checked;

  $("boxPesoIdeal").style.display = isObese ? "block" : "none";
  $("notaObesidad").style.display = isObese ? "block" : "none";

  if (!pesoReal) return;

  // --- Trófico ---
  const trof = calculate(pesoReal, STRATEGIES.trofico.kcalKg, STRATEGIES.trofico.protKg);
  updateText("kcalTrofico", `${trof.kcal} kcal/día`);
  updateText("protTrofico", `${trof.protein} g/día`);
  updateText("kcalProtTrofico", `${trof.kcalFromProtein} kcal`);
  updateText("kcalNoProtTrofico", `${trof.kcalNonProtein} kcal`);

  // --- Full feeding ---
  const full = calculate(pesoReal, STRATEGIES.full.kcalKg, STRATEGIES.full.protKg);
  updateText("kcalFull", `${full.kcal} kcal/día`);
  updateText("protFull", `${full.protein} g/día`);
  updateText("kcalProtFull", `${full.kcalFromProtein} kcal`);
  updateText("kcalNoProtFull", `${full.kcalNonProtein} kcal`);

  // --- Hipocalórico / hiperproteico ---
  let pesoHipo = pesoReal;
  if (isObese) {
    const pesoIdeal = validNumber($("pesoIdeal").value);
    if (pesoIdeal) pesoHipo = pesoIdeal;
  }

  const hipo = calculate(pesoHipo, STRATEGIES.hipo.kcalKg, STRATEGIES.hipo.protKg);
  updateText("pesoUsadoHipo", `${pesoHipo} kg`);
  updateText("kcalHipo", `${hipo.kcal} kcal/día`);
  updateText("protHipo", `${hipo.protein} g/día`);
  updateText("kcalProtHipo", `${hipo.kcalFromProtein} kcal`);
  updateText("kcalNoProtHipo", `${hipo.kcalNonProtein} kcal`);
}

// Eventos
["pesoReal", "pesoIdeal", "toggleObeso"].forEach(id => {
  $(id).addEventListener("input", recompute);
  $(id).addEventListener("change", recompute);
});

// Init
document.addEventListener("DOMContentLoaded", recompute);
