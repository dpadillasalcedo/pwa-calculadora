  console.log("farmacoteca.js activo");

document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("dilucion")) return;

  const card = e.target.closest(".drug-card");
  if (!card) return;

  const opt = e.target.selectedOptions[0];
  const conc = parseFloat(opt?.dataset?.mcgPerMl);

  const concEl = card.querySelector(".concentracion");
  const resEl = card.querySelector(".resultado");

  if (!Number.isFinite(conc)) {
    concEl.textContent = "—";
    resEl.textContent = "—";
    return;
  }

  concEl.textContent = `${conc.toFixed(1)} mcg/ml`;
  calcular(card);
});

document.addEventListener("input", function (e) {
  if (!e.target.classList.contains("peso") && !e.target.classList.contains("velocidad")) return;

  const card = e.target.closest(".drug-card");
  if (!card) return;

  calcular(card);
});

function calcular(card) {
  const conc = parseFloat(
    card.querySelector(".dilucion")?.selectedOptions[0]?.dataset?.mcgPerMl
  );
  const peso = parseFloat(card.querySelector(".peso")?.value);
  const velocidad = parseFloat(card.querySelector(".velocidad")?.value);
  const resEl = card.querySelector(".resultado");

  if (
    !Number.isFinite(conc) ||
    !Number.isFinite(peso) || peso <= 0 ||
    !Number.isFinite(velocidad) || velocidad <= 0
  ) {
    resEl.textContent = "—";
    return;
  }

  // mcg/kg/min = (ml/h * mcg/ml) / (kg * 60)
  const gammas = (velocidad * conc) / (peso * 60);
  resEl.textContent = `${gammas.toFixed(3)} mcg/kg/min`;
}

// Toggle ficha
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".toggle-sheet");
  if (!btn) return;

  const card = btn.closest(".drug-card");
  const sheet = card.querySelector(".drug-sheet");

  const expanded = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!expanded));
  sheet.classList.toggle("hidden");
  btn.textContent = expanded ? "Ver ficha" : "Ocultar ficha";
});

<script>
  // =========================
  // Vasopresina (UI/min)
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
  // mcg/kg/min (noradrenalina, adrenalina, dopamina, nitroprusiato)
  // =========================
  if (tipo === "mcg-kg-min") {
    conc = parseFloat(opt.dataset.mcgPerMl);
    peso = parseFloat(pesoEl?.value);
    vel = parseFloat(velEl.value);

    if (!conc || !peso || !vel) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(1)} mcg/ml`;
    dosis = (vel * conc) / (peso * 60);
    resEl.textContent = `${dosis.toFixed(3)} mcg/kg/min`;
  }

  // =========================
  // UI/min (vasopresina)
  // =========================
  if (tipo === "ui-min") {
    conc = parseFloat(opt.dataset.uiPerMl);
    vel = parseFloat(velEl.value);

    if (!conc || !vel) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(2)} UI/ml`;
    dosis = (vel * conc) / 60;
    resEl.textContent = `${dosis.toFixed(3)} UI/min`;
  }

  // =========================
  // mg/kg/h (azul de metileno)
  // =========================
  if (tipo === "mg-kg-h") {
    conc = parseFloat(opt.dataset.mgPerMl);
    peso = parseFloat(pesoEl?.value);
    vel = parseFloat(velEl.value);

    if (!conc || !peso || !vel) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(2)} mg/ml`;
    dosis = (vel * conc) / peso;
    resEl.textContent = `${dosis.toFixed(3)} mg/kg/h`;
  }

  // =========================
  // mcg/min (nitroglicerina)
  // =========================
  if (tipo === "mcg-min") {
    conc = parseFloat(opt.dataset.mcgPerMl);
    vel = parseFloat(velEl.value);

    if (!conc || !vel) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(1)} mcg/ml`;
    dosis = (vel * conc) / 60;
    resEl.textContent = `${dosis.toFixed(1)} mcg/min`;
  }

  // =========================
  // mg/min (labetalol)
  // =========================
  if (tipo === "mg-min") {
    conc = parseFloat(opt.dataset.mgPerMl);
    vel = parseFloat(velEl.value);

    if (!conc || !vel) {
      concEl.textContent = "—";
      resEl.textContent = "—";
      return;
    }

    concEl.textContent = `${conc.toFixed(2)} mg/ml`;
    dosis = (vel * conc) / 60;
    resEl.textContent = `${dosis.toFixed(2)} mg/min`;
  }
}
</script>

