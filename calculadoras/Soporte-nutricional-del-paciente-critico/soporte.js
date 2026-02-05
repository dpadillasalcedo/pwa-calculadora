/* =========================
   CriticalCareTools – Soporte Nutricional
========================= */

const STRATEGIES = {
  trofico: { kcalKg: 15, protKg: 0.8 },
  full:    { kcalKg: 30, protKg: 2.0 },
  hipo:    { kcalKg: 15, protKg: 2.0 }
};

const $ = id => document.getElementById(id);

const round10 = v => Math.round(v / 10) * 10;
const round1  = v => Math.round(v * 10) / 10;
const round0  = v => Math.round(v);

function validNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function calculate(weight, kcalKg, protKg) {
  const kcal = weight * kcalKg;
  const protein = weight * protKg;
  const kcalFromProtein = protein * 4;
  const kcalNonProtein = Math.max(0, kcal - kcalFromProtein);

  return {
    kcal: round10(kcal),
    protein: round0(protein),
    kcalProt: round10(kcalFromProtein),
    kcalNoProt: round10(kcalNonProtein)
  };
}

/* =========================
   Tablas enterales
========================= */
function clearEnteralTable(tableId) {
  document
    .querySelectorAll(`#${tableId} tbody tr`)
    .forEach(row => {
      row.querySelector(".vol").textContent     = "—";
      row.querySelector(".kcal").textContent    = "—";
      row.querySelector(".prot").textContent    = "—";
      row.querySelector(".deficit").textContent = "—";
      row.classList.remove("best-option");
    });
}

function updateEnteralTable(tableId, targetKcal, targetProtein) {
  if (!targetKcal || !targetProtein) return;

  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  const calc = [];

  rows.forEach(row => {
    const kcalMl  = Number(row.dataset.kcalml);
    const prot100 = Number(row.dataset.prot100);
    if (!kcalMl || !prot100) return;

    const vol = targetKcal / kcalMl;
    const protReal = vol * (prot100 / 100);
    const deficit = Math.max(0, targetProtein - protReal);

    calc.push({ row, vol, protReal, deficit });
  });

  calc.sort((a, b) => a.deficit - b.deficit);

  calc.forEach((c, i) => {
    c.row.querySelector(".vol").textContent  = `${Math.round(c.vol)} ml`;
    c.row.querySelector(".kcal").textContent = `${targetKcal} kcal`;
    c.row.querySelector(".prot").textContent = `${Math.round(c.protReal)} g`;
    c.row.querySelector(".deficit").textContent =
      c.deficit > 0 ? `-${Math.round(c.deficit)} g` : "0 g";

    c.row.classList.toggle("best-option", i === 0);
  });
}

/* =========================
   Main
========================= */
function runCalculation() {
  const peso = validNumber($("pesoReal").value);
  if (!peso) {
    clearEnteralTable("tablaTrofico");
    clearEnteralTable("tablaFull");
    clearEnteralTable("tablaHipo");
    return;
  }

  const trof = calculate(peso, STRATEGIES.trofico.kcalKg, STRATEGIES.trofico.protKg);
  const full = calculate(peso, STRATEGIES.full.kcalKg, STRATEGIES.full.protKg);
  const hipo = calculate(peso, STRATEGIES.hipo.kcalKg, STRATEGIES.hipo.protKg);

  $("kcalTrofico").textContent = `${trof.kcal} kcal/día`;
  $("protTrofico").textContent = `${trof.protein} g/día`;

  $("kcalFull").textContent = `${full.kcal} kcal/día`;
  $("protFull").textContent = `${full.protein} g/día`;

  $("kcalHipo").textContent = `${hipo.kcal} kcal/día`;
  $("protHipo").textContent = `${hipo.protein} g/día`;

  updateEnteralTable("tablaTrofico", trof.kcal, trof.protein);
  updateEnteralTable("tablaFull", full.kcal, full.protein);
  updateEnteralTable("tablaHipo", hipo.kcal, hipo.protein);
}

document.addEventListener("DOMContentLoaded", () => {
  $("pesoReal").addEventListener("input", runCalculation);
});
