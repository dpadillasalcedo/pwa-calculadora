// =========================================================
// FARMACOTECA UCI – UI + CÁLCULO AUTOMÁTICO
// Sin botones · cálculo en tiempo real
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // Toggle ficha clínica
  // =========================
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-sheet");
    if (!btn) return;

    const card = btn.closest(".drug-card");
    if (!card) return;

    const sheet = card.querySelector(".drug-sheet");
    if (!sheet) return;

    const isOpen = !sheet.classList.contains("hidden");

    sheet.classList.toggle("hidden");
    btn.setAttribute("aria-expanded", String(!isOpen));
    btn.textContent = isOpen ? "Ver ficha" : "Ocultar ficha";
  });

  // =========================
  // Filtros
  // =========================
  const q = document.getElementById("q");
  const grupo = document.getElementById("grupo");
  const btnReset = document.getElementById("btnReset");
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const cards = Array.from(document.querySelectorAll(".drug-card"));

  function applyFilters() {
    const query = (q?.value || "").trim().toLowerCase();
    const g = grupo?.value || "all";

    cards.forEach(card => {
      const name = card.querySelector("h3")?.textContent?.toLowerCase() || "";
      const group = card.getAttribute("data-group") || "all";

      const okName = !query || name.includes(query);
      const okGroup = (g === "all") || (group === g);

      card.style.display = (okName && okGroup) ? "" : "none";
    });
  }

  if (q) q.addEventListener("input", applyFilters);

  if (grupo) {
    grupo.addEventListener("change", () => {
      const g = grupo.value;
      tabs.forEach(t => t.classList.toggle("is-active", t.dataset.group === g));
      applyFilters();
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      if (!grupo) return;
      grupo.value = tab.dataset.group;
      tabs.forEach(t => t.classList.toggle("is-active", t === tab));
      applyFilters();
    });
  });

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (q) q.value = "";
      if (grupo) grupo.value = "all";
      tabs.forEach(t => t.classList.toggle("is-active", t.dataset.group === "all"));
      applyFilters();
    });
  }

  // =========================
  // CÁLCULO AUTOMÁTICO
  // =========================
  function calcular(card) {
    const peso = parseFloat(card.querySelector(".peso")?.value);
    const dosis = parseFloat(card.querySelector(".dosis")?.value);
    const conc = parseFloat(card.querySelector(".concentracion")?.value);
    const unidad = card.querySelector(".unidad")?.textContent || "";
    const out = card.querySelector(".resultado");

    if (!peso || !dosis || !conc || !out) {
      if (out) out.textContent = "—";
      return;
    }

    let mlh = 0;

    // mcg/kg/min → ml/h
    if (unidad.includes("mcg/kg/min")) {
      mlh = (dosis * peso * 60) / conc;
    }

    // mcg/kg/h → ml/h
    if (unidad.includes("mcg/kg/h")) {
      mlh = (dosis * peso) / conc;
    }

    if (!Number.isFinite(mlh)) {
      out.textContent = "—";
      return;
    }

    out.textContent = `${mlh.toFixed(2)} ml/h`;
  }

  // =========================
  // Escuchar inputs (sin botones)
  // =========================
  cards.forEach(card => {
    card.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => calcular(card));
      el.addEventListener("change", () => calcular(card));
    });
  });

  // Inicializar
  applyFilters();

});
