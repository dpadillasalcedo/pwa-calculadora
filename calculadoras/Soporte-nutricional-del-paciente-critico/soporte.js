/* =========================
   CriticalCareTools
   Soporte nutricional – JS
========================= */

/* =========================
   CONSTANTES CLÍNICAS
========================= */

// Valores superiores por estrategia
const STRATEGIES = {
  trofico: { kcalKg: 20, protKg: 0.8 },
  full:    { kcalKg: 25, protKg: 2.0 },
  hipo:    { kcalKg: 15, protKg: 1.5 }
};

/* =========================
   HELPERS
========================= */

const $ = (id) => document.getElementById(id);

function isValidNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function roundKcal(value) {
  return Math.round(value / 10) * 10; // redondeo clínico
}

function roundInt(value) {
  return Math.round(value);
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

/* =========================
   CÁLCULO BASE
========================= */

function calculate(weightKg, kcalPerKg, proteinPerKg) {
  const kcal = weightKg * kcalPerKg;
  const protein = weightKg * proteinPerKg;

  const kcalFromProtein = protein * 4;
  const kcalNonProtein = Math.max(0, kcal - kcalFromProtein);

  return {
    kcal: roundKcal(kcal),
    protein: roundInt(protein),
    kcalFromProtein: roundKcal(kcalFromProtein),
    kcalNonProtein: roundKcal(kcalNonProtein)
  };
}

/* =========================
   UI – OBESIDAD
========================= */

function handleObesityUI() {
  const isObese = $("toggleObeso").checked;

  $("boxPesoIdeal").style.display = isObese ? "block" : "none";
  $("notaObesidad").style.display = isObese ? "block" : "none";
}

/* =========================
   CÁLCULO PRINCIPAL
========================= */

function calcularSoporteNutricional() {
  const pesoReal = isValidNumber($("pesoReal").value);

  if (!pesoReal) {
    alert("Ingresá un peso real válido (kg).");
    return;
  }

  const isObese = $("toggleObeso").checked;

  /* -------- Trófico -------- */
  const trof = calculate(
    pesoReal,
    STRATEGIES.trofico.kcalKg,
    STRATEGIES.trofico.protKg
  );

  setText("kcalTrofico", `${trof.kcal} kcal/día`);
  setText("protTrofico", `${trof.protein} g/día`);
  setText("kcalProtTrofico", `${trof.kcalFromProtein} kcal`);
  setText("kcalNoProtTrofico", `${trof.kcalNonProtein} kcal`);

  /* -------- Full feeding -------- */
  const full = calculate(
    pesoReal,
    STRATEGIES.full.kcalKg,
    STRATEGIES.full.protKg
  );

  setText("kcalFull", `${full.kcal} kcal/día`);
  setText("protFull", `${full.protein} g/día`);
  setText("kcalProtFull", `${full.kcalFromProtein} kcal`);
  setText("kcalNoProtFull", `${full.kcalNonProtein} kcal`);

  /* -------- Hipocalórico / hiperproteico -------- */
  let pesoHipo = pesoReal;

  if (isObese) {
    const pesoIdeal = isValidNumber($("pesoIdeal").value);

    if (!pesoIdeal) {
      alert("Ingresá un peso ideal válido para paciente obeso.");
      return;
    }

    pesoHipo = pesoIdeal;
  }

  const hipo = calculate(
    pesoHipo,
    STRATEGIES.hipo.kcalKg,
    STRATEGIES.hipo.protKg
  );

  setText("pesoUsadoHipo", `${pesoHipo} kg`);
  setText("kcalHipo", `${hipo.kcal} kcal/día`);
  setText("protHipo", `${hipo.protein} g/día`);
  setText("kcalProtHipo", `${hipo.kcalFromProtein} kcal`);
  setText("kcalNoProtHipo", `${hipo.kcalNonProtein} kcal`);
}

/* =========================
   EVENTOS
========================= */

document.addEventListener("DOMContentLoaded", () => {
  // Toggle obesidad (solo UI)
  $("toggleObeso").addEventListener("change", handleObesityUI);

  // Botón calcular
  $("btnCalcular").addEventListener("click", calcularSoporteNutricional);
});
