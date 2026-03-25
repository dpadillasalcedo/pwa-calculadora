(() => {
  "use strict";

  try {
    console.log("✅ neurologiaen.js loaded successfully");

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
      el.classList.remove("result-ok", "result-bad", "result-warn", "ok", "warn", "bad");
      if (kind) el.classList.add(kind);
      el.innerHTML = html;
    };

    /* =========================================================
       CAM-ICU · STEPWISE LOGIC
       Rule: (1 + 2) and (3 or 4)
    ========================================================= */

    function resetCAMICU() {
      ["cam_step1", "cam_step2", "cam_step3", "cam_step4"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });

      document.getElementById("card_step2")?.classList.add("hidden");
      document.getElementById("cam_steps34")?.classList.add("hidden");
      document.getElementById("cam_wait")?.classList.add("hidden");

      document.getElementById("resultadoCAMICU").innerHTML = "";
      document.getElementById("interpretacionCAMICU").innerHTML = "";
      document.getElementById("resultadoCAMICU").className = "resultado";
    }

    function evaluarCAMICU() {
      const s1 = document.getElementById("cam_step1")?.value;
      const s2 = document.getElementById("cam_step2")?.value;
      const s3 = document.getElementById("cam_step3")?.value;
      const s4 = document.getElementById("cam_step4")?.value;

      const card2 = document.getElementById("card_step2");
      const steps34 = document.getElementById("cam_steps34");
      const wait = document.getElementById("cam_wait");
      const resultado = document.getElementById("resultadoCAMICU");
      const interpretacion = document.getElementById("interpretacionCAMICU");

      resultado.innerHTML = "";
      interpretacion.innerHTML = "";
      resultado.className = "resultado";

      if (!s1) {
        card2?.classList.add("hidden");
        steps34?.classList.add("hidden");
        wait?.classList.add("hidden");
        return;
      }

      if (s1 === "0") {
        card2?.classList.add("hidden");
        steps34?.classList.add("hidden");
        wait?.classList.add("hidden");

        resultado.innerHTML = "<strong>CAM-ICU:</strong> Negative.";
        resultado.className = "resultado result-ok";

        interpretacion.innerHTML =
          "Step 1 is negative (no acute onset or fluctuating course). Delirium excluded.";

        return;
      }

      card2?.classList.remove("hidden");

      if (!s2) {
        steps34?.classList.add("hidden");
        wait?.classList.remove("hidden");
        return;
      }

      wait?.classList.add("hidden");

      if (s2 === "0") {
        steps34?.classList.add("hidden");

        resultado.innerHTML = "<strong>CAM-ICU:</strong> Negative.";
        resultado.className = "resultado result-ok";

        interpretacion.innerHTML =
          "Step 2 is negative (no inattention). Delirium excluded.";

        return;
      }

      steps34?.classList.remove("hidden");

      if (!s3) return;

      if (s3 === "1") {
        resultado.innerHTML = "<strong>CAM-ICU:</strong> Positive.";
        resultado.className = "resultado result-bad";

        interpretacion.innerHTML =
          "Step 3 is positive (RASS different from 0).";

        return;
      }

      if (!s4) return;

      if (s4 === "1") {
        resultado.innerHTML = "<strong>CAM-ICU:</strong> Positive.";
        resultado.className = "resultado result-bad";

        interpretacion.innerHTML =
          "Step 4 is positive (disorganized thinking).";

        return;
      }

      resultado.innerHTML = "<strong>CAM-ICU:</strong> Negative.";
      resultado.className = "resultado result-ok";

      interpretacion.innerHTML =
        "Step 3 and Step 4 are negative (RASS = 0 and no disorganized thinking).";
    }

    document.getElementById("camicu")?.addEventListener("change", (e) => {
      if (e.target.tagName === "SELECT" && e.target.id.startsWith("cam_step")) {
        evaluarCAMICU();
      }
    });

    document.getElementById("cam_reset")?.addEventListener("click", resetCAMICU);

    /* =========================================================
       NIHSS
    ========================================================= */

    function resetNIHSS() {
      [
        "n_1a","n_1b","n_1c","n_2","n_3","n_4",
        "n_5a","n_5b","n_6a","n_6b",
        "n_7","n_8","n_9","n_10","n_11"
      ].forEach((id) => {
        const el = $(id);
        if (el) el.value = "";
      });

      setResultBox("resultadoNIHSS");
      setHTML("interpretacionNIHSS");
    }

    function calcularNIHSS() {
      let total = 0;

      document.querySelectorAll('#nihss select[id^="n_"]').forEach((sel) => {
        const v = Number(sel.value);
        if (Number.isFinite(v)) total += v;
      });

      const hemianopia = getSelectInt("n_3") === 2;
      const neglect = (getSelectInt("n_11") ?? 0) >= 1;
      const aphasia = (getSelectInt("n_9") ?? 0) >= 1;

      const motorArm = safeMax(getSelectInt("n_5a"), getSelectInt("n_5b"));
      const motorLeg = safeMax(getSelectInt("n_6a"), getSelectInt("n_6b"));
      const motorAgainstGravityDeficit = motorArm >= 2 || motorLeg >= 2;

      const disabling =
        hemianopia || neglect || aphasia || motorAgainstGravityDeficit;

      let classification = "Severe stroke";
      let cssClass = "result-bad";

      if (total <= 4) {
        classification = disabling
          ? "Minor stroke with disabling symptoms"
          : "Minor stroke";
        cssClass = disabling ? "result-warn" : "result-ok";
      } else if (total <= 15) {
        classification = "Moderate stroke";
        cssClass = "result-warn";
      }

      setResultBox(
        "resultadoNIHSS",
        `<strong>NIHSS:</strong> ${total} · ${classification}`,
        cssClass
      );

      const findings = [];
      if (hemianopia) findings.push("Homonymous hemianopia");
      if (neglect) findings.push("Neglect");
      if (aphasia) findings.push("Aphasia");
      if (motorAgainstGravityDeficit) findings.push("Motor deficit against gravity");

      setHTML(
        "interpretacionNIHSS",
        findings.length
          ? `<strong>Disabling symptoms:</strong> ${findings.join(", ")}.`
          : ""
      );
    }

    /* =========================================================
       GLASGOW COMA SCALE
    ========================================================= */

    function initGlasgow() {
      const gcsEye = document.getElementById("gcs_eye");
      const gcsVerbal = document.getElementById("gcs_verbal");
      const gcsMotor = document.getElementById("gcs_motor");
      const gcsCalc = document.getElementById("gcs_calc");
      const gcsReset = document.getElementById("gcs_reset");

      const resultadoGCS = document.getElementById("resultadoGCS");
      const interpretacionGCS = document.getElementById("interpretacionGCS");

      if (gcsCalc) {
        gcsCalc.addEventListener("click", () => {
          const eye = parseInt(gcsEye.value, 10);
          const verbal = parseInt(gcsVerbal.value, 10);
          const motor = parseInt(gcsMotor.value, 10);

          if (isNaN(eye) || isNaN(verbal) || isNaN(motor)) {
            resultadoGCS.textContent = "Please complete all variables.";
            interpretacionGCS.textContent = "";
            resultadoGCS.className = "resultado result-warn";
            return;
          }

          const total = eye + verbal + motor;

          resultadoGCS.textContent = `Total Glasgow: ${total} (E${eye} V${verbal} M${motor})`;

          let interpretation = "";
          let cssClass = "";

          if (total >= 13) {
            interpretation = "Mild injury.";
            cssClass = "result-ok";
          } else if (total >= 9) {
            interpretation = "Moderate injury.";
            cssClass = "result-warn";
          } else {
            interpretation = "Severe injury. Consider airway protection.";
            cssClass = "result-bad";
          }

          interpretacionGCS.textContent = interpretation;
          resultadoGCS.className = `resultado ${cssClass}`;
        });
      }

      if (gcsReset) {
        gcsReset.addEventListener("click", () => {
          gcsEye.value = "";
          gcsVerbal.value = "";
          gcsMotor.value = "";
          resultadoGCS.textContent = "";
          interpretacionGCS.textContent = "";
          resultadoGCS.className = "resultado";
        });
      }
    }

    /* =========================================================
       INIT
    ========================================================= */

    function init() {
      const camSection = $("camicu");
      if (camSection) {
        camSection.addEventListener("change", (e) => {
          const t = e.target;
          if (t && t.tagName === "SELECT" && t.id.startsWith("cam_step")) {
            evaluarCAMICU();
          }
        });
      }

      $("cam_reset")?.addEventListener("click", resetCAMICU);
      $("nihss_reset")?.addEventListener("click", resetNIHSS);
      $("nihss_calc")?.addEventListener("click", calcularNIHSS);

      window.evaluarCAMICU = evaluarCAMICU;
      window.resetCAMICU = resetCAMICU;
      window.calcularNIHSS = calcularNIHSS;
      window.resetNIHSS = resetNIHSS;

      resetCAMICU();
      resetNIHSS();
      initGlasgow();

      console.log("✅ neurologiaen.js initialized");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }

  } catch (err) {
    console.error("❌ Critical error in neurologiaen.js:", err);
  }
})();
