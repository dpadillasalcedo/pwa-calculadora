document.addEventListener("DOMContentLoaded", () => {

  const weightInput = document.getElementById("pesoReal");

  const kcalTrofico = document.getElementById("kcalTrofico");
  const protTrofico = document.getElementById("protTrofico");

  const kcalFull = document.getElementById("kcalFull");
  const protFull = document.getElementById("protFull");

  const kcalHipo = document.getElementById("kcalHipo");
  const protHipo = document.getElementById("protHipo");

  weightInput.addEventListener("input", calculateAll);

  function calculateAll() {

    const weight = parseFloat(weightInput.value);

    if (!weight || weight <= 0) {
      resetAll();
      return;
    }

    // =========================
    // CALORIC TARGETS
    // =========================

    const trophicKcal = weight * 15;
    const trophicProt = weight * 0.8;

    const fullKcal = weight * 30;
    const fullProt = weight * 2.0;

    const hypoKcal = weight * 15;
    const hypoProt = weight * 2.0;

    kcalTrofico.textContent = trophicKcal.toFixed(0) + " kcal/day";
    protTrofico.textContent = trophicProt.toFixed(1) + " g protein/day";

    kcalFull.textContent = fullKcal.toFixed(0) + " kcal/day";
    protFull.textContent = fullProt.toFixed(1) + " g protein/day";

    kcalHipo.textContent = hypoKcal.toFixed(0) + " kcal/day";
    protHipo.textContent = hypoProt.toFixed(1) + " g protein/day";

    // =========================
    // UPDATE TABLES
    // =========================

    updateTable("tablaTrofico", trophicKcal, trophicProt);
    updateTable("tablaFull", fullKcal, fullProt);
    updateTable("tablaHipo", hypoKcal, hypoProt);
  }

  function updateTable(tableId, targetKcal, targetProt) {

    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {

      const kcalPerMl = parseFloat(row.dataset.kcalml);
      const protPer100 = parseFloat(row.dataset.prot100);

      if (!kcalPerMl || !protPer100) return;

      // Volume needed (ml/day)
      const volume = targetKcal / kcalPerMl;

      // Protein delivered
      const proteinDelivered = (volume / 100) * protPer100;

      // Deficit
      const deficit = targetProt - proteinDelivered;

      row.querySelector(".vol").textContent =
        volume.toFixed(0) + " ml/day";

      row.querySelector(".kcal").textContent =
        targetKcal.toFixed(0) + " kcal/day";

      row.querySelector(".prot").textContent =
        proteinDelivered.toFixed(1) + " g/day";

      row.querySelector(".deficit").textContent =
        deficit > 0
          ? deficit.toFixed(1) + " g/day"
          : "0 g/day";
    });
  }

  function resetAll() {

    const allResults = document.querySelectorAll(
      "#kcalTrofico, #protTrofico, #kcalFull, #protFull, #kcalHipo, #protHipo"
    );

    allResults.forEach(el => el.textContent = "—");

    const cells = document.querySelectorAll(
      ".vol, .kcal, .prot, .deficit"
    );

    cells.forEach(cell => cell.textContent = "—");
  }

});
