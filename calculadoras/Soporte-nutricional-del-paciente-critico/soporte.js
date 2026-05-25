/* =========================
   REQUERIMIENTO CALÓRICO DIARIO
========================= */

function calculateIndirectCalorimetry() {
  const vo2 = validNumber($("vo2IC").value);
  const vco2 = validNumber($("vco2IC").value);

  if (!vo2 || !vco2) {
    $("kcalIC").textContent = "—";
    return;
  }

  const kcalDay = ((3.941 * vo2) + (1.106 * vco2)) * 1440;

  $("kcalIC").textContent =
    `${round10(kcalDay)} kcal/día`;
}

function oxygenContent(hb, saturation, po2) {
  return (1.34 * hb * saturation) + (0.0031 * po2);
}

function calculateFick() {
  const gc = validNumber($("gcFick").value);
  const hb = validNumber($("hbFick").value);
  const sao2 = validNumber($("sao2Fick").value);
  const svo2 = validNumber($("svo2Fick").value);
  const pao2 = validNumber($("pao2Fick").value);
  const pvo2 = validNumber($("pvo2Fick").value);
  const rq = validNumber($("rqFick").value) || 0.85;

  if (!gc || !hb || !sao2 || !svo2 || !pao2 || !pvo2) {
    $("vo2FickResult").textContent = "—";
    $("kcalFick").textContent = "—";
    return;
  }

  const caO2 = oxygenContent(hb, sao2 / 100, pao2);
  const cvO2 = oxygenContent(hb, svo2 / 100, pvo2);

  const vo2MlMin = gc * (caO2 - cvO2) * 10;
  const vo2LMin = vo2MlMin / 1000;
  const vco2LMin = vo2LMin * rq;

  const kcalDay =
    ((3.941 * vo2LMin) + (1.106 * vco2LMin)) * 1440;

  $("vo2FickResult").textContent =
    `VO₂ estimado: ${round0(vo2MlMin)} ml/min`;

  $("kcalFick").textContent =
    `${round10(kcalDay)} kcal/día`;
}

function calculatePredictiveCalories() {
  const peso = validNumber($("pesoPredictivo").value);

  if (!peso) {
    $("kcal20").textContent = "—";
    $("kcal25").textContent = "—";
    $("kcal30").textContent = "—";
    return;
  }

  $("kcal20").textContent =
    `20 kcal/kg: ${round10(peso * 20)} kcal/día`;

  $("kcal25").textContent =
    `25 kcal/kg: ${round10(peso * 25)} kcal/día`;

  $("kcal30").textContent =
    `30 kcal/kg: ${round10(peso * 30)} kcal/día`;
}

function runCalorieRequirementCalculation() {
  calculateIndirectCalorimetry();
  calculateFick();
  calculatePredictiveCalories();
}

document.addEventListener("DOMContentLoaded", () => {
  [
    "vo2IC",
    "vco2IC",
    "gcFick",
    "hbFick",
    "sao2Fick",
    "svo2Fick",
    "pao2Fick",
    "pvo2Fick",
    "rqFick",
    "pesoPredictivo"
  ].forEach(id => {
    const el = $(id);
    if (el) {
      el.addEventListener("input", runCalorieRequirementCalculation);
    }
  });
});


/* =========================
   CriticalCareTools – Nutrición Enteral
========================= */

const ENTERALES = [
  {
    nombre: "Yeviti",
    kcalMl: 1.0,
    protMl: 0.04
  },
  {
    nombre: "Jevity",
    kcalMl: 1.2,
    protMl: 0.05
  },
  {
    nombre: "Protison",
    kcalMl: 1.28,
    protMl: 0.075
  },
  {
    nombre: "Intense",
    kcalMl: 1.25,
    protMl: 0.10
  },
  {
    nombre: "Supportan",
    kcalMl: 1.5,
    protMl: 0.10
  },
  {
    nombre: "Energy",
    kcalMl: 1.5,
    protMl: 0.06
  },
  {
    nombre: "Alterna Peptid",
    kcalMl: 1.5,
    protMl: 0.068
  },
  {
    nombre: "Glucerna 1.5",
    kcalMl: 1.5,
    protMl: 0.0825
  }
];

const $ = id => document.getElementById(id);

