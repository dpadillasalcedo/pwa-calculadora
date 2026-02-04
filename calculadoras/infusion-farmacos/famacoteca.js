// =========================================================
// FARMACOTECA UCI – CORE JS
// Cálculo automático de infusiones (sin botones)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // =====================================================
  // Toggle ficha clínica
  // =====================================================
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-sheet");
    if (!btn) return;

    const card = btn.closest(".drug-card");
    if (!card) return;

    const sheet = card.querySelector(".drug-sheet");
    if (!sheet) return;

    const open = !sheet.classList.contains("hidden");
    sheet.classList.toggle("hidden");
    btn.textContent = open ? "Ver ficha" : "Ocultar ficha";
    btn.setAttribute("aria-expanded", String(!open));
  });

  // =====================================================
  // Filtros
  // =====================================================
  const q = document.getElementById("q");
  const grupo = document.getElementById("grupo");
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const cards = Array.from(document.querySelectorAll(".drug-card"));
  const btnReset = document.getElementById("btnReset");

  function applyFilters() {
    const text = (q?.value || "").toLowerCase();
    const g = grupo?.value || "all";

    cards.forEach(card => {
      const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const group = card.dataset.group || "all";

      const okText = !text || name.includes(text);
      const okGroup = g === "all" || g === group;

      card.style.display = (okText && okGroup) ? "" : "none";
    });
  }

  q?.addEventListener("input", applyFilters);

  grupo?.addEventListener("change", () => {
    tabs.forEach(t => t.classList.toggle("is-active", t.dataset.group === grupo.value));
    applyFilters();
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      if (!grupo) return;
      grupo.value = tab.dataset.group;
      tabs.forEach(t => t.classList.toggle("is-active", t === tab));
      applyFilters();
    });
  });

  btnReset?.addEventListener("click", () => {
    if (q) q.value = "";
    if (grupo) grupo.value = "all";
    tabs.forEach(t => t.classList.toggle("is-active", t.dataset.group === "all"));
    applyFilters();
  });

  applyFilters();

  // =====================================================
  // Cálculo automático de infusión
  // =====================================================
  function calcular(card) {
    const peso = card.querySelector(".peso")?.value;
    const dosis = card.querySelector(".dosis")?.value;
    const conc = card.querySelector(".concentracion")?.value;
    const unidad = card.querySelector(".unidad")?.textContent || "";
    const out = card.querySelector(".resultado");

    if (!out) return;

    const p = parseFloat(peso);
    const d = parseFloat(dosis);
    const c = parseFloat(conc);

    if (!d || !c) {
      out.textContent = "—";
      return;
    }

    let mlh = null;

    // ===============================
    // mcg/kg/min
    // ===============================
    if (unidad.includes("mcg/kg/min")) {
      if (!p) return out.textContent = "—";
      mlh = (d * p * 60) / c;
    }

    // ===============================
    // mcg/kg/h
    // ===============================
    else if (unidad.includes("mcg/kg/h")) {
      if (!p) return out.textContent = "—";
      mlh = (d * p) / c;
    }

    // ===============================
    // mcg/min (NO depende de peso)
    // ===============================
    else if (unidad.includes("mcg/min")) {
      mlh = (d * 60) / c;
    }

    // ===============================
    // mg/kg/h → convertir a mcg
    // ===============================
    else if (unidad.includes("mg/kg/h")) {
      if (!p) return out.textContent = "—";
      mlh = (d * p * 1000) / c;
    }

    if (!mlh || !isFinite(mlh)) {
      out.textContent = "—";
      return;
    }

    out.textContent = `${mlh.toFixed(2)} ml/h`;
  }

  // =====================================================
  // Listeners automáticos en inputs
  // =====================================================
  document.querySelectorAll(".drug-card").forEach(card => {
    card.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("input", () => calcular(card));
      inp.addEventListener("change", () => calcular(card));
    });
  });

});
