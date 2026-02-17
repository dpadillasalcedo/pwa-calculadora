/* ==========================================
   Mechanical Ventilation - EN Script
   Critical Care Tools
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const currentPath = window.location.pathname;

  /* ==========================================
     1️⃣ PBW CALCULATION (ARDSnet)
  ========================================== */

  const pbwBtn = document.querySelector("button[onclick='calcularPesoIdeal()']");
  const heightInput = document.getElementById("height");
  const sexSelect = document.getElementById("sex");
  const pbwResult = document.getElementById("resultadoPeso");

  if (pbwBtn) {
    pbwBtn.onclick = function () {

      const height = parseFloat(heightInput.value);
      const sex = sexSelect.value;

      if (!height || !sex) {
        pbwResult.innerHTML = "Please enter height and sex.";
        return;
      }

      let pbw;

      if (sex === "male") {
        pbw = 50 + 0.91 * (height - 152.4);
      } else {
        pbw = 45.5 + 0.91 * (height - 152.4);
      }

      pbwResult.innerHTML =
        `<strong>Predicted Body Weight:</strong> ${pbw.toFixed(1)} kg`;

      sendGA("pbw_calculated");
    };
  }

  /* ==========================================
     2️⃣ PaCO2 ADJUSTMENT
  ========================================== */

  const pco2Btn = document.querySelector("button[onclick='ajustarPCO2()']");
  const resultadoPCO2 = document.getElementById("resultadoPCO2");
  const resultadoPCO2Detalle = document.getElementById("resultadoPCO2Detalle");

  if (pco2Btn) {
    pco2Btn.onclick = function () {

      const pco2Act = parseFloat(document.getElementById("pco2Act").value);
      const pco2Des = parseFloat(document.getElementById("pco2Des").value);
      const vminActual = parseFloat(document.getElementById("vmin_actual").value);

      if (!pco2Act || !pco2Des || !vminActual) {
        resultadoPCO2.innerHTML = "Please complete required fields.";
        return;
      }

      const newVmin = (pco2Act * vminActual) / pco2Des;

      resultadoPCO2.innerHTML =
        `<strong>New Estimated Minute Ventilation:</strong> ${newVmin.toFixed(2)} L/min`;

      resultadoPCO2Detalle.innerHTML =
        "Clinical adjustment should consider patient tolerance and acid-base status.";

      sendGA("paco2_adjustment_calculated");
    };
  }

  /* ==========================================
     3️⃣ Driving Pressure
  ========================================== */

  const deltaBtn = document.querySelector("button[onclick='calcularDeltaP()']");
  const resultadoDeltaP = document.getElementById("resultadoDeltaP");
  const interpretacionDeltaP = document.getElementById("interpretacionDeltaP");

  if (deltaBtn) {
    deltaBtn.onclick = function () {

      const pplat = parseFloat(document.getElementById("pplat").value);
      const peep = parseFloat(document.getElementById("peep").value);

      if (!pplat || !peep) {
        resultadoDeltaP.innerHTML = "Please complete required fields.";
        return;
      }

      const deltaP = pplat - peep;

      resultadoDeltaP.innerHTML =
        `<strong>Driving Pressure (ΔP):</strong> ${deltaP.toFixed(1)} cmH₂O`;

      if (deltaP > 15) {
        interpretacionDeltaP.innerHTML =
          "ΔP > 15 cmH₂O is associated with increased risk of lung injury.";
      } else {
        interpretacionDeltaP.innerHTML =
          "ΔP ≤ 15 cmH₂O is generally considered lung-protective.";
      }

      sendGA("driving_pressure_calculated");
    };
  }

  /* ==========================================
     4️⃣ Scroll Depth Tracking
  ========================================== */

  let scrollMarks = [25, 50, 75, 100];
  let triggered = [];

  window.addEventListener("scroll", function () {

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    scrollMarks.forEach(mark => {
      if (scrollPercent >= mark && !triggered.includes(mark)) {
        triggered.push(mark);
        sendGA("ventilation_scroll_" + mark);
      }
    });

  });

  /* ==========================================
     Helper GA function
  ========================================== */

  function sendGA(eventName) {
    if (typeof gtag === "function") {
      gtag("event", eventName, {
        event_category: "ventilation_module",
        page_path: currentPath,
        language: "en"
      });
    }
  }

});