const round0 = value => Math.round(value);
const round10 = value => Math.round(value / 10) * 10;

function validNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function clearResults() {
  $("kcalMin").textContent = "—";
  $("kcalMax").textContent = "—";
  $("protMin").textContent = "—";
  $("protMax").textContent = "—";

  $("resultadosEnterales").innerHTML =
    "Ingrese el peso ideal para calcular.";
}

function calcularRequerimientos(peso) {
  return {
    kcalMin: round10(peso * 20),
    kcalMax: round10(peso * 30),
    protMin: round0(peso * 1.2),
    protMax: round0(peso * 1.5)
  };
}

function calcularOpcionesEnterales(req) {
  const restriccionVolumen =
    $("restriccionVolumen")?.checked || false;

  const targetKcal = req.kcalMax;
  const targetProtein = req.protMax;

  const opciones = ENTERALES.map(formula => {
    const volumen = targetKcal / formula.kcalMl;
    const kcalAportadas = volumen * formula.kcalMl;
    const proteinaAportada = volumen * formula.protMl;

    const deficitProteina =
      Math.max(0, targetProtein - proteinaAportada);

    const excesoProteina =
      Math.max(0, proteinaAportada - targetProtein);

    return {
      nombre: formula.nombre,
      kcalMl: formula.kcalMl,
      prot100: formula.protMl * 100,
      volumen,
      kcalAportadas,
      proteinaAportada,
      deficitProteina,
      excesoProteina
    };
  });

  opciones.sort((a, b) => {
    if (restriccionVolumen) {
      if (a.volumen !== b.volumen) {
        return a.volumen - b.volumen;
      }

      if (a.deficitProteina !== b.deficitProteina) {
        return a.deficitProteina - b.deficitProteina;
      }

      return b.proteinaAportada - a.proteinaAportada;
    }

    if (a.deficitProteina !== b.deficitProteina) {
      return a.deficitProteina - b.deficitProteina;
    }

    if (a.volumen !== b.volumen) {
      return a.volumen - b.volumen;
    }

    return b.proteinaAportada - a.proteinaAportada;
  });

  return opciones;
}

function renderOpciones(opciones) {
  const mejores = opciones.slice(0, 5);

  let html = "";

  mejores.forEach((opcion, index) => {
    const deficitTexto =
      opcion.deficitProteina > 0
        ? `-${round0(opcion.deficitProteina)} g`
        : "0 g";

    const badge =
      index === 0
        ? `<span class="badge-best">Mejor opción</span>`
        : `<span class="badge-alt">Alternativa</span>`;

    html += `
      <article class="enteral-option ${index === 0 ? "best-option" : ""}">
        <div class="enteral-header">
          <h3>${opcion.nombre}</h3>
          ${badge}
        </div>

        <div class="enteral-data">
          <p><b>Concentración:</b> ${opcion.kcalMl} kcal/ml</p>
          <p><b>Proteína:</b> ${opcion.prot100.toFixed(1)} g/100 ml</p>
          <p><b>Volumen diario:</b> ${round0(opcion.volumen)} ml/día</p>
          <p><b>Kcal aportadas:</b> ${round0(opcion.kcalAportadas)} kcal/día</p>
          <p><b>Proteína aportada:</b> ${round0(opcion.proteinaAportada)} g/día</p>
          <p><b>Déficit proteico:</b> ${deficitTexto}</p>
        </div>
      </article>
    `;
  });

  $("resultadosEnterales").innerHTML = html;
}

function runCalculation() {
  const pesoIdeal = validNumber($("pesoIdeal").value);

  if (!pesoIdeal) {
    clearResults();
    return;
  }

  const req = calcularRequerimientos(pesoIdeal);

  $("kcalMin").textContent = `${req.kcalMin} kcal/día`;
  $("kcalMax").textContent = `${req.kcalMax} kcal/día`;

  $("protMin").textContent = `${req.protMin} g/día`;
  $("protMax").textContent = `${req.protMax} g/día`;

  const opciones = calcularOpcionesEnterales(req);

  renderOpciones(opciones);
}

$("pesoIdeal").addEventListener("input", runCalculation);
$("restriccionVolumen").addEventListener("change", runCalculation);
