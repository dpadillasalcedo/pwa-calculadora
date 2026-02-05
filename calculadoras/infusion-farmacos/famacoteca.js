/* =========================================================
   FARMACOTECA UCI – JS ÚNICO FINAL
   Soporta:
   - mcg/min
   - mcg/kg/min
   - mg/kg/h
   - UI/min
   Incluye toggle de fichas
========================================================= */

// =========================
// TOGGLE DE FICHAS
// =========================
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

// =========================
// CÁLCULO FARMACOLÓGICO
// =========================
function recalcular(card) {
  const tipo = card.dataset.calc;

  const sel = card.querySelector(".dilucion");
  const concEl = card.querySelector(".concentracion");
  const pesoEl = card.querySelector(".peso");
  const velEl = card.querySelector(".velocidad");
  const resEl = card.querySelector(".resultado");

  if (!sel || !concEl || !velEl || !resEl) return;

  const opt = sel.options[sel.selectedIndex];
  if (!opt) return;

  let conc, vel, peso, dosis;

  // =========================
  // mcg/kg/min
  // =========================
  if (tipo === "mcg-kg-min") {
    conc = parseFloat(opt.dataset.mcgPerMl);
    peso = parseFloat(pesoEl?.value);
    vel = parseFloat(velEl.value);

    if (!Number.isFinite(conc) || !Number.isFinite(peso) || !Number.isFinite(vel) || peso <= 0 || vel <= 0) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(1)} mcg/ml`;
    dosis = (vel * conc) / (peso * 60);
    resEl.textContent = `${dosis.toFixed(3)} mcg/kg/min`;
  }

  // =========================
  // mcg/min
  // =========================
  if (tipo === "mcg-min") {
    conc = parseFloat(opt.dataset.mcgPerMl);
    vel = parseFloat(velEl.value);

    if (!Number.isFinite(conc) || !Number.isFinite(vel) || vel <= 0) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(0)} mcg/ml`;
    dosis = (vel * conc) / 60;
    resEl.textContent = `${dosis.toFixed(0)} mcg/min`;
  }

  // =========================
  // mg/kg/h
  // =========================
  if (tipo === "mg-kg-h") {
    conc = parseFloat(opt.dataset.mgPerMl);
    peso = parseFloat(pesoEl?.value);
    vel = parseFloat(velEl.value);

    if (!Number.isFinite(conc) || !Number.isFinite(peso) || !Number.isFinite(vel) || peso <= 0 || vel <= 0) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(2)} mg/ml`;
    dosis = (vel * conc) / peso;
    resEl.textContent = `${dosis.toFixed(3)} mg/kg/h`;
  }

  // =========================
  // UI/min
  // =========================
  if (tipo === "ui-min") {
    conc = parseFloat(opt.dataset.uiPerMl);
    vel = parseFloat(velEl.value);

    if (!Number.isFinite(conc) || !Number.isFinite(vel) || vel <= 0) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(2)} UI/ml`;
    dosis = (vel * conc) / 60;
    resEl.textContent = `${dosis.toFixed(3)} UI/min`;
  }
}

// =========================
// EVENTOS
// =========================
document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("dilucion")) return;
  const card = e.target.closest(".drug-card");
  if (card) recalcular(card);
});

document.addEventListener("input", function (e) {
  if (
    !e.target.classList.contains("peso") &&
    !e.target.classList.contains("velocidad")
  ) return;

  const card = e.target.closest(".drug-card");
  if (card) recalcular(card);
});
