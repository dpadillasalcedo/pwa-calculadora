/* =========================================================
   FARMACOTECA UCI – farmacoteca.js (ROBUSTO + DEBUG)
   Soporta:
   - mcg/min      (data-calc="mcg-min" + data-mcg-per-ml)
   - mcg/kg/min   (data-calc="mcg-kg-min" + data-mcg-per-ml + peso)
   - mg/kg/h      (data-calc="mg-kg-h" + data-mg-per-ml + peso)
   - UI/min       (data-calc="ui-min" + data-ui-per-ml)
   Incluye:
   - Toggle de fichas
   - Filtros: buscar + grupo + reset
========================================================= */

(function () {
  "use strict";

  const DEBUG = true;
  const log = (...a) => DEBUG && console.log("[farmacoteca]", ...a);

  function fmt(n, d) {
    if (!Number.isFinite(n)) return "—";
    const p = Math.pow(10, d);
    return (Math.round(n * p) / p).toFixed(d);
  }

  function safeText(el, txt) {
    if (el) el.textContent = txt;
  }

  function recalcular(card) {
    if (!card) return;

    const tipo = card.dataset.calc; // mcg-min, mcg-kg-min, mg-kg-h, ui-min
    const sel = card.querySelector(".dilucion");
    const concEl = card.querySelector(".concentracion");
    const pesoEl = card.querySelector(".peso");
    const velEl = card.querySelector(".velocidad");
    const resEl = card.querySelector(".resultado");

    if (!sel || !concEl || !resEl) return;

    const opt = sel.options[sel.selectedIndex];
    if (!opt || sel.selectedIndex === 0) {
      safeText(concEl, "—");
      safeText(resEl, "—");
      return;
    }

    // Siempre mostrar concentración apenas se elige dilución
    let conc;
    if (tipo === "mcg-min" || tipo === "mcg-kg-min") {
      conc = parseFloat(opt.dataset.mcgPerMl);
      safeText(concEl, Number.isFinite(conc) ? `${fmt(conc, 1)} mcg/ml` : "—");
    } else if (tipo === "mg-kg-h") {
      conc = parseFloat(opt.dataset.mgPerMl);
      safeText(concEl, Number.isFinite(conc) ? `${fmt(conc, 3)} mg/ml` : "—");
    } else if (tipo === "ui-min") {
      conc = parseFloat(opt.dataset.uiPerMl);
      safeText(concEl, Number.isFinite(conc) ? `${fmt(conc, 3)} UI/ml` : "—");
    } else {
      safeText(concEl, "—");
      safeText(resEl, "—");
      return;
    }

    // Si concentración inválida, no calcular
    if (!Number.isFinite(conc) || conc <= 0) {
      safeText(resEl, "—");
      return;
    }

    const vel = parseFloat(velEl?.value);
    const peso = parseFloat(pesoEl?.value);

    // Calcular según tipo
    if (tipo === "mcg-kg-min") {
      if (!Number.isFinite(vel) || vel <= 0 || !Number.isFinite(peso) || peso <= 0) {
        safeText(resEl, "—");
        return;
      }
      const dosis = (vel * conc) / (peso * 60);
      safeText(resEl, `${fmt(dosis, 3)} mcg/kg/min`);
      return;
    }

    if (tipo === "mcg-min") {
      if (!Number.isFinite(vel) || vel <= 0) {
        safeText(resEl, "—");
        return;
      }
      const dosis = (vel * conc) / 60;
      safeText(resEl, `${fmt(dosis, 0)} mcg/min`);
      return;
    }

    if (tipo === "mg-kg-h") {
      if (!Number.isFinite(vel) || vel <= 0 || !Number.isFinite(peso) || peso <= 0) {
        safeText(resEl, "—");
        return;
      }
      const dosis = (vel * conc) / peso;
      safeText(resEl, `${fmt(dosis, 3)} mg/kg/h`);
      return;
    }

    if (tipo === "ui-min") {
      if (!Number.isFinite(vel) || vel <= 0) {
        safeText(resEl, "—");
        return;
      }
      const dosis = (vel * conc) / 60;
      safeText(resEl, `${fmt(dosis, 3)} UI/min`);
      return;
    }
  }

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

  function init() {
    log("JS cargado ✅");
    log("drug-cards:", document.querySelectorAll(".drug-card").length);

    // Toggle fichas
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".toggle-sheet");
      if (!btn) return;

      const card = btn.closest(".drug-card");
      const sheet = card?.querySelector(".drug-sheet");
      if (!card || !sheet) return;

      const expanded = btn.getAttribute("aria-expanded") === "true";
      sheet.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(!expanded));
      btn.textContent = expanded ? "Ver ficha" : "Ocultar ficha";
    });

    // Eventos de cálculo
    document.addEventListener("change", function (e) {
      if (!e.target.classList.contains("dilucion")) return;
      const card = e.target.closest(".drug-card");
      log("change dilucion:", card?.id || "(sin id)", "tipo:", card?.dataset?.calc);
      recalcular(card);
    });

    document.addEventListener("input", function (e) {
      if (
        !e.target.classList.contains("peso") &&
        !e.target.classList.contains("velocidad")
      ) return;
      const card = e.target.closest(".drug-card");
      recalcular(card);
    });

    // Filtros
    document.getElementById("q")?.addEventListener("input", applyFilters);
    document.getElementById("grupo")?.addEventListener("change", applyFilters);
    document.getElementById("btnReset")?.addEventListener("click", () => {
      const qEl = document.getElementById("q");
      const gEl = document.getElementById("grupo");
      if (qEl) qEl.value = "";
      if (gEl) gEl.value = "all";
      applyFilters();
    });

    applyFilters();
  }

  // Asegura que todo exista antes de bindear
  document.addEventListener("DOMContentLoaded", init);
})();
