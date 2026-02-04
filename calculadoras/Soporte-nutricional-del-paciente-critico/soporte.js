/* =========================
   CriticalCareTools – Soporte Nutricional
========================= */

/* === Estrategias === */
const STRATEGIES = {
  trofico: { kcalKg: 15, protKg: 0.8 },
  full:    { kcalKg: 30, protKg: 2.0 },
  hipo:    { kcalKg: 15, protKg: 2.0 }
};

/* === Helpers DOM === */
const $ = (id) => document.getElementById(id);

/* === Redondeos === */
const round10 = (v) => Math.round(v / 10) * 10;
const round1  = (v) => Math.round(v * 10) / 10;
const round0  = (v) => Math.round(v);

/* === Validación numérica === */
function validNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/* === Set texto seguro === */
function setText(id, value = "—") {
  const el = $(id);
  if (el) el.textContent = value;
}

/* =========================
   Limpieza
========================= */
function clearOutputs() {
  [
    "kcalTrofico","protTrofico","kcalProtTrofico","kcalNoProtTrofico",
    "kcalFull","protFull","kcalProtFull","kcalNoProtFull",
    "pesoUsadoHipo","kcalHipo","protHipo","kcalProtHipo","kcalNoProtHipo"
  ].forEach(id => setText(id));

  clearEnteralTable();
}

/* =========================
   Cálculo base
========================= */
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
   Tabla enteral
========================= */
function clearEnteralTable() {
  document
    .querySelectorAll(".tabla-enterales tbody tr")
    .forEach(row => {
      row.querySelector(".vol").textContent  = "—";
      row.querySelector(".kcal").textContent = "—";
      row.querySelector(".prot").textContent = "—";
      row.querySelector(".eval").textContent = "—";
    });
}

function updateEnteralTable(targetKcal, targetProtein) {
  if (!targetKcal || !targetProtein) return;

  const rows = document.querySelectorAll(".tabla-enterales tbody tr");
  if (!rows.length) return;

  rows.forEach(row => {
    const kcalMl = Number(row.dataset.kcalml);
    const prot100 = Number(row.dataset.prot100);

    if (!kcalMl || !prot100) return;

    const vol = targetKcal / kcalMl;
    const protReal = vol * (prot100 / 100);
    const ratio = protReal / targetProtein;

    let evalText = "❌ No cumple";
    if (ratio >= 1) evalText = "✅ Cumple";
    else if (ratio >= 0.8) evalText = "🟡 Se aproxima";

    row.querySelector(".vol").textContent  = `${round0(vol)} ml`;
    row.querySelector(".kcal").textContent = `${round10(targetKcal)} kcal`;
    row.querySelector(".prot").textContent = `${round0(protReal)} g`;
    row.querySelector(".eval").textContent = evalText;
  });
}

/* =========================
   Evento principal
========================= */
function runCalculation() {

  const pesoInput = $("pesoReal");
  const msg = $("msgPeso");

  const pesoReal = validNumber(pesoInput?.value);

  /* Validación */
  if (!pesoReal) {
    clearOutputs();
    if (msg) msg.style.display = "block";
    return;
  }

  if (msg) msg.style.display = "none";

  /* --- Trófico --- */
  const trof = calculate(
    pesoReal,
    STRATEGIES.trofico.kcalKg,
    STRATEGIES.trofico.protKg
  );

  setText("kcalTrofico", `${trof.kcal} kcal/día`);
  setText("protTrofico", `${trof.protein} g/día`);
  setText("kcalProtTrofico", `${trof.kcalProt} kcal`);
  setText("kcalNoProtTrofico", `${trof.kcalNoProt} kcal`);

  /* --- Full feeding --- */
  const full = calculate(
    pesoReal,
    STRATEGIES.full.kcalKg,
    STRATEGIES.full.protKg
  );

  setText("kcalFull", `${full.kcal} kcal/día`);
  setText("protFull", `${full.protein} g/día`);
  setText("kcalProtFull", `${full.kcalProt} kcal`);
  setText("kcalNoProtFull", `${full.kcalNoProt} kcal`);

  /* --- Hipocalórico / hiperproteico --- */
  const hipo = calculate(
    pesoReal,
    STRATEGIES.hipo.kcalKg,
    STRATEGIES.hipo.protKg
  );

  setText("pesoUsadoHipo", `${round1(pesoReal)} kg`);
  setText("kcalHipo", `${hipo.kcal} kcal/día`);
  setText("protHipo", `${hipo.protein} g/día`);
  setText("kcalProtHipo", `${hipo.kcalProt} kcal`);
  setText("kcalNoProtHipo", `${hipo.kcalNoProt} kcal`);

  /* --- Tabla enteral basada en FULL --- */
  updateEnteralTable(full.kcal, full.protein);
}

/* =========================
   Listeners
========================= */
document.addEventListener("DOMContentLoaded", () => {
  $("btnCalcular")?.addEventListener("click", runCalculation);
  $("pesoReal")?.addEventListener("input", runCalculation);
});
