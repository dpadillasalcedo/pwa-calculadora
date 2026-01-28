/**
 * Critical Care Tools
 * Variables Clínicas – JS base
 * UX + accesibilidad + base para analytics
 */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".menu-card");

  cards.forEach((card) => {
    const link = card.getAttribute("href");

    // Accesibilidad: permitir activación con teclado (Enter / Space)
    card.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        window.location.href = link;
      }
    });

    // Hook limpio para analytics futuro
    card.addEventListener("click", () => {
      // Ejemplo futuro:
      // analytics.track("menu_card_click", { destination: link });
    });
  });
});
