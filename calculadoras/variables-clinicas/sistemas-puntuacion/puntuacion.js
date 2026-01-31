/* ========================= SOFA-2 ========================= */
function calcSOFA(){
  let score = 0;

  const gcs = +document.getElementById("sofa_gcs").value;
  if(gcs <= 5) score += 4;
  else if(gcs <= 8) score += 3;
  else if(gcs <= 12) score += 2;
  else if(gcs <= 14) score += 1;

  const pafi = +document.getElementById("sofa_pafi").value;
  const vent = +document.getElementById("sofa_vent").value;
  if(pafi <= 75 && vent) score += 4;
  else if(pafi <= 150 && vent) score += 3;
  else if(pafi <= 225) score += 2;
  else if(pafi <= 300) score += 1;

  const map = +document.getElementById("sofa_map").value;
  const vaso = +document.getElementById("sofa_vaso").value;
  if(vaso > 0.4) score += 4;
  else if(vaso > 0.2) score += 3;
  else if(vaso > 0) score += 2;
  else if(map < 70) score += 1;

  const bili = +document.getElementById("sofa_bili").value;
  if(bili > 12) score += 4;
  else if(bili > 6) score += 3;
  else if(bili > 2) score += 2;
  else if(bili > 1.2) score += 1;

  const rrt = +document.getElementById("sofa_rrt").value;
  if(rrt) score += 4;
  else{
    const crea = +document.getElementById("sofa_crea").value;
    if(crea > 3.5) score += 3;
    else if(crea > 2) score += 2;
    else if(crea > 1.2) score += 1;
  }

  const plt = +document.getElementById("sofa_platelets").value;
  if(plt <= 50) score += 4;
  else if(plt <= 80) score += 3;
  else if(plt <= 100) score += 2;
  else if(plt <= 150) score += 1;

  document.getElementById("sofa_result").textContent = "SOFA-2 total: " + score;
  document.getElementById("sofa_mortality").textContent =
    score <= 1 ? "Mortalidad <10%" :
    score <= 5 ? "Mortalidad 10–20%" :
    score <= 9 ? "Mortalidad 20–40%" :
    score <= 12 ? "Mortalidad 40–50%" :
    "Mortalidad >50%";
}

function resetSOFA(){
  document.querySelectorAll('[id^="sofa_"]').forEach(e => e.value = "");
  document.getElementById("sofa_result").textContent = "";
  document.getElementById("sofa_mortality").textContent = "";
}

/* ======================= APACHE II ======================= */
function calcAPACHE(){
  const aps =
    scoreRange(a_temp.value,[30,32,34,36,38,41]) +
    scoreRange(a_map.value,[50,70,110,130]) +
    scoreRange(a_hr.value,[40,55,70,110,140]) +
    scoreRange(a_rr.value,[6,10,12,25,35]) +
    scoreRange(a_ph.value,[7.15,7.25,7.33,7.5]) +
    scoreRange(a_na.value,[120,130,150,160]) +
    scoreRange(a_k.value,[2.5,3,3.5,5.5,6]) +
    scoreRange(a_crea.value,[0.6,1.5,2,3.5],true) +
    scoreRange(a_hct.value,[20,30,46,50]) +
    scoreRange(a_wbc.value,[1,3,15,20,40]) +
    (15 - a_gcs.value);

  const total = aps + +a_age.value + +a_chronic.value;
  document.getElementById("apache_result").textContent =
    "APACHE II total: " + total;
}

function resetAPACHE(){
  document.querySelectorAll('[id^="a_"]').forEach(e => e.value = "");
  document.getElementById("apache_result").textContent = "";
}

/* ======================== SAPS II ======================== */
function calcSAPS(){
  const saps =
    (+s_age.value * 0.0737) +
    (+s_hr.value * 0.02) +
    (+s_sbp.value * -0.02) +
    (+s_gcs.value * -0.3);

  const logit = -7.7631 + saps;
  const mortality = Math.exp(logit) / (1 + Math.exp(logit)) * 100;

  document.getElementById("saps_result").textContent =
    "Mortalidad estimada SAPS II: " + mortality.toFixed(1) + "%";
}

function resetSAPS(){
  document.querySelectorAll('[id^="s_"]').forEach(e => e.value = "");
  document.getElementById("saps_result").textContent = "";
}

/* ======================== UTIL ======================== */
function scoreRange(v, arr, double = false){
  v = +v;
  let s = 0;
  if(v < arr[0] || v > arr[arr.length-1]) s = 4;
  else if(v < arr[1] || v > arr[arr.length-2]) s = 3;
  else if(v < arr[2] || v > arr[arr.length-3]) s = 2;
  else if(v < arr[3] || v > arr[arr.length-4]) s = 1;
  return double ? s * 2 : s;
}
