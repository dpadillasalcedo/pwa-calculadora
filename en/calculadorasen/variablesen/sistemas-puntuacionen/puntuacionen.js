/* ==========================================
   ICU Severity Scores (EN) - SOFA-2 / APACHE II / SAPS II
   Critical Care Tools
========================================== */

/* ---------- Small helpers ---------- */
function _num(v) {
  if (v === "" || v === null || typeof v === "undefined") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function _sumSelectValues(selector) {
  let sum = 0;
  let filled = 0;
  document.querySelectorAll(selector).forEach((sel) => {
    const n = _num(sel.value);
    if (n !== null) {
      sum += n;
      filled += 1;
    }
  });
  return { sum, filled };
}

function _setText(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function _clearText(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = "";
}

function _resetSelects(selector) {
  document.querySelectorAll(selector).forEach((sel) => {
    sel.value = "";
  });
}

function _ga(eventName, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", eventName, {
      language: "en",
      page_path: window.location.pathname,
      ...params
    });
  }
}

/* ==========================================
   SOFA-2
========================================== */

function calcSOFA() {
  const { sum, filled } = _sumSelectValues("select.sofa");

  if (filled === 0) {
    _setText("sofa_result", "Please select at least one SOFA-2 component.");
    _clearText("sofa_mortality");
    return;
  }

  _setText("sofa_result", `<strong>SOFA-2 total:</strong> ${sum}`);

  // Educational, coarse interpretation (avoid overpromising exact mortality)
  let note = "";
  if (sum <= 1) note = "Low organ dysfunction burden.";
  else if (sum <= 4) note = "Mild organ dysfunction.";
  else if (sum <= 9) note = "Moderate organ dysfunction.";
  else note = "Severe organ dysfunction. Interpret in full clinical context.";

  _setText("sofa_mortality", note);

  _ga("sofa2_calculated", { score: sum, components_filled: filled });
}

function resetSOFA() {
  _resetSelects("select.sofa");
  _clearText("sofa_result");
  _clearText("sofa_mortality");
  _ga("sofa2_reset");
}

/* ==========================================
   APACHE II (your simplified version)
   NOTE: Your current HTML only includes 일부 variables + age + chronic.
   This JS calculates the sum of what exists on the page.
========================================== */

function calcAPACHE() {
  const phys = _sumSelectValues("select.apache");
  const age = _num(document.getElementById("apache_age")?.value);
  const chronic = _num(document.getElementById("apache_chronic")?.value);

  // Require at least something meaningful
  if (phys.filled === 0 && age === null && chronic === null) {
    _setText("apache_result", "Please complete at least one APACHE II field.");
    _clearText("apache_mortality");
    return;
  }

  const total = phys.sum + (age ?? 0) + (chronic ?? 0);

  _setText("apache_result", `<strong>APACHE II (partial) total:</strong> ${total}`);

  // Educational note: because page doesn't include all 12 physiologic variables
  const note =
    "This is a partial APACHE II sum based on the fields included on this page. For clinical use, ensure all required APACHE II variables are collected.";
  _setText("apache_mortality", note);

  _ga("apache2_calculated", {
    score: total,
    phys_filled: phys.filled,
    age_points: age ?? 0,
    chronic_points: chronic ?? 0
  });
}

function resetAPACHE() {
  _resetSelects("select.apache");
  const ageSel = document.getElementById("apache_age");
  const chrSel = document.getElementById("apache_chronic");
  if (ageSel) ageSel.value = "";
  if (chrSel) chrSel.value = "";
  _clearText("apache_result");
  _clearText("apache_mortality");
  _ga("apache2_reset");
}

/* ==========================================
   SAPS II (your simplified version)
   NOTE: Your current HTML includes only a subset of SAPS II variables.
   This JS calculates the sum of what exists on the page.
========================================== */

function calcSAPS() {
  const { sum, filled } = _sumSelectValues("select.saps");

  if (filled === 0) {
    _setText("saps_result", "Please select at least one SAPS II variable.");
    _clearText("saps_mortality");
    return;
  }

  _setText("saps_result", `<strong>SAPS II (partial) total:</strong> ${sum}`);

  const note =
    "This is a partial SAPS II sum based on the fields included on this page. The full SAPS II mortality model requires all variables.";
  _setText("saps_mortality", note);

  _ga("saps2_calculated", { score: sum, variables_filled: filled });
}

function resetSAPS() {
  _resetSelects("select.saps");
  _clearText("saps_result");
  _clearText("saps_mortality");
  _ga("saps2_reset");
}

/* ==========================================
   Page-level tracking (optional + light)
========================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Track module card usage patterns (buttons)
  document.querySelectorAll("button.primary").forEach((btn) => {
    btn.addEventListener("click", () => {
      _ga("severity_primary_action_click", { label: btn.textContent.trim() });
    });
  });

  // Scroll depth: 50% and 90%
  const marks = [50, 90];
  const fired = new Set();

  window.addEventListener("scroll", () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((window.scrollY / docHeight) * 100);

    marks.forEach((m) => {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        _ga("severity_scroll_depth", { percent: m });
      }
    });
  });
});

/* Expose functions globally for inline onclick */
window.calcSOFA = calcSOFA;
window.resetSOFA = resetSOFA;
window.calcAPACHE = calcAPACHE;
window.resetAPACHE = resetAPACHE;
window.calcSAPS = calcSAPS;
window.resetSAPS = resetSAPS;
