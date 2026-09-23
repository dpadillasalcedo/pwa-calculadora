/* Estimación de macronutrientes para NP magistral adulta.
   Independiente de soporte.js. */
(function () {
  "use strict";

  const form = document.getElementById("np-form");
  if (!form) return;

  const resultado = document.getElementById("np-resultado");
  const error = document.getElementById("np-error");

  const formato = (n, d = 1) =>
    n.toLocaleString("es-ES", {
      maximumFractionDigits: d,
      minimumFractionDigits: d
    });

  function leer(id, obligatorio = true) {
    const campo = document.getElementById(id);
    const texto = campo.value.trim().replace(",", ".");

    if (!texto && !obligatorio) return 0;
    if (!texto) {
      throw new Error("Completa todos los campos obligatorios.");
    }

    const numero = Number(texto);

    if (
      !Number.isFinite(numero) ||
      numero < 0 ||
      (obligatorio && numero === 0)
    ) {
      throw new Error(
        "Introduce números válidos y mayores que cero en los campos obligatorios."
      );
    }

    return numero;
  }

  function calcular() {
    const kg = leer("np-peso");
    const energia = leer("np-kcal");
    const proteinaKg = leer("np-proteina");
    const lipidoKg = leer("np-lipidos", false);
    const volumen = leer("np-volumen");
    const horas = leer("np-horas");

    const aaPct = leer("np-aa-pct");
    const glucosaPct = leer("np-glucosa-pct");
    const lipidosPct = leer("np-lipidos-pct");
    const lipidosKcalMl = leer("np-lipidos-kcal");
    const kcalGlucosa = leer("np-glucosa-kcal");

    const otrosKcal = leer("np-otros-kcal", false);
    const aditivosMl = leer("np-aditivos-ml", false);

    if (horas > 24) {
      throw new Error(
        "El tiempo de infusión debe estar entre 1 y 24 horas."
      );
    }

    if (otrosKcal >= energia) {
      throw new Error(
        "Las calorías externas deben ser inferiores a la meta energética."
      );
    }

    const aaG = kg * proteinaKg;
    const lipidosG = kg * lipidoKg;

    const aaKcal = aaG * 4;
    const aaMl = (aaG * 100) / aaPct;

    const lipidosMl = (lipidosG * 100) / lipidosPct;
    const lipidosKcal = lipidosMl * lipidosKcalMl;

    const glucosaKcal =
      energia - otrosKcal - aaKcal - lipidosKcal;

    if (glucosaKcal <= 0) {
      throw new Error(
        "La meta energética no alcanza para los aminoácidos y lípidos prescritos; revisa los objetivos."
      );
    }

    const glucosaG = glucosaKcal / kcalGlucosa;
    const glucosaMl = (glucosaG * 100) / glucosaPct;

    const usadosMl =
      aaMl + glucosaMl + lipidosMl + aditivosMl;

    const aguaMl = volumen - usadosMl;

    if (aguaMl < -0.001) {
      throw new Error(
        `Los componentes suman ${formato(usadosMl, 0)} mL y superan el volumen objetivo de ${formato(volumen, 0)} mL. Aumenta el volumen o revisa las concentraciones y metas.`
      );
    }

    const gir = (glucosaG * 1000) / (kg * horas * 60);
    const npKcal = aaKcal + glucosaKcal + lipidosKcal;
    const nitrogeno = aaG / 6.25;
    const npNoProteicas = glucosaKcal + lipidosKcal;

    const avisoGir =
      gir > 5
        ? '<p class="np-warning"><strong>Revisar glucosa:</strong> la velocidad supera 5 mg/kg/min, límite señalado por ESPEN para pacientes críticos.</p>'
        : "";

    resultado.innerHTML = `
      <h3>Estimación de la fórmula diaria</h3>

      <div class="np-results-grid">
        <div>
          <span>Aminoácidos</span>
          <strong>${formato(aaG)} g · ${formato(aaMl, 0)} mL</strong>
        </div>

        <div>
          <span>Glucosa</span>
          <strong>${formato(glucosaG)} g · ${formato(glucosaMl, 0)} mL</strong>
        </div>

        <div>
          <span>Lípidos</span>
          <strong>${formato(lipidosG)} g · ${formato(lipidosMl, 0)} mL</strong>
        </div>

        <div>
          <span>Agua para completar volumen*</span>
          <strong>${formato(Math.max(0, aguaMl), 0)} mL</strong>
        </div>

        <div>
          <span>Volumen total / velocidad</span>
          <strong>${formato(volumen, 0)} mL · ${formato(volumen / horas)} mL/h</strong>
        </div>

        <div>
          <span>Glucosa / velocidad</span>
          <strong>${formato(glucosaG)} g/día · ${formato(gir, 2)} mg/kg/min</strong>
        </div>

        <div>
          <span>Energía de NP</span>
          <strong>${formato(npKcal, 0)} kcal/día · ${formato(npKcal / kg)} kcal/kg</strong>
        </div>

        <div>
          <span>Energía externa / total</span>
          <strong>${formato(otrosKcal, 0)} / ${formato(npKcal + otrosKcal, 0)} kcal/día</strong>
        </div>

        <div>
          <span>Proteína / nitrógeno</span>
          <strong>${formato(proteinaKg, 2)} g/kg · ${formato(nitrogeno)} g N</strong>
        </div>

        <div>
          <span>kcal no proteicas / g N</span>
          <strong>${formato(npNoProteicas / nitrogeno, 0)} : 1</strong>
        </div>
      </div>

      ${avisoGir}

      <p class="np-footnote">
        *Volumen geométrico aproximado: no contempla contracción de mezcla
        ni desplazamientos adicionales. Los ${formato(aditivosMl, 0)} mL
        de aditivos declarados se descontaron del agua. No valida
        osmolaridad, compatibilidad, estabilidad, electrolitos ni vía
        de administración.
      </p>
    `;

    resultado.hidden = false;
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    error.hidden = true;
    resultado.hidden = true;

    try {
      calcular();
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    }
  });

  form.addEventListener("reset", function () {
    resultado.hidden = true;
    error.hidden = true;
  });
})();
