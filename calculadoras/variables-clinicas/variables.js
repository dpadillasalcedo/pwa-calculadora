/* =========================================================
   VARIABLES CLÍNICAS · MENÚ PRINCIPAL
   JS liviano · sin dependencias
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("variables.js cargado correctamente");

  habilitarNavegacionTeclado();
  marcarTarjetaActiva();
});

/* =========================================================
   ACCESIBILIDAD · NAVEGACIÓN CON TECLADO
========================================================= */

function habilitarNavegacionTeclado() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.setAttribute("tabindex", "0");

    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/* =========================================================
   UX · EFECTO ACTIVO AL CLICK
========================================================= */

function marcarTarjetaActiva() {
  const links = document.querySelectorAll(".menu a");

  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

/* =========================================================
   (OPCIONAL) ANALYTICS / TRACKING
   Preparado para integrar GA, Plausible, etc.
========================================================= */

// function trackModulo(nombre) {
//   console.log("Módulo seleccionado:", nombre);
// }
