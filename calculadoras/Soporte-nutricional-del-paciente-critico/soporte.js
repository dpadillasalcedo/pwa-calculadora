/* =========================
   CriticalCareTools – Soporte Nutricional
========================= */

const STRATEGIES = {
  trofico: { kcalKg: 20, protKg: 1.5 },
  hipo:    { kcalKg: 15, protKg: 1.5 }
};

const $ = id => document.getElementById(id);

const round10 = v => Math.round(v / 10) * 10;
const round0  = v => Math.round(v);

function validNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function calculate(weight, kcalKg, protKg) {
  const kcal = weight * kcalKg;
  const protein = weight * protKg;

  return {
    kcal: round10(kcal),
    protein: round0(protein)
  };
}

function runCalculation() {
  const peso = validNumber($("pesoIdeal").value);

  if (!peso) {
    $("kcalTrofico").textContent = "—";
    $("protTrofico").textContent = "—";
    $("kcalHipo").textContent = "—";
    $("protHipo").textContent = "—";
    return;
  }

  const trof = calculate(
    peso,
    STRATEGIES.trofico.kcalKg,
    STRATEGIES.trofico.protKg
  );

  const hipo = calculate(
    peso,
    STRATEGIES.hipo.kcalKg,
    STRATEGIES.hipo.protKg
  );

  $("kcalTrofico").textContent = `${trof.kcal} kcal/día`;
  $("protTrofico").textContent = `${trof.protein} g/día`;

  $("kcalHipo").textContent = `${hipo.kcal} kcal/día`;
  $("protHipo").textContent = `${hipo.protein} g/día`;
}

document.addEventListener("DOMContentLoaded", () => {
  $("pesoIdeal").addEventListener("input", runCalculation);
});
