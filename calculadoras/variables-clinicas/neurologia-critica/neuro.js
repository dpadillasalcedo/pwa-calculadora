try {
  console.log("neuro.js cargado correctamente");

  /* =========================================================
     HELPERS
  ========================================================= */
  const $ = (id) => document.getElementById(id);

  const setHTML = (id, html = "") => {
    const el = $(id);
    if (el) el.innerHTML = html;
  };

  const getSelectInt = (id) => {
    const el = $(id);
    if (!el || el.value === "") return null;
    const n = Number(el.value);
    return Number.isFinite(n) ? n : null;
  };

  const safeMax = (a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return b;
    if (b === null) return a;
    return Math.max(a, b);
  };

  const setResultBox = (id, html = "", kind = null) => {
    const el = $(id);
    if (!el) return;
    el.classList.remove("result-ok", "result-bad", "result-warn");
    if (kind) el.classList.add(kind);
    el.innerHTML = html;
  };

 /* =========================================================
     CAM-ICU
  ========================================================= */
  function resetCAMICU() {
    ["cam_step1", "cam_step2", "cam_step3", "cam_step4"].forEach((id) => {
      const el = $(id);
      if (el) el.value = "";
    });

    $("cam_steps34")?.classList.add("hidden");
    $("cam_wait")?.classList.remove("hidden");

    setResultBox("resultadoCAMICU");
    setHTML("interpretacionCAMICU");
  }

  function evaluarCAMICU() {
    const s1 = getSelectInt("cam_step1");
    const s2 = getSelectInt("cam_step2");
    const s3 = getSelectInt("cam_step3");
    const s4 = getSelectInt("cam_step4");

    // Limpieza de salida cada vez que cambia algo
    setResultBox("resultadoCAMICU");
    setHTML("interpretacionCAMICU");

    // Si todavía no se eligió el Paso 1, no evaluamos nada
    if (s1 === null) return;

    // PASO 1 negativo → CAM-ICU negativo automático
    if (s1 === 0) {
      $("cam_steps34")?.classList.add("hidden");
      $("cam_wait")?.classList.add("hidden");

      setResultBox(
        "resultadoCAMICU",
        "<strong>CAM-ICU:</strong> Negativo.",
        "result-ok"
      );
      setHTML(
        "interpretacionCAMICU",
        "Paso 1 negativo (sin inicio agudo o curso fluctuante). Delirium descartado."
      );
      return;
    }

    // PASO 2: si no está respondido, dejamos callout visible y ocultamos 3-4
    if (s2 === null) {
      $("cam_steps34")?.classList.add("hidden");
      $("cam_wait")?.classList.remove("hidden");
      return;
    }

    // Paso 2 negativo → CAM-ICU negativo
    if (s2 === 0) {
      $("cam_steps34")?.classList.add("hidden");
      $("cam_wait")?.classList.add("hidden");

      setResultBox(
        "resultadoCAMICU",
        "<strong>CAM-ICU:</strong> Negativo.",
        "result-ok"
      );
      setHTML(
        "interpretacionCAMICU",
        "Paso 2 negativo (sin inatención). Delirium descartado."
      );
      return;
    }

    // Si Paso 1 + Paso 2 positivos → mostrar Paso 3 y 4
    $("cam_steps34")?.classList.remove("hidden");
    $("cam_wait")?.classList.add("hidden");

    // Si todavía no contestó 3 ni 4, esperamos
    if (s3 === null && s4 === null) return;

    // CAM-ICU positivo si (Paso 3 o Paso 4) es positivo
    if (s3 === 1 || s4 === 1) {
      setResultBox(
        "resultadoCAMICU",
        "<strong>CAM-ICU:</strong> Positivo.",
        "result-bad"
      );
      setHTML(
        "interpretacionCAMICU",
        "Cumple criterios: Paso 1 + Paso 2 y (Paso 3 o Paso 4)."
      );
      return;
    }

    // Si 3 y 4 negativos → CAM-ICU negativo
    if (s3 === 0 && s4 === 0) {
      setResultBox(
        "resultadoCAMICU",
        "<strong>CAM-ICU:</strong> Negativo.",
        "result-ok"
      );
      setHTML(
        "interpretacionCAMICU",
        "Paso 3 y Paso 4 negativos (RASS = 0 y sin pensamiento desorganizado)."
      );
    }
  }

<!-- =========================
     NIHSS
========================= -->
<section id="nihss" class="panel">
  <div class="panel-head">
    <h2>🧠 NIHSS · Stroke Scale</h2>
    <p class="note">
      Completar todos los ítems y luego presionar <strong>Calcular NIHSS</strong>.
      <br />
      Se informará el resultado como:
      <strong>ACV menor</strong>, <strong>ACV moderado</strong>,
      <strong>ACV severo</strong> o
      <strong>ACV menor con síntomas discapacitantes</strong>.
    </p>
  </div>

  <div class="card">
    <div class="nihss-grid">

      <!-- 1a -->
      <label class="field">
        <span>1a. Nivel de conciencia</span>
        <select id="n_1a">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Alerta</option>
          <option value="1">1 = Somnoliento</option>
          <option value="2">2 = Estupor</option>
          <option value="3">3 = Coma</option>
        </select>
      </label>

      <!-- 1b -->
      <label class="field">
        <span>1b. Preguntas LOC (mes / edad)</span>
        <select id="n_1b">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Ambas correctas</option>
          <option value="1">1 = Una correcta</option>
          <option value="2">2 = Ninguna correcta</option>
        </select>
      </label>

      <!-- 1c -->
      <label class="field">
        <span>1c. Órdenes LOC</span>
        <select id="n_1c">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Ambas correctas</option>
          <option value="1">1 = Una correcta</option>
          <option value="2">2 = Ninguna correcta</option>
        </select>
      </label>

      <!-- 2 -->
      <label class="field">
        <span>2. Mirada</span>
        <select id="n_2">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Normal</option>
          <option value="1">1 = Parálisis parcial</option>
          <option value="2">2 = Desviación forzada</option>
        </select>
      </label>

      <!-- 3 -->
      <label class="field">
        <span>3. Campos visuales</span>
        <select id="n_3">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Normal</option>
          <option value="1">1 = Hemianopsia parcial</option>
          <option value="2">2 = Hemianopsia homónima completa</option>
          <option value="3">3 = Ceguera bilateral</option>
        </select>
      </label>

      <!-- 4 -->
      <label class="field">
        <span>4. Parálisis facial</span>
        <select id="n_4">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Normal</option>
          <option value="1">1 = Leve</option>
          <option value="2">2 = Parcial</option>
          <option value="3">3 = Completa</option>
        </select>
      </label>

      <!-- 5a -->
      <label class="field">
        <span>5a. Motor brazo izquierdo</span>
        <select id="n_5a">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Sin caída</option>
          <option value="1">1 = Caída leve</option>
          <option value="2">2 = Contra gravedad</option>
          <option value="3">3 = Sin esfuerzo contra gravedad</option>
          <option value="4">4 = Sin movimiento</option>
        </select>
      </label>

      <!-- 5b -->
      <label class="field">
        <span>5b. Motor brazo derecho</span>
        <select id="n_5b">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Sin caída</option>
          <option value="1">1 = Caída leve</option>
          <option value="2">2 = Contra gravedad</option>
          <option value="3">3 = Sin esfuerzo contra gravedad</option>
          <option value="4">4 = Sin movimiento</option>
        </select>
      </label>

      <!-- 6a -->
      <label class="field">
        <span>6a. Motor pierna izquierda</span>
        <select id="n_6a">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Sin caída</option>
          <option value="1">1 = Caída leve</option>
          <option value="2">2 = Contra gravedad</option>
          <option value="3">3 = Sin esfuerzo contra gravedad</option>
          <option value="4">4 = Sin movimiento</option>
        </select>
      </label>

      <!-- 6b -->
      <label class="field">
        <span>6b. Motor pierna derecha</span>
        <select id="n_6b">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Sin caída</option>
          <option value="1">1 = Caída leve</option>
          <option value="2">2 = Contra gravedad</option>
          <option value="3">3 = Sin esfuerzo contra gravedad</option>
          <option value="4">4 = Sin movimiento</option>
        </select>
      </label>

      <!-- 7 -->
      <label class="field">
        <span>7. Ataxia</span>
        <select id="n_7">
          <option value="">Seleccionar…</option>
          <option value="0">0 = No</option>
          <option value="1">1 = Un miembro</option>
          <option value="2">2 = Dos miembros</option>
        </select>
      </label>

      <!-- 8 -->
      <label class="field">
        <span>8. Sensibilidad</span>
        <select id="n_8">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Normal</option>
          <option value="1">1 = Pérdida leve/moderada</option>
          <option value="2">2 = Pérdida severa</option>
        </select>
      </label>

      <!-- 9 -->
      <label class="field">
        <span>9. Lenguaje (afasia)</span>
        <select id="n_9">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Normal</option>
          <option value="1">1 = Afasia leve/moderada</option>
          <option value="2">2 = Afasia severa</option>
          <option value="3">3 = Afasia global</option>
        </select>
      </label>

      <!-- 10 -->
      <label class="field">
        <span>10. Disartria</span>
        <select id="n_10">
          <option value="">Seleccionar…</option>
          <option value="0">0 = Normal</option>
          <option value="1">1 = Leve/moderada</option>
          <option value="2">2 = Severa</option>
        </select>
      </label>

      <!-- 11 -->
      <label class="field">
        <span>11. Neglect / extinción</span>
        <select id="n_11">
          <option value="">Seleccionar…</option>
          <option value="0">0 = No</option>
          <option value="1">1 = Parcial</option>
          <option value="2">2 = Profundo</option>
        </select>
      </label>

    </div>

    <div class="actions">
      <button type="button" onclick="calcularNIHSS()">Calcular NIHSS</button>
      <button type="button" class="btn-secondary" id="nihss_reset">Reiniciar NIHSS</button>
    </div>

    <div id="resultadoNIHSS" class="resultado" aria-live="polite"></div>
    <div id="interpretacionNIHSS" class="note" aria-live="polite"></div>
  </div>
</section>

<hr />

