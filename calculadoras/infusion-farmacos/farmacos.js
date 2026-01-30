// =========================================================
// Vancomicina en infusión continua (24 hs)
// Fórmulas extraídas del Excel:
// eGFR = 186.2 * (Cr^-1.154) * (Edad^-0.203) * (sexoFactor)
// sexoFactor = 1 (v) ó 0.742 (m)
// CLvanco = 0.029 * eGFR + 0.94
// Mantenimiento (g/24h) = CLvanco * Meta(mg/L) * 24 / 1000
// Carga (g) = Peso * 25 / 1000 (máx 2 g)
// =========================================================

function round(n, d = 2) {
  if (!Number.isFinite(n)) return "—";
  const p = Math.pow(10, d);
  return (Math.round(n * p) / p).toFixed(d);
}

function show(el, html) {
  el.innerHTML = html;
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
  el.innerHTML = "";
}

function validarInputs({ cr, edad, sexo, meta, peso }) {
  const errs = [];

  if (!Number.isFinite(cr) || cr <= 0) errs.push("Ingresar una creatinina válida (> 0).");
  if (!Number.isFinite(edad) || edad <= 0) errs.push("Ingresar una edad válida (> 0).");
  if (sexo !== "v" && sexo !== "m") errs.push("Seleccionar sexo (v/m).");
  if (!Number.isFinite(meta) || meta <= 0) errs.push("Ingresar una meta de vancocinemia válida (> 0).");
  if (!Number.isFinite(peso) || peso <= 0) errs.push("Ingresar un peso válido (> 0).");

  return errs;
}

function calcular() {
  const cr = parseFloat(document.getElementById("cr").value);
  const edad = parseFloat(document.getElementById("edad").value);
  const sexo = document.getElementById("sexo").value;
  const meta = parseFloat(document.getElementById("meta").value);
  const peso = parseFloat(document.getElementById("peso").value);

  const errores = document.getElementById("errores");
  const resEgfr = document.getElementById("res-egfr");
  const resCl = document.getElementById("res-cl");
  const resMant = document.getElementById("res-mant");
  const resCarga = document.getElementById("res-carga");
  const resNotas = document.getElementById("res-notas");

  // limpiar outputs previos
  hide(errores);
  resEgfr.textContent = "";
  resCl.textContent = "";
  resMant.textContent = "";
  resCarga.textContent = "";
  resNotas.textContent = "";

  const errs = validarInputs({ cr, edad, sexo, meta, peso });
  if (errs.length) {
    show(errores, `<strong>Revisar:</strong><br>${errs.map(e => `• ${e}`).join("<br>")}`);
    return;
  }

  const sexoFactor = (sexo === "v") ? 1 : 0.742;

  // eGFR (MDRD)
  const egfr = 186.2 * Math.pow(cr, -1.154) * Math.pow(edad, -0.203) * sexoFactor;

  // Clearence vancomicina (L/h)
  const clVanco = 0.029 * egfr + 0.94;

  // Mantenimiento en g/24h
  const mantG24 = clVanco * meta * 24 / 1000;

  // Carga 25 mg/kg (g), max 2 g
  const cargaTeorica = peso * 25 / 1000;
  const cargaFinal = Math.min(cargaTeorica, 2);

  resEgfr.innerHTML = `eGFR estimado (MDRD): <strong>${round(egfr, 1)}</strong> mL/min/1.73m²`;
  resCl.innerHTML = `Clearance estimado de vancomicina: <strong>${round(clVanco, 2)}</strong> L/h`;
  resMant.innerHTML = `Dosis de mantenimiento (infusión continua 24 h): <strong>${round(mantG24, 2)}</strong> g/24 h`;
  resCarga.innerHTML = `Dosis de carga (25 mg/kg): <strong>${round(cargaFinal, 2)}</strong> g`;

  const notas = [];
  if (cargaTeorica > 2) {
    notas.push("Se aplicó tope de dosis de carga: <strong>máximo 2 g</strong>.");
  }
  notas.push("Interpretar junto a niveles, función renal dinámica y situación clínica.");

  resNotas.innerHTML = notas.join("<br>");
}

function limpiar() {
  ["cr", "edad", "meta", "peso"].forEach(id => (document.getElementById(id).value = ""));
  document.getElementById("sexo").value = "";

  hide(document.getElementById("errores"));
  document.getElementById("res-egfr").textContent = "";
  document.getElementById("res-cl").textContent = "";
  document.getElementById("res-mant").textContent = "";
  document.getElementById("res-carga").textContent = "";
  document.getElementById("res-notas").textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnCalcular").addEventListener("click", calcular);
  document.getElementById("btnLimpiar").addEventListener("click", limpiar);
});
