/**
 * Critical Care Tools
 * Variables Clínicas – JS base
 * UX + accesibilidad + base para analytics
 */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".menu-card");

  cards.forEach((card) => {
    const link = card.getAttribute("href");

    // Permite click en toda la card
    card.addEventListener("click", () => {
      window.location.href = link;
    });

    // Accesibilidad: navegación con teclado
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = link;
      }
    });

    // Hook para analytics futuro (no rompe nada)
    card.addEventListener("mouseenter", () => {
      card.classList.add("hovered");
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("hovered");
    });
  });
});
