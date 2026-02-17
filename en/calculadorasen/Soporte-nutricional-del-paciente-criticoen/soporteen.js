document.addEventListener("DOMContentLoaded", () => {

  const weightInput = document.getElementById("actualWeight");

  const kcalTrophic = document.getElementById("kcalTrophic");
  const protTrophic = document.getElementById("protTrophic");

  const kcalFull = document.getElementById("kcalFull");
  const protFull = document.getElementById("protFull");

  const kcalHypo = document.getElementById("kcalHypo");
  const protHypo = document.getElementById("protHypo");

  if (!weightInput) return; // safety

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

    kcalTrophic.textContent = trophicKcal.toFixed(0) + " kcal/day";
    protTrophic.textContent = trophicProt.toFixed(1) + " g/day";

    kcalFull.textContent = fullKcal.toFixed(0) + " kcal/day";
    protFull.textContent = fullProt.toFixed(1) + " g/day";

    kcalHypo.textContent = hypoKcal.toFixed(0) + " kcal/day";
    protHypo.textContent = hypoProt.toFixed(1) + " g/day";

    updateTable("tablaTrophic", trophicKcal, trophicProt);
    updateTable("tablaFull", fullKcal, fullProt);
    updateTable("tablaHypo", hypoKcal, hypoProt);
  }

  function updateTable(tableId, targetKcal, targetProt) {

    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {

      const kcalPerMl = parseFloat(row.dataset.kcalml);
      const proteinPer100ml = parseFloat(row.dataset.prot100);

      if (!kcalPerMl || !proteinPer100ml) return;

      const volume = targetKcal / kcalPerMl;
      const proteinDelivered = (volume / 100) * proteinPer100ml;
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

    const resultFields = document.querySelectorAll(
      "#kcalTrophic, #protTrophic, #kcalFull, #protFull, #kcalHypo, #protHypo"
    );

    resultFields.forEach(el => el.textContent = "—");

    const tableCells = document.querySelectorAll(
      ".vol, .kcal, .prot, .deficit"
    );

    tableCells.forEach(cell => cell.textContent = "—");
  }

});
