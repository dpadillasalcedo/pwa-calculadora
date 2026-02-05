document.addEventListener("click", e => {
  const btn = e.target.closest(".toggle-sheet");
  if (!btn) return;

  const card = btn.closest(".drug-card");
  const sheet = card.querySelector(".drug-sheet");

  sheet.classList.toggle("hidden");
  btn.textContent = sheet.classList.contains("hidden")
    ? "Ver ficha"
    : "Ocultar ficha";
});

document.addEventListener("input", e => {
  const card = e.target.closest(".drug-card");
  if (card) calc(card);
});

document.addEventListener("change", e => {
  const card = e.target.closest(".drug-card");
  if (card) calc(card);
});

function calc(card) {
  const type = card.dataset.calc;
  const dil = card.querySelector(".dilucion")?.selectedOptions[0];
  if (!dil) return;

  const vel = parseFloat(card.querySelector(".velocidad")?.value);
  const peso = parseFloat(card.querySelector(".peso")?.value);

  const outConc = card.querySelector(".concentracion");
  const outRes = card.querySelector(".resultado");

  let conc, res, unit = "";

  if (type === "mcg-kg-min") {
    conc = +dil.dataset.mcgPerMl;
    unit = "mcg/kg/min";
    outConc.textContent = conc + " mcg/ml";
    if (vel > 0 && peso > 0) res = (vel * conc) / (peso * 60);
  }

  if (type === "mcg-min") {
    conc = +dil.dataset.mcgPerMl;
    unit = "mcg/min";
    outConc.textContent = conc + " mcg/ml";
    if (vel > 0) res = (vel * conc) / 60;
  }

  if (type === "mcg-kg-h" || type === "mcg-kg-hr") {
    conc = +dil.dataset.mcgPerMl;
    unit = type === "mcg-kg-h" ? "mcg/kg/h" : "mcg/kg/hr";
    outConc.textContent = conc + " mcg/ml";
    if (vel > 0 && peso > 0) res = (vel * conc) / peso;
  }

  if (type === "mg-kg-h" || type === "mg-kg-hr") {
    conc = +dil.dataset.mgPerMl;
    unit = type === "mg-kg-h" ? "mg/kg/h" : "mg/kg/hr";
    outConc.textContent = conc + " mg/ml";
    if (vel > 0 && peso > 0) res = (vel * conc) / peso;
  }

  if (type === "mg-min") {
    conc = +dil.dataset.mgPerMl;
    unit = "mg/min";
    outConc.textContent = conc + " mg/ml";
    if (vel > 0) res = (vel * conc) / 60;
  }

  if (type === "ui-min") {
    conc = +dil.dataset.uiPerMl;
    unit = "UI/min";
    outConc.textContent = conc + " UI/ml";
    if (vel > 0) res = (vel * conc) / 60;
  }

if (type === "mg-min") {
  conc = +dil.dataset.mgPerMl;
  unit = "mg/min";
  outConc.textContent = conc + " mg/ml";

  if (vel > 0) {
    res = (vel * conc) / 60;
  }
}

  outRes.textContent =
    res && isFinite(res) ? res.toFixed(2) + " " + unit : "—";
}

// ================= FILTRO DE FARMACOS =================
const qInput = document.getElementById("q");
const grupoSelect = document.getElementById("grupo");
const resetBtn = document.getElementById("btnReset");
const cards = Array.from(document.querySelectorAll(".drug-card"));
const headers = Array.from(document.querySelectorAll("main h2"));

function filtrar() {
  const texto = qInput.value.toLowerCase().trim();
  const grupo = grupoSelect.value;

  cards.forEach(card => {
    const nombre = card.querySelector("h3")?.textContent.toLowerCase() || "";
    const cardGrupo = card.dataset.group;

    const matchTexto = nombre.includes(texto);
    const matchGrupo = grupo === "all" || grupo === cardGrupo;

    card.style.display = matchTexto && matchGrupo ? "" : "none";
  });

  // Ocultar títulos si no hay cards visibles debajo
  headers.forEach(h2 => {
    let visible = false;
    let el = h2.nextElementSibling;

    while (el && !el.matches("h2")) {
      if (el.classList?.contains("drug-card") && el.style.display !== "none") {
        visible = true;
        break;
      }
      el = el.nextElementSibling;
    }

    h2.style.display = visible ? "" : "none";
  });
}

// Eventos
qInput.addEventListener("input", filtrar);
grupoSelect.addEventListener("change", filtrar);

resetBtn.addEventListener("click", () => {
  qInput.value = "";
  grupoSelect.value = "all";
  filtrar();
});

