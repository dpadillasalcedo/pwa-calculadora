// =========================================================
// FARMACOTECA UCI – UI CORE
// Sin cálculos clínicos (etapa 1)
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

  // =========================
  // Eventos
  // =========================
  if (q) q.addEventListener("input", applyFilters);

  if (grupo) {
    grupo.addEventListener("change", () => {
      const g = grupo.value;
      tabs.forEach(t => {
        t.classList.toggle("is-active", t.dataset.group === g);
      });
      applyFilters();
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const g = tab.dataset.group;
      if (!grupo) return;

      grupo.value = g;
      tabs.forEach(t => t.classList.toggle("is-active", t === tab));
      applyFilters();
    });
  });

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (q) q.value = "";
      if (grupo) grupo.value = "all";

      tabs.forEach(t => {
        t.classList.toggle("is-active", t.dataset.group === "all");
      });

      applyFilters();
    });
  }

  // Inicializar vista
  applyFilters();

});

