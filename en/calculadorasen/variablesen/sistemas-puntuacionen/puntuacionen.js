/* =====================================================
   ICU SEVERITY SCORES
   SOFA-2 · APACHE II · SAPS II
===================================================== */

function sumSelects(className) {
  let total = 0;
  const elements = document.querySelectorAll("." + className);
  elements.forEach(el => {
    if (el.value !== "") {
      total += parseInt(el.value);
    }
  });
  return total;
}

/* =====================================================
   SOFA-2
===================================================== */

function calcSOFA() {

  const systems = [
    "Neurologic",
    "Respiratory",
    "Cardiovascular",
    "Hepatic",
    "Renal",
    "Coagulation"
  ];

  const selects = document.querySelectorAll(".sofa");

  let total = 0;
  let breakdown = "";

  selects.forEach((el, index) => {
    const value = el.value === "" ? 0 : parseInt(el.value);
    total += value;
    breakdown += `<strong>${systems[index]}:</strong> ${value} points<br>`;
  });

  document.getElementById("sofa_result").innerHTML =
    `<strong>Total SOFA-2 Score: ${total}</strong><br><br>${breakdown}`;

  let mortality;

  if (total <= 6) mortality = "Low mortality risk (<10%)";
  else if (total <= 9) mortality = "Moderate mortality risk (~15–20%)";
  else if (total <= 12) mortality = "High mortality risk (~40–50%)";
  else mortality = "Very high mortality risk (>80%)";

  document.getElementById("sofa_mortality").innerHTML =
    `Estimated ICU mortality: <strong>${mortality}</strong>`;
}

function resetSOFA() {
  document.querySelectorAll(".sofa").forEach(el => el.value = "");
  document.getElementById("sofa_result").innerHTML = "";
  document.getElementById("sofa_mortality").innerHTML = "";
}

/* =====================================================
   APACHE II
===================================================== */

function calcAPACHE() {

  let score = sumSelects("apache");

  const age = document.getElementById("apache_age").value;
  const chronic = document.getElementById("apache_chronic").value;

  if (age !== "") score += parseInt(age);
  if (chronic !== "") score += parseInt(chronic);

  document.getElementById("apache_result").innerHTML =
    `<strong>Total APACHE II Score: ${score}</strong>`;

  /* Approximate hospital mortality estimation */
  let mortality;

  if (score < 10) mortality = "~5% hospital mortality";
  else if (score < 15) mortality = "~10–15% hospital mortality";
  else if (score < 20) mortality = "~25% hospital mortality";
  else if (score < 25) mortality = "~40% hospital mortality";
  else if (score < 30) mortality = "~55% hospital mortality";
  else if (score < 35) mortality = "~75% hospital mortality";
  else mortality = ">85% hospital mortality";

  document.getElementById("apache_mortality").innerHTML =
    `Estimated hospital mortality based on APACHE II: <strong>${mortality}</strong>`;
}

function resetAPACHE() {
  document.querySelectorAll(".apache").forEach(el => el.value = "");
  document.getElementById("apache_age").value = "";
  document.getElementById("apache_chronic").value = "";
  document.getElementById("apache_result").innerHTML = "";
  document.getElementById("apache_mortality").innerHTML = "";
}

/* =====================================================
   SAPS II
   Official logistic equation
===================================================== */

function calcSAPS() {

  let score = sumSelects("saps");

  document.getElementById("saps_result").innerHTML =
    `<strong>Total SAPS II Score: ${score}</strong>`;

  /* Logistic regression equation (original SAPS II model) */

  const logit =
    -7.7631 +
    (0.0737 * score) +
    (0.9971 * Math.log(score + 1));

  const mortality = Math.exp(logit) / (1 + Math.exp(logit));

  const mortalityPercent = (mortality * 100).toFixed(1);

  let interpretation;

  if (mortalityPercent < 10)
    interpretation = "Low predicted mortality";
  else if (mortalityPercent < 30)
    interpretation = "Moderate predicted mortality";
  else if (mortalityPercent < 60)
    interpretation = "High predicted mortality";
  else
    interpretation = "Very high predicted mortality";

  document.getElementById("saps_mortality").innerHTML =
    `Predicted hospital mortality: <strong>${mortalityPercent}%</strong><br>
     Interpretation: <strong>${interpretation}</strong>`;
}

function resetSAPS() {
  document.querySelectorAll(".saps").forEach(el => el.value = "");
  document.getElementById("saps_result").innerHTML = "";
  document.getElementById("saps_mortality").innerHTML = "";
}
