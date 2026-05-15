/* =========================
   CriticalCareTools – Nutritional Support
========================= */

const STRATEGIES = {
  trophic: { kcalKg: 20, protKg: 1.5 },
  hypo:    { kcalKg: 15, protKg: 1.5 }
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

/* =========================
   ENTERAL TABLES
========================= */

function clearEnteralTable(tableId) {
  document
    .querySelectorAll(`#${tableId} tbody tr`)
    .forEach(row => {
      row.querySelector(".vol").textContent = "—";
      row.querySelector(".kcal").textContent = "—";
      row.querySelector(".prot").textContent = "—";
      row.querySelector(".deficit").textContent = "—";

      row.classList.remove("best-option");
    });
}

function updateEnteralTable(tableId, targetKcal, targetProtein) {
  if (!targetKcal || !targetProtein) return;

  const fluidRestriction =
    $("restriccionVolumen")?.checked || false;

  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  const calc = [];

  rows.forEach(row => {
    const kcalMl  = Number(row.dataset.kcalml);
    const prot100 = Number(row.dataset.prot100);

    if (!kcalMl || !prot100) return;

    const vol = targetKcal / kcalMl;
    const actualProtein = vol * (prot100 / 100);
    const deficit = Math.max(0, targetProtein - actualProtein);

    calc.push({
      row,
      vol,
      actualProtein,
      deficit,
      kcalMl,
      prot100
    });
  });

  calc.sort((a, b) => {
    if (fluidRestriction) {
      if (a.vol !== b.vol) {
        return a.vol - b.vol;
      }

      if (a.deficit !== b.deficit) {
        return a.deficit - b.deficit;
      }

      return b.prot100 - a.prot100;
    }

    if (a.deficit !== b.deficit) {
      return a.deficit - b.deficit;
    }

    return a.vol - b.vol;
  });

  calc.forEach((c, i) => {
    c.row.querySelector(".vol").textContent =
      `${Math.round(c.vol)} ml`;

    c.row.querySelector(".kcal").textContent =
      `${targetKcal} kcal`;

    c.row.querySelector(".prot").textContent =
      `${Math.round(c.actualProtein)} g`;

    c.row.querySelector(".deficit").textContent =
      c.deficit > 0
        ? `-${Math.round(c.deficit)} g`
        : "0 g";

    c.row.classList.toggle("best-option", i === 0);
  });
}

/* =========================
   MAIN NUTRITION CALCULATION
========================= */

function runCalculation() {
  const idealBodyWeight = validNumber($("pesoIdeal").value);

  if (!idealBodyWeight) {
    $("kcalTrofico").textContent = "—";
    $("protTrofico").textContent = "—";

    $("kcalHipo").textContent = "—";
    $("protHipo").textContent = "—";

    clearEnteralTable("tablaTrofico");
    clearEnteralTable("tablaHipo");

    return;
  }

  const trophic = calculate(
    idealBodyWeight,
    STRATEGIES.trophic.kcalKg,
    STRATEGIES.trophic.protKg
  );

  const hypo = calculate(
    idealBodyWeight,
    STRATEGIES.hypo.kcalKg,
    STRATEGIES.hypo.protKg
  );

  $("kcalTrofico").textContent =
    `${trophic.kcal} kcal/day`;

  $("protTrofico").textContent =
    `${trophic.protein} g/day`;

  $("kcalHipo").textContent =
    `${hypo.kcal} kcal/day`;

  $("protHipo").textContent =
    `${hypo.protein} g/day`;

  updateEnteralTable("tablaTrofico", trophic.kcal, trophic.protein);
  updateEnteralTable("tablaHipo", hypo.kcal, hypo.protein);
}

/* =========================
   DAILY ENERGY REQUIREMENT
========================= */

function calculateIndirectCalorimetry() {
  const vo2 = validNumber($("vo2IC").value);
  const vco2 = validNumber($("vco2IC").value);

  if (!vo2 || !vco2) {
    $("kcalIC").textContent = "—";
    return;
  }

  const kcalDay = ((3.941 * vo2) + (1.106 * vco2)) * 1440;

  $("kcalIC").textContent =
    `${round10(kcalDay)} kcal/day`;
}

function oxygenContent(hb, saturation, po2) {
  return (1.34 * hb * saturation) + (0.0031 * po2);
}

function calculateFick() {
  const co = validNumber($("gcFick").value);
  const hb = validNumber($("hbFick").value);
  const sao2 = validNumber($("sao2Fick").value);
  const svo2 = validNumber($("svo2Fick").value);
  const pao2 = validNumber($("pao2Fick").value);
  const pvo2 = validNumber($("pvo2Fick").value);
  const rq = validNumber($("rqFick").value) || 0.85;

  if (!co || !hb || !sao2 || !svo2 || !pao2 || !pvo2) {
    $("vo2FickResult").textContent = "—";
    $("kcalFick").textContent = "—";
    return;
  }

  const caO2 = oxygenContent(hb, sao2 / 100, pao2);
  const cvO2 = oxygenContent(hb, svo2 / 100, pvo2);

  const vo2MlMin = co * (caO2 - cvO2) * 10;
  const vo2LMin = vo2MlMin / 1000;
  const vco2LMin = vo2LMin * rq;

  const kcalDay =
    ((3.941 * vo2LMin) + (1.106 * vco2LMin)) * 1440;

  $("vo2FickResult").textContent =
    `Estimated VO₂: ${round0(vo2MlMin)} ml/min`;

  $("kcalFick").textContent =
    `${round10(kcalDay)} kcal/day`;
}

function calculatePredictiveCalories() {
  const weight = validNumber($("pesoPredictivo").value);

  if (!weight) {
    $("kcal20").textContent = "—";
    $("kcal25").textContent = "—";
    $("kcal30").textContent = "—";
    return;
  }

  $("kcal20").textContent =
    `20 kcal/kg: ${round10(weight * 20)} kcal/day`;

  $("kcal25").textContent =
    `25 kcal/kg: ${round10(weight * 25)} kcal/day`;

  $("kcal30").textContent =
    `30 kcal/kg: ${round10(weight * 30)} kcal/day`;
}

function runCalorieRequirementCalculation() {
  calculateIndirectCalorimetry();
  calculateFick();
  calculatePredictiveCalories();
}

/* =========================
   EVENTS
========================= */

document.addEventListener("DOMContentLoaded", () => {
  $("pesoIdeal").addEventListener("input", runCalculation);
  $("restriccionVolumen").addEventListener("change", runCalculation);

  [
    "vo2IC",
    "vco2IC",
    "gcFick",
    "hbFick",
    "sao2Fick",
    "svo2Fick",
    "pao2Fick",
    "pvo2Fick",
    "rqFick",
    "pesoPredictivo"
  ].forEach(id => {
    const el = $(id);
    if (el) {
      el.addEventListener("input", runCalorieRequirementCalculation);
    }
  });
});
