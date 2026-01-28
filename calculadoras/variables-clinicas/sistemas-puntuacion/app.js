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

function calcularAPACHE2() {
  const ids = [
    "ap_temp","ap_map","ap_hr","ap_ph",
    "ap_na","ap_k","ap_cr","ap_gcs",
    "ap_age","ap_chronic"
  ];

  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el || el.value === "") {
      setHTML("resultadoAPACHE2", "<strong>APACHE II:</strong> Complete todas las variables");
      return;
    }
    total += Number(el.value);
  }

  let riesgo =
    total < 10 ? "Bajo"
    : total < 20 ? "Moderado"
    : total < 30 ? "Alto"
    : "Muy alto";

  setHTML(
    "resultadoAPACHE2",
    `<strong>APACHE II total:</strong> ${total}<br>
     <strong>Riesgo estimado:</strong> ${riesgo}`
  );

  if (typeof trackEvent === "function") {
    trackEvent("calculate_apache2_score", { apache2_score: total });
  }
}

function calcularSAPS2() {
  const ids = ["saps_age","saps_hr","saps_map","saps_temp","saps_gcs"];
  let total = 0;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el || el.value === "") {
      setHTML("resultadoSAPS2","<strong>SAPS II:</strong> Complete todas las variables");
      return;
    }
    total += Number(el.value);
  }

  let riesgo =
    total < 30 ? "Bajo"
    : total < 50 ? "Moderado"
    : "Alto";

  setHTML(
    "resultadoSAPS2",
    `<strong>SAPS II total:</strong> ${total}<br>
     <strong>Riesgo estimado:</strong> ${riesgo}`
  );

  if (typeof trackEvent === "function") {
    trackEvent("calculate_saps2_score", { saps2_score: total });
  }
}

