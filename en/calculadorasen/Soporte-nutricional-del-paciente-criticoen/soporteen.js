/* =========================
   DAILY CALORIC REQUIREMENT
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
    `${round10(kcalDay)} kcal/day`;
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
    `Estimated VO₂: ${round0(vo2MlMin)} ml/min`;

  $("kcalFick").textContent =
    `${round10(kcalDay)} kcal/day`;
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
    `20 kcal/kg: ${round10(peso * 20)} kcal/day`;

  $("kcal25").textContent =
    `25 kcal/kg: ${round10(peso * 25)} kcal/day`;

  $("kcal30").textContent =
    `30 kcal/kg: ${round10(peso * 30)} kcal/day`;
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
   CriticalCareTools – Enteral Nutrition
========================= */

const ENTERALES = [
  { nombre: "Yeviti", kcalMl: 1.0, protMl: 0.04 },
  { nombre: "Jevity", kcalMl: 1.2, protMl: 0.05 },
  { nombre: "Protison", kcalMl: 1.28, protMl: 0.075 },
  { nombre: "Intense", kcalMl: 1.25, protMl: 0.10 },
  { nombre: "Supportan", kcalMl: 1.5, protMl: 0.10 },
  { nombre: "Energy", kcalMl: 1.5, protMl: 0.06 },
  { nombre: "Alterna Peptid", kcalMl: 1.5, protMl: 0.068 },
  { nombre: "Glucerna 1.5", kcalMl: 1.5, protMl: 0.0825 }
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
    "Enter ideal body weight to calculate.";
}

function calcularRequerimientos(peso) {
  return {
    kcalMin: round10(peso * 20),
    kcalMax: round10(peso * 30),
    protMin: round0(peso * 1.2),
    protMax: round0(peso * 1.5),
    protRestriccion: round0(peso * 1.1)
  };
}

function crearOpcionSimple(formula, targetKcal, req) {
  const volumen = targetKcal / formula.kcalMl;
  const proteina = volumen * formula.protMl;

  return {
    tipo: "simple",
    nombre: formula.nombre,
    detalle: `${formula.nombre} 100%`,
    volumen,
    kcal: targetKcal,
    proteina,
    deficitMin: Math.max(0, req.protMin - proteina),
    deficitRestriccion: Math.max(0, req.protRestriccion - proteina),
    excesoProt: Math.max(0, proteina - req.protMax),
    dentroRango: proteina >= req.protMin && proteina <= req.protMax,
    formulas: [
      {
        nombre: formula.nombre,
        volumen
      }
    ]
  };
}

function crearOpcionCombinada(f1, f2, targetKcal, req, proporcion1) {
  const kcal1 = targetKcal * proporcion1;
  const kcal2 = targetKcal - kcal1;

  const vol1 = kcal1 / f1.kcalMl;
  const vol2 = kcal2 / f2.kcalMl;

  const proteina =
    vol1 * f1.protMl +
    vol2 * f2.protMl;

  const volumen = vol1 + vol2;

  return {
    tipo: "combined",
    nombre: `${f1.nombre} + ${f2.nombre}`,
    detalle: `${f1.nombre} ${Math.round(proporcion1 * 100)}% + ${f2.nombre} ${Math.round((1 - proporcion1) * 100)}%`,
    volumen,
    kcal: targetKcal,
    proteina,
    deficitMin: Math.max(0, req.protMin - proteina),
    deficitRestriccion: Math.max(0, req.protRestriccion - proteina),
    excesoProt: Math.max(0, proteina - req.protMax),
    dentroRango: proteina >= req.protMin && proteina <= req.protMax,
    formulas: [
      {
        nombre: f1.nombre,
        volumen: vol1
      },
      {
        nombre: f2.nombre,
        volumen: vol2
      }
    ]
  };
}

