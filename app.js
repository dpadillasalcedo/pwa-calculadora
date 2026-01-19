/**************************************
 * UTILIDADES
 **************************************/
function n(v) {
  return isNaN(v) ? 0 : v;
}

/**************************************
 * BLOQUE 1 – GASTO CARDÍACO
 **************************************/

// GC MANUAL (input directo)
function gastoCardiacoManual(gc_manual) {
  return n(gc_manual); // L/min
}

// GC ECOCARDIOGRÁFICO
function areaLVOT(diametro_cm) {
  return Math.PI * Math.pow(diametro_cm / 2, 2); // cm2
}

function volumenSistolico(diametro_cm, vti_cm) {
  return areaLVOT(diametro_cm) * n(vti_cm); // mL
}

function gastoCardiacoEco(diametro_cm, vti_cm, fc) {
  const vs = volumenSistolico(diametro_cm, vti_cm);
  return (vs * n(fc)) / 1000; // L/min
}

/**************************************
 * BLOQUE 2 – OXIGENACIÓN (O2)
 **************************************/

function contenidoO2(hb, sat, po2) {
  // sat en %, po2 en mmHg
  return (1.34 * n(hb) * n(sat) / 100) + (0.003 * n(po2));
}

function deltaContenidoO2(ca, cv) {
  return ca - cv;
}

function DO2(gc, ca) {
  return n(gc) * ca * 10; // mL O2/min
}

function VO2(gc, ca, cv) {
  return n(gc) * (ca - cv) * 10; // mL O2/min
}

function ERO2(vo2, do2) {
  return do2 > 0 ? vo2 / do2 : 0;
}

/**************************************
 * BLOQUE 3 – CO2
 **************************************/

function deltaPv_aCO2(pvco2, paco2) {
  return n(pvco2) - n(paco2); // mmHg
}

function contenidoCO2(hco3, pco2) {
  return n(hco3) + (0.03 * n(pco2));
}

function deltaContenidoCO2(cv, ca) {
  return cv - ca;
}

/**************************************
 * BLOQUE 4 – ÍNDICES COMBINADOS
 **************************************/

function cocienteCO2_O2(deltaCO2, deltaO2) {
  return deltaO2 > 0 ? deltaCO2 / deltaO2 : 0;
}

function interpretarCociente(valor) {
  if (valor < 1) return "Metabolismo aeróbico";
  if (valor >= 1 && valor < 1.4) return "Umbral anaeróbico";
  return "Producción anaeróbica de CO₂";
}

/**************************************
 * BLOQUE 5 – VENTILACIÓN MECÁNICA
 **************************************/

function ventilacionMinuto(vt_ml, fr) {
  return (n(vt_ml) * n(fr)) / 1000; // L/min
}

function ajusteVentilacion(valorActual, paco2Actual, paco2Deseada) {
  return n(valorActual) * (n(paco2Actual) / n(paco2Deseada));
}

/**************************************
 * FUNCIÓN PRINCIPAL
 **************************************/

function calcularTodo() {

  // ===== INPUTS BÁSICOS =====
  const hb = n(document.getElementById("hb").value);
  const saO2 = n(document.getElementById("saO2").value);
  const svO2 = n(document.getElementById("svO2").value);
  const paO2 = n(document.getElementById("paO2").value);
  const pvO2 = n(document.getElementById("pvO2").value);

  const paCO2 = n(document.getElementById("paCO2").value);
  const pvCO2 = n(document.getElementById("pvCO2").value);
  const hco3a = n(document.getElementById("hco3a").value);
  const hco3v = n(document.getElementById("hco3v").value);

  // ===== GC =====
  const gc_manual = n(document.getElementById("gc_manual").value);
  const d_lvot = n(document.getElementById("d_lvot").value);
  const vti = n(document.getElementById("vti").value);
  const fc = n(document.getElementById("fc").value);

  const modoGC = document.querySelector('input[name="modoGC"]:checked').value;

  const gc_eco = gastoCardiacoEco(d_lvot, vti, fc);
  const gc = (modoGC === "manual") ? gc_manual : gc_eco;

  // ===== O2 =====
  const caO2 = contenidoO2(hb, saO2, paO2);
  const cvO2 = contenidoO2(hb, svO2, pvO2);
  const deltaO2 = deltaContenidoO2(caO2, cvO2);

  const do2 = DO2(gc, caO2);
  const vo2 = VO2(gc, caO2, cvO2);
  const ero2 = ERO2(vo2, do2);

  // ===== CO2 =====
  const deltaCO2 = deltaPv_aCO2(pvCO2, paCO2);
  const caCO2 = contenidoCO2(hco3a, paCO2);
  const cvCO2 = contenidoCO2(hco3v, pvCO2);

  // ===== ÍNDICE =====
  const cociente = cocienteCO2_O2(deltaCO2, deltaO2);
  const interpretacion = interpretarCociente(cociente);

  // ===== OUTPUT =====
  document.getElementById("resultado").innerHTML = `
    <b>GC utilizado:</b> ${gc.toFixed(2)} L/min<br><br>

    <b>CaO₂:</b> ${caO2.toFixed(2)} mL/dL<br>
    <b>CvO₂:</b> ${cvO2.toFixed(2)} mL/dL<br>
    <b>ΔO₂:</b> ${deltaO2.toFixed(2)} mL/dL<br><br>

    <b>DO₂:</b> ${do2.toFixed(0)} mL/min<br>
    <b>VO₂:</b> ${vo2.toFixed(0)} mL/min<br>
    <b>ERO₂:</b> ${(ero2 * 100).toFixed(1)} %<br><br>

    <b>ΔPv–aCO₂:</b> ${deltaCO2.toFixed(1)} mmHg<br>
    <b>ΔCO₂ / ΔO₂:</b> ${cociente.toFixed(2)}<br>
    <b>Interpretación:</b> ${interpretacion}
  `;
}
