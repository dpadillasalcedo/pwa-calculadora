/* =========================
   HELPERS
========================= */
function getNum(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

/* =========================
   ANION GAP CORREGIDO
========================= */
function calcularAnionGapCorregido() {
  const na = getNum("ab_na");
  const k = getNum("ab_k");
  const cl = getNum("ab_cl");
  const hco3 = getNum("ab_hco3");
  let alb = getNum("ab_alb");

  if ([na, k, cl, hco3].some(v => v === null)) {
    setText("resultadoAnionGap", "Complete todos los valores");
    return;
  }

  if (!Number.isFinite(alb) || alb <= 0) alb = 4;

  const ag = (na + k) - (cl + hco3);
  const agCorr = ag + 2.5 * (4 - alb);

  setHTML(
    "resultadoAnionGap",
    `<strong>AG:</strong> ${ag.toFixed(1)} mEq/L<br>
     <strong>AG corregido:</strong> ${agCorr.toFixed(1)} mEq/L`
  );
}

/* =========================
   DELTA / DELTA
========================= */
function calcularDeltaGap() {
  const ag = getNum("dd_ag");
  const hco3 = getNum("dd_hco3");

  const AG_NORMAL = 12;
  const HCO3_NORMAL = 24;

  if (ag === null || hco3 === null) {
    setText("resultadoDeltaGap", "—");
    setText("interpretacionDeltaGap", "Complete Anion Gap y HCO₃.");
    return;
  }

  if (ag <= 0 || hco3 <= 0) {
    setText("resultadoDeltaGap", "No interpretable");
    setText("interpretacionDeltaGap", "Valores no fisiológicos.");
    return;
  }

  const deltaAG = ag - AG_NORMAL;
  const deltaHCO3 = HCO3_NORMAL - hco3;

  if (deltaHCO3 <= 0) {
    setText("resultadoDeltaGap", "No interpretable");
    setText("interpretacionDeltaGap", "HCO₃ no disminuido.");
    return;
  }

  const deltaDelta = deltaAG / deltaHCO3;

  if (!Number.isFinite(deltaDelta)) {
    setText("resultadoDeltaGap", "—");
    setText("interpretacionDeltaGap", "No se pudo calcular.");
    return;
  }

  let interp =
    deltaDelta < 1
      ? "Sugiere otra acidosis metabólica asociada. Evaluar hipercloremia u otras causas."
      : deltaDelta <= 2
        ? "Acidosis metabólica con anion gap elevado pura."
        : "Sugiere alcalosis metabólica asociada.";

  setHTML(
    "resultadoDeltaGap",
    `<strong>Δ/Δ:</strong> ${deltaDelta.toFixed(2)}`
  );
  setText("interpretacionDeltaGap", interp);
}


/* =========================
   SODIO CORREGIDO
========================= */
function calcularSodioCorregido() {
  const na = getNum("na_meas");
  const glu = getNum("glu");

  if (na === null || glu === null) {
    setText("resultadoNaCorregido", "Complete Na y glucosa");
    return;
  }

  const nac = na + (glu > 100 ? 1.6 * ((glu - 100) / 100) : 0);

  setHTML(
    "resultadoNaCorregido",
    `<strong>Na corregido:</strong> ${nac.toFixed(1)} mEq/L`
  );
}

/* =========================
   CALCIO CORREGIDO
========================= */
function calcularCalcioCorregido() {
  const ca = getNum("ca_meas");
  let alb = getNum("alb_meas");

  if (ca === null) {
    setText("resultadoCaCorregido", "Complete calcio");
    return;
  }

  if (!Number.isFinite(alb) || alb <= 0) alb = 4;

  const cac = ca + 0.8 * (4 - alb);

  setHTML(
    "resultadoCaCorregido",
    `<strong>Ca corregido:</strong> ${cac.toFixed(2)} mg/dL`
  );
}

/* =========================
   HELPERS
========================= */
function getNum(id) {
  const el = document.getElementById(id);
  if (!el || el.value === "") return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
}

function getSel(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function esc(x) {
  return String(x).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

/* =========================
   CORE
========================= */
function analizarHiponatremia() {
  const na = getNum("s_na");
  const glu = getNum("s_glu");
  const bun = getNum("s_bun");
  const osmMeas = getNum("s_osm_meas");

  const clinVol = getSel("clin_vol");     // hypo | euvo | hyper | ""
  const diur = getSel("diuretics");       // yes | no | ""

  const uosm = getNum("u_osm");
  const una  = getNum("u_na");
  const ucl  = getNum("u_cl");
  const uk   = getNum("u_k"); // opcional

  // Limpieza salida
  setHTML("alerta", "");
  setHTML("resumen", "");
  setHTML("resumen_note", "");
  setHTML("p1", "");
  setHTML("p2", "");
  setHTML("p3", "");
  setHTML("p4", "");
  setHTML("p5", "");

  // Validación mínima
  if (na === null) {
    setHTML("alerta", "⚠️ Ingrese al menos Na sérico para iniciar el algoritmo.");
    return;
  }
  if (na <= 0) {
    setHTML("alerta", "⚠️ Na sérico no es válido.");
    return;
  }

  // Paso 1: Na corregido por glucosa (1.6 mEq/L por cada 100 mg/dL sobre 100)
  let nac = na;
  let p1 = `<strong>Na sérico:</strong> ${na.toFixed(1)} mEq/L. `;
  if (glu !== null && glu > 100) {
    nac = na + 1.6 * ((glu - 100) / 100);
    p1 += `<strong>Na corregido por glucosa:</strong> ${nac.toFixed(1)} mEq/L (ajuste 1.6/100).`;
  } else if (glu !== null) {
    p1 += `Glucosa ${glu.toFixed(0)} mg/dL → sin corrección relevante.`;
  } else {
    p1 += `Glucosa no ingresada → no se calcula Na corregido.`;
  }
  setHTML("p1", p1);

  // Alertas rápidas (no terapéuticas, solo bandera)
  if (na < 120) {
    setHTML("alerta", "🚩 Na < 120 mEq/L: si hay síntomas neurológicos, considerar manejo urgente según protocolos.");
  }

  // Paso 2: Osmolalidad / tonicidad
  // Estimada: 2*Na + Glu/18 + BUN/2.8 (si faltan, se omiten)
  const gluTerm = (glu !== null) ? (glu / 18) : null;
  const bunTerm = (bun !== null) ? (bun / 2.8) : null;

  let osmEst = 2 * na;
  let osmEstDetail = `2×Na = ${(2 * na).toFixed(0)}`;
  if (gluTerm !== null) { osmEst += gluTerm; osmEstDetail += ` + Glu/18 (${gluTerm.toFixed(0)})`; }
  if (bunTerm !== null) { osmEst += bunTerm; osmEstDetail += ` + BUN/2.8 (${bunTerm.toFixed(0)})`; }

  const osmUsada = (osmMeas !== null) ? osmMeas : osmEst;

  let tonicidad = "";
  if (osmUsada >= 295) tonicidad = "hipertónica";
  else if (osmUsada >= 275) tonicidad = "isotónica";
  else tonicidad = "hipotónica";

  let p2 = `<strong>Osmolalidad ${osmMeas !== null ? "medida" : "estimada"}:</strong> ${osmUsada.toFixed(0)} mOsm/kg → <strong>${tonicidad}</strong>.`;
  if (osmMeas === null) p2 += ` <span class="muted">(Estimación: ${esc(osmEstDetail)})</span>`;
  p2 += `<br><span class="muted">Referencias: hipotónica &lt; 275 · isotónica 275–295 · hipertónica &gt; 295 mOsm/kg.</span>`;
  setHTML("p2", p2);

  // Conclusión rápida para no-hipotónica
  if (tonicidad === "isotónica") {
    setHTML("p3", "Si la osmolalidad es isotónica, pensar en pseudohiponatremia (hiperlipidemia/hiperproteinemia) según método de medición.");
    setHTML("p4", "Ionograma urinario es menos útil en pseudohiponatremia; confirmar con osmolalidad medida y laboratorio.");
    setHTML("p5", "Conclusión sugerida: <strong>pseudohiponatremia</strong> si osm normal y clínica concordante.");
    setResumen(nac, tonicidad, uosm, una, ucl, clinVol, diur);
    return;
  }

  if (tonicidad === "hipertónica") {
    setHTML("p3", "Si la osmolalidad es hipertónica, pensar en hiponatremia translocacional (p. ej. hiperglucemia, manitol). Corregir Na por glucosa y tratar causa.");
    setHTML("p4", "Ionograma urinario puede orientar etiología concomitante, pero primero corregir causa osmótica.");
    setHTML("p5", "Conclusión sugerida: <strong>hiponatremia hipertónica</strong> (translocacional) según osm y glucosa/solutos.");
    setResumen(nac, tonicidad, uosm, una, ucl, clinVol, diur);
    return;
  }

  // Paso 3: Hipotónica → Uosm
  let p3 = "";
  if (uosm === null) {
    p3 = "Para hiponatremia hipotónica, se recomienda ingresar <strong>Uosm</strong> para definir si ADH está suprimida (&lt;100) o activa (≥100).";
    setHTML("p3", p3);
    setHTML("p4", "Ingrese Uosm, UNa y UCl para continuar el algoritmo urinario.");
    setHTML("p5", "Conclusión sugerida: <strong>hiponatremia hipotónica</strong>; faltan datos urinarios para subclasificar.");
    setResumen(nac, tonicidad, uosm, una, ucl, clinVol, diur);
    return;
  }

  if (uosm < 100) {
    p3 = `<strong>Uosm:</strong> ${uosm.toFixed(0)} mOsm/kg (<strong>&lt; 100</strong>) → ADH probablemente suprimida.`;
    p3 += `<br>Esto sugiere exceso de agua libre con baja carga de solutos: <strong>polidipsia primaria</strong> o <strong>baja ingesta de solutos</strong> (p. ej. “tea & toast”, beer potomania).`;
    setHTML("p3", p3);
    setHTML("p4", "En este escenario, UNa/UCl son menos determinantes. Revisar ingesta de agua, dieta, y osm sérica medida si hay duda.");
    setHTML("p5", "Conclusión sugerida: <strong>hiponatremia hipotónica con ADH suprimida</strong> (polidipsia/baja ingesta de solutos).");
    setResumen(nac, tonicidad, uosm, una, ucl, clinVol, diur);
    return;
  }

  p3 = `<strong>Uosm:</strong> ${uosm.toFixed(0)} mOsm/kg (<strong>≥ 100</strong>) → ADH activa / incapacidad para excretar agua libre.`;
  setHTML("p3", p3);

  // Paso 4: UNa/UCl + volemia
  let p4 = "";
  if (una === null || ucl === null) {
    p4 = "Con Uosm ≥ 100 se recomienda ingresar <strong>UNa</strong> y <strong>UCl</strong> para orientar el mecanismo.";
    setHTML("p4", p4);
    setHTML("p5", "Conclusión sugerida: <strong>hiponatremia hipotónica con ADH activa</strong>; faltan UNa/UCl para subclasificar.");
    setResumen(nac, tonicidad, uosm, una, ucl, clinVol, diur);
    return;
  }

  // Umbral práctico UNa
  const UNA_LOW = 30;

  const unaCat = (una < UNA_LOW) ? "bajo" : "alto";
  const uclCat = (ucl < UNA_LOW) ? "bajo" : "alto";

  p4 += `<strong>UNa:</strong> ${una.toFixed(0)} mEq/L (${unaCat}; umbral ~${UNA_LOW}) · `;
  p4 += `<strong>UCl:</strong> ${ucl.toFixed(0)} mEq/L (${uclCat}; umbral ~${UNA_LOW}).`;

  if (uk !== null) {
    p4 += `<br><strong>UK:</strong> ${uk.toFixed(0)} mEq/L (dato adicional).`;
  }

  // Interpretación combinada (prudente)
  const diurText = (diur === "yes")
    ? "<br><span class='warn'>Nota: diuréticos recientes pueden elevar UNa/UCl y confundir el patrón.</span>"
    : "";

  // Reglas de decisión simplificadas + clínica
  let diferencial = [];

  // Hipovolémico
  if (clinVol === "hypo") {
    if (una < UNA_LOW) {
      // pérdidas extrarrenales típicas; UCl ayuda
      if (ucl < UNA_LOW) {
        diferencial.push("Pérdidas extrarrenales con depleción de volumen (p. ej. vómito con <strong>UCl bajo</strong>, diarrea).");
      } else {
        diferencial.push("Depleción de volumen con UNa bajo; revisar uso de soluciones, bicarbonato, y contexto clínico.");
      }
    } else {
      diferencial.push("Pérdidas renales de sodio (diuréticos, nefropatía perdedora de sal, insuficiencia suprarrenal).");
    }
  }

  // Euvolémico
  if (clinVol === "euvo") {
    if (una >= UNA_LOW) {
      diferencial.push("Sugerente de <strong>SIADH</strong> (si función tiroidea/suprarrenal normal y no diuréticos).");
      diferencial.push("Considerar <strong>hipotiroidismo</strong> e <strong>insuficiencia suprarrenal</strong> (descartar).");
    } else {
      diferencial.push("Euvolemia con UNa bajo: revisar ingesta de solutos, consumo de agua, y posibilidad de hipovolemia “oculta”.");
    }
  }

  // Hipervolémico
  if (clinVol === "hyper") {
    if (una < UNA_LOW) {
      diferencial.push("Estados edematosos con bajo volumen arterial efectivo: <strong>IC</strong>, <strong>cirrosis</strong>, <strong>síndrome nefrótico</strong>.");
    } else {
      diferencial.push("Hipervolémico con UNa alto: considerar <strong>IR</strong> / nefropatía con incapacidad de retener sodio o diuréticos.");
    }
  }

  // Si volemia no seleccionada, dar reglas generales
  if (!clinVol) {
    if (una < UNA_LOW) {
      diferencial.push("UNa bajo sugiere bajo volumen arterial efectivo (hipovolemia real o estados edematosos).");
      if (ucl < UNA_LOW) diferencial.push("UCl bajo refuerza pérdidas extrarrenales / vómito o depleción de cloro.");
    } else {
      diferencial.push("UNa alto sugiere SIADH, insuficiencia suprarrenal, hipotiroidismo, pérdidas renales o diuréticos.");
    }
  }

  p4 += diurText;
  setHTML("p4", p4);

  // Paso 5: conclusión
  let p5 = "<strong>Conclusión sugerida:</strong> hiponatremia hipotónica con ADH activa (Uosm ≥ 100).";
  if (diferencial.length) {
    p5 += "<br><br><strong>Diferenciales más probables según patrón:</strong><ul>";
    diferencial.slice(0, 5).forEach(d => { p5 += `<li>${d}</li>`; });
    p5 += "</ul>";
  }

  // Tips cortos para usar UCl
  p5 += `<div class="muted" style="margin-top:10px;">
    Pista útil: en hipovolemia por vómito, suele haber <strong>UCl bajo</strong> incluso si UNa puede variar. En diuréticos, UNa/UCl pueden estar artificialmente altos.
  </div>`;

  setHTML("p5", p5);

  setResumen(nac, tonicidad, uosm, una, ucl, clinVol, diur);
}

function setResumen(nac, tonicidad, uosm, una, ucl, clinVol, diur) {
  const volMap = { hypo:"Hipovolémico", euvo:"Euvolémico", hyper:"Hipervolémico" };
  const volTxt = clinVol ? volMap[clinVol] : "No especificado";
  const diurTxt = (diur === "yes") ? "Sí" : (diur === "no" ? "No" : "No especificado");

  const parts = [];
  parts.push(`<strong>Na corregido:</strong> ${Number.isFinite(nac) ? nac.toFixed(1) : "—"} mEq/L`);
  parts.push(`<strong>Tonicidad:</strong> ${tonicidad}`);
  parts.push(`<strong>Volemia:</strong> ${volTxt}`);
  parts.push(`<strong>Diuréticos:</strong> ${diurTxt}`);

  setHTML("resumen", parts.join(" · "));

  const uParts = [];
  if (Number.isFinite(uosm)) uParts.push(`Uosm ${uosm.toFixed(0)} (ref &lt;100 ADH off)`);
  if (Number.isFinite(una))  uParts.push(`UNa ${una.toFixed(0)} (umbral ~30)`);
  if (Number.isFinite(ucl))  uParts.push(`UCl ${ucl.toFixed(0)} (umbral ~30)`);

  setHTML(
    "resumen_note",
    uParts.length
      ? uParts.join(" · ")
      : "Sin datos urinarios suficientes para subclasificar."
  );
}

/* =========================
   EXPONER
========================= */
window.analizarHiponatremia = analizarHiponatremia;

/* =========================
   🔑 EXPONER FUNCIONES
========================= */
window.calcularAnionGapCorregido = calcularAnionGapCorregido;
window.calcularDeltaGap = calcularDeltaGap;
window.calcularSodioCorregido = calcularSodioCorregido;
window.calcularCalcioCorregido = calcularCalcioCorregido;