function generarOpciones(formulas, targetKcal, req) {
  let opciones = [];

  formulas.forEach(formula => {
    opciones.push(
      crearOpcionSimple(formula, targetKcal, req)
    );
  });

  for (let i = 0; i < formulas.length; i++) {
    for (let j = i + 1; j < formulas.length; j++) {
      [0.25, 0.5, 0.75].forEach(proporcion => {
        opciones.push(
          crearOpcionCombinada(
            formulas[i],
            formulas[j],
            targetKcal,
            req,
            proporcion
          )
        );
      });
    }
  }

  return opciones;
}

function calcularOpcionesEnterales(req) {
  const restriccionVolumen =
    $("restriccionVolumen")?.checked || false;

  const targetKcal = req.kcalMax;

  let formulasDisponibles = ENTERALES;

  if (restriccionVolumen) {
    formulasDisponibles = ENTERALES.filter(formula =>
      formula.protMl >= 0.075
    );
  }

  let opciones =
    generarOpciones(
      formulasDisponibles,
      targetKcal,
      req
    );

  opciones.sort((a, b) => {
    if (restriccionVolumen) {
      const aCumpleMin =
        a.proteina >= req.protRestriccion;

      const bCumpleMin =
        b.proteina >= req.protRestriccion;

      if (aCumpleMin !== bCumpleMin) {
        return aCumpleMin ? -1 : 1;
      }

      if (a.volumen !== b.volumen) {
        return a.volumen - b.volumen;
      }

      return b.proteina - a.proteina;
    }

    if (a.dentroRango !== b.dentroRango) {
      return a.dentroRango ? -1 : 1;
    }

    if (a.deficitMin !== b.deficitMin) {
      return a.deficitMin - b.deficitMin;
    }

    if (a.excesoProt !== b.excesoProt) {
      return a.excesoProt - b.excesoProt;
    }

    return a.volumen - b.volumen;
  });

  return {
    opciones,
    restriccionVolumen,
    targetKcal,
    req
  };
}

function renderOpciones(data) {
  const mejores = data.opciones.slice(0, 5);

  let html = "";

  mejores.forEach((opcion, index) => {
    const deficitTexto = data.restriccionVolumen
      ? opcion.deficitRestriccion > 0
        ? `-${round0(opcion.deficitRestriccion)} g`
        : "0 g"
      : opcion.deficitMin > 0
        ? `-${round0(opcion.deficitMin)} g`
        : "0 g";

    const badge =
      index === 0
        ? `<span class="badge-best">Best option</span>`
        : `<span class="badge-alt">Alternative</span>`;

    const detalleFormulas = opcion.formulas
      .map(formula => `${formula.nombre}: ${round0(formula.volumen)} ml/day`)
      .join("<br>");

    html += `
      <article class="enteral-option ${index === 0 ? "best-option" : ""}">
        <div class="enteral-header">
          <h3>${opcion.nombre}</h3>
          ${badge}
        </div>

        <div class="enteral-data">
          <p><b>Type:</b> ${opcion.tipo === "simple" ? "Single formula" : "Combination"}</p>
          <p><b>Regimen:</b> ${opcion.detalle}</p>
          <p><b>Total volume:</b> ${round0(opcion.volumen)} ml/day</p>
          <p><b>Calories provided:</b> ${round0(opcion.kcal)} kcal/day</p>
          <p><b>Protein provided:</b> ${round0(opcion.proteina)} g/day</p>
          <p><b>Protein deficit:</b> ${deficitTexto}</p>
          <p><b>Distribution:</b><br>${detalleFormulas}</p>
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

  $("kcalMin").textContent = `${req.kcalMin} kcal/day`;
  $("kcalMax").textContent = `${req.kcalMax} kcal/day`;

  $("protMin").textContent = `${req.protMin} g/day`;
  $("protMax").textContent = `${req.protMax} g/day`;

  const data = calcularOpcionesEnterales(req);

  renderOpciones(data);
}

$("pesoIdeal").addEventListener("input", runCalculation);
$("restriccionVolumen").addEventListener("change", runCalculation);
