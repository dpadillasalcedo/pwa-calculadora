/* =========================================================
   FARMACOTECA UCI – JS COMPLETO FINAL
   - Toggle de fichas
   - Filtros (buscar + grupo + reset)
   - Cálculos:
     * mcg/min      (data-calc="mcg-min" + data-mcg-per-ml)
     * mcg/kg/min   (data-calc="mcg-kg-min" + data-mcg-per-ml + peso)
     * mg/kg/h      (data-calc="mg-kg-h" + data-mg-per-ml + peso)
     * UI/min       (data-calc="ui-min" + data-ui-per-ml)
========================================================= */

(function () {
  "use strict";

  // -------------------------
  // Helpers
  // -------------------------
  function fmt(n, d) {
    if (!Number.isFinite(n)) return "—";
    const p = Math.pow(10, d);
    return (Math.round(n * p) / p).toFixed(d);
  }

  function setDash(card) {
    const concEl = card.querySelector(".concentracion");
    const resEl = card.querySelector(".resultado");
    if (concEl) concEl.textContent = "—";
    if (resEl) resEl.textContent = "—";
  }

  // -------------------------
  // Toggle de fichas
  // -------------------------
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".toggle-sheet");
    if (!btn) return;

    const card = btn.closest(".drug-card");
    if (!card) return;

    const sheet = card.querySelector(".drug-sheet");
    if (!sheet) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";

    sheet.classList.toggle("hidden");
    btn.setAttribute("aria-expanded", String(!expanded));
    btn.textContent = expanded ? "Ver ficha" : "Ocultar ficha";
  });

  // -------------------------
  // Navegación: buscar + grupo
  // -------------------------
  function applyFilters() {
    const qEl = document.getElementById("q");
    const grupoEl = document.getElementById("grupo");

    const query = (qEl?.value || "").trim().toLowerCase();
    const g = (grupoEl?.value || "all").trim();

    document.querySelectorAll(".drug-card").forEach((card) => {
      const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const group = card.dataset.group || "all";

      const okName = !query || name.includes(query);
      const okGroup = g === "all" || group === g;

      card.style.display = okName && okGroup ? "" : "none";
    });
  }

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "q") applyFilters();
  });

  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "grupo") applyFilters();
  });

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("#btnReset");
    if (!btn) return;

    const qEl = document.getElementById("q");
    const grupoEl = document.getElementById("grupo");
    if (qEl) qEl.value = "";
    if (grupoEl) grupoEl.value = "all";
    applyFilters();
  });

  // -------------------------
  // Cálculos (según data-calc)
  // -------------------------
   function recalcular(card) {
  const tipo = card.dataset.calc;

  const sel = card.querySelector(".dilucion");
  const concEl = card.querySelector(".concentracion");
  const pesoEl = card.querySelector(".peso");
  const velEl = card.querySelector(".velocidad");
  const resEl = card.querySelector(".resultado");

  if (!sel || !concEl || !resEl) return;

  const opt = sel.options[sel.selectedIndex];
  if (!opt || sel.selectedIndex === 0) {
    concEl.textContent = "—";
    resEl.textContent = "—";
    return;
  }

  let conc, dosis;

  /* =========================
     mcg/kg/min
  ========================= */
  if (tipo === "mcg-kg-min") {
    conc = parseFloat(opt.dataset.mcgPerMl);
    concEl.textContent = Number.isFinite(conc) ? `${conc} mcg/ml` : "—";

    const peso = parseFloat(pesoEl?.value);
    const vel = parseFloat(velEl?.value);

    if (!Number.isFinite(peso) || !Number.isFinite(vel) || peso <= 0 || vel <= 0) {
      resEl.textContent = "—";
      return;
    }

    dosis = (vel * conc) / (peso * 60);
    resEl.textContent = `${dosis.toFixed(3)} mcg/kg/min`;
    return;
  }

  /* =========================
     mcg/min
  ========================= */
  if (tipo === "mcg-min") {
    conc = parseFloat(opt.dataset.mcgPerMl);
    concEl.textContent = Number.isFinite(conc) ? `${conc} mcg/ml` : "—";

    const vel = parseFloat(velEl?.value);
    if (!Number.isFinite(vel) || vel <= 0) {
      resEl.textContent = "—";
      return;
    }

    dosis = (vel * conc) / 60;
    resEl.textContent = `${dosis.toFixed(0)} mcg/min`;
    return;
  }

  /* =========================
     mg/kg/h
  ========================= */
  if (tipo === "mg-kg-h") {
    conc = parseFloat(opt.dataset.mgPerMl);
    concEl.textContent = Number.isFinite(conc) ? `${conc} mg/ml` : "—";

    const peso = parseFloat(pesoEl?.value);
    const vel = parseFloat(velEl?.value);

    if (!Number.isFinite(peso) || !Number.isFinite(vel) || peso <= 0 || vel <= 0) {
      resEl.textContent = "—";
      return;
    }

    dosis = (vel * conc) / peso;
    resEl.textContent = `${dosis.toFixed(3)} mg/kg/h`;
    return;
  }

  /* =========================
     UI/min
  ========================= */
  if (tipo === "ui-min") {
    conc = parseFloat(opt.dataset.uiPerMl);
    concEl.textContent = Number.isFinite(conc) ? `${conc} UI/ml` : "—";

    const vel = parseFloat(velEl?.value);
    if (!Number.isFinite(vel) || vel <= 0) {
      resEl.textContent = "—";
      return;
    }

    dosis = (vel * conc) / 60;
    resEl.textContent = `${dosis.toFixed(3)} UI/min`;
    return;
  }

  concEl.textContent = "—";
  resEl.textContent = "—";
}
