/* =========================================================
   TOGGLE DRUG SHEETS
========================================================= */

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".toggle-sheet");
  if (!btn) return;

  const card = btn.closest(".drug-card");
  const sheet = card.querySelector(".drug-sheet");

  if (!sheet) return;

  sheet.classList.toggle("hidden");

  btn.textContent = sheet.classList.contains("hidden")
    ? "View sheet"
    : "Hide sheet";
});


/* =========================================================
   AUTO CALCULATION (INPUT + CHANGE)
========================================================= */

document.addEventListener("input", function (e) {
  const card = e.target.closest(".drug-card");
  if (card) calculate(card);
});

document.addEventListener("change", function (e) {
  const card = e.target.closest(".drug-card");
  if (card) calculate(card);
});


/* =========================================================
   CORE CALCULATION ENGINE
========================================================= */

function calculate(card) {

  const type = card.dataset.calc;
  const dilution = card.querySelector(".dilucion")?.selectedOptions[0];

  if (!type || !dilution) return;

  const rate = parseFloat(card.querySelector(".velocidad")?.value);
  const weight = parseFloat(card.querySelector(".peso")?.value);

  const outputConcentration = card.querySelector(".concentracion");
  const outputResult = card.querySelector(".resultado");

  if (!outputResult) return;

  let concentration;
  let result;
  let unit = "";

  /* ================= mcg/kg/min ================= */
  if (type === "mcg-kg-min") {
    concentration = +dilution.dataset.mcgPerMl;
    unit = "mcg/kg/min";
    outputConcentration.textContent = concentration + " mcg/ml";

    if (rate > 0 && weight > 0) {
      result = (rate * concentration) / (weight * 60);
    }
  }

  /* ================= mcg/min ================= */
  if (type === "mcg-min") {
    concentration = +dilution.dataset.mcgPerMl;
    unit = "mcg/min";
    outputConcentration.textContent = concentration + " mcg/ml";

    if (rate > 0) {
      result = (rate * concentration) / 60;
    }
  }

  /* ================= mcg/kg/h ================= */
  if (type === "mcg-kg-h") {
    concentration = +dilution.dataset.mcgPerMl;
    unit = "mcg/kg/h";
    outputConcentration.textContent = concentration + " mcg/ml";

    if (rate > 0 && weight > 0) {
      result = (rate * concentration) / weight;
    }
  }

  /* ================= mcg/kg/hr ================= */
  if (type === "mcg-kg-hr") {
    concentration = +dilution.dataset.mcgPerMl;
    unit = "mcg/kg/hr";
    outputConcentration.textContent = concentration + " mcg/ml";

    if (rate > 0 && weight > 0) {
      result = (rate * concentration) / weight;
    }
  }

  /* ================= mg/kg/h ================= */
  if (type === "mg-kg-h") {
    concentration = +dilution.dataset.mgPerMl;
    unit = "mg/kg/h";
    outputConcentration.textContent = concentration + " mg/ml";

    if (rate > 0 && weight > 0) {
      result = (rate * concentration) / weight;
    }
  }

  /* ================= mg/kg/hr ================= */
  if (type === "mg-kg-hr") {
    concentration = +dilution.dataset.mgPerMl;
    unit = "mg/kg/hr";
    outputConcentration.textContent = concentration + " mg/ml";

    if (rate > 0 && weight > 0) {
      result = (rate * concentration) / weight;
    }
  }

  /* ================= mg/min ================= */
  if (type === "mg-min") {
    concentration = +dilution.dataset.mgPerMl;
    unit = "mg/min";
    outputConcentration.textContent = concentration + " mg/ml";

    if (rate > 0) {
      result = (rate * concentration) / 60;
    }
  }

  /* ================= IU/min ================= */
  if (type === "ui-min") {
    concentration = +dilution.dataset.uiPerMl;
    unit = "IU/min";
    outputConcentration.textContent = concentration + " IU/ml";

    if (rate > 0) {
      result = (rate * concentration) / 60;
    }
  }

  /* ================= OUTPUT ================= */

  if (result && isFinite(result)) {
    outputResult.textContent = result.toFixed(2) + " " + unit;
  } else {
    outputResult.textContent = "—";
  }
}


/* =========================================================
   SEARCH + GROUP FILTER
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const searchInput = document.getElementById("q");
  const groupSelect = document.getElementById("grupo");
  const resetButton = document.getElementById("btnReset");

  if (!searchInput || !groupSelect) return;

  const cards = document.querySelectorAll(".drug-card");
  const sectionTitles = document.querySelectorAll("main h2");

  function filterDrugs() {

    const searchText = searchInput.value.toLowerCase().trim();
    const selectedGroup = groupSelect.value;

    cards.forEach(card => {

      const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const group = card.dataset.group;

      const isVisible =
        name.includes(searchText) &&
        (selectedGroup === "all" || selectedGroup === group);

      card.style.display = isVisible ? "" : "none";
    });

    /* Hide section titles without visible drugs */
    sectionTitles.forEach(title => {

      let hasVisible = false;
      let element = title.nextElementSibling;

      while (element && !element.matches("h2")) {

        if (
          element.classList.contains("drug-card") &&
          element.style.display !== "none"
        ) {
          hasVisible = true;
          break;
        }

        element = element.nextElementSibling;
      }

      title.style.display = hasVisible ? "" : "none";
    });
  }

  searchInput.addEventListener("input", filterDrugs);
  groupSelect.addEventListener("change", filterDrugs);

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      searchInput.value = "";
      groupSelect.value = "all";
      filterDrugs();
    });
  }

});
