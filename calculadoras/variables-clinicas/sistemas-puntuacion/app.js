/* =========================
   SCORES
========================= */
function resaltarRangoSOFA(score) {
  const list = document.getElementById("sofaMortalityList");
  if (!list || !Number.isFinite(score)) return;
  list.querySelectorAll("li").forEach(li => {
    li.classList.remove("active-range");
    const min = Number(li.dataset.min);
    const max = Number(li.dataset.max);
    if (Number.isFinite(min) && Number.isFinite(max) && score >= min && score <= max) {
      li.classList.add("active-range");
    }
  });
}

function limpiarRangoSOFA() {
  const list = document.getElementById("sofaMortalityList");
  if (!list) return;
  list.querySelectorAll("li").forEach(li => li.classList.remove("active-range"));
}

function calcularSOFA2() {
  const ids = ["sofa_neuro","sofa_resp","sofa_cv","sofa_hep","sofa_renal","sofa_coag"];
  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      setHTML("resultadoSOFA2","<strong>SOFA-2:</strong> Error de configuración");
      limpiarRangoSOFA();
      return;
    }
    const value = Number(el.value);
    if (!Number.isFinite(value) || value < 0 || value > 4) {
      setHTML("resultadoSOFA2","<strong>SOFA-2:</strong> Seleccione todas las variables");
      limpiarRangoSOFA();
      return;
    }
    total += value;
  }

  let mortalidadTxt = "";
  const list = document.getElementById("sofaMortalityList");
  if (list) {
    const match = Array.from(list.querySelectorAll("li")).find(li => {
      const min = Number(li.dataset.min);
      const max = Number(li.dataset.max);
      return Number.isFinite(min) && Number.isFinite(max) && total >= min && total <= max;
    });
    if (match) {
      const text = match.textContent.trim();
      const idx = text.indexOf(":");
      mortalidadTxt = idx !== -1 ? text.slice(idx + 1).trim() : text;
    }
  }

  setHTML(
    "resultadoSOFA2",
    `<strong>SOFA-2 total:</strong> ${total} / 24${
      mortalidadTxt ? `<br><strong>Mortalidad estimada:</strong> ${mortalidadTxt}` : ""
    }`
  );

  resaltarRangoSOFA(total);
  const report = document.getElementById("sofaMortalityReport");
  if (report) report.style.display = "block";

  if (typeof trackEvent === "function") {
    trackEvent("calculate_sofa2_score", { sofa2_score: total });
  }
}
