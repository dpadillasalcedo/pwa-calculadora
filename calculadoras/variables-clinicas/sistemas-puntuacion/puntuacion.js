function val(id){
  const el=document.getElementById(id);
  return el && el.value!=="" ? Number(el.value) : null;
}

function reset(ids,res){
  ids.forEach(i=>document.getElementById(i).selectedIndex=0);
  document.getElementById(res).textContent="";
}

/* ===== SOFA ===== */
function calcSOFA(){
  const ids=["sofa_neuro","sofa_resp","sofa_cardio","sofa_liver","sofa_renal","sofa_hemo"];
  let t=0;
  for(let i of ids){
    let v=val(i);
    if(v===null){ sofa_result.textContent="⚠️ Complete todas las variables"; return; }
    t+=v;
  }
  sofa_result.textContent=`SOFA-2 total: ${t} puntos`;
}
function resetSOFA(){ reset(["sofa_neuro","sofa_resp","sofa_cardio","sofa_liver","sofa_renal","sofa_hemo"],"sofa_result"); }

/* ===== APACHE II ===== */
function calcAPACHE(){
  const ids=["ap_temp","ap_map","ap_hr","ap_rr","ap_oxygen","ap_ph","ap_na","ap_k","ap_cr","ap_hct","ap_wbc","ap_gcs","ap_age","ap_chronic"];
  let t=0;
  for(let i of ids){
    let v=val(i);
    if(v===null){ apache_result.textContent="⚠️ Complete todas las variables"; return; }
    t+=v;
  }
  apache_result.textContent=`APACHE II total: ${t} puntos`;
}
function resetAPACHE(){ reset(["ap_temp","ap_map","ap_hr","ap_rr","ap_oxygen","ap_ph","ap_na","ap_k","ap_cr","ap_hct","ap_wbc","ap_gcs","ap_age","ap_chronic"],"apache_result"); }

/* ===== SAPS II ===== */
function calcSAPS(){
  const ids=["saps_age","saps_hr","saps_sys","saps_temp","saps_gcs","saps_uo","saps_bun","saps_wbc","saps_k","saps_na","saps_hco3","saps_bili","saps_adm"];
  let t=0;
  for(let i of ids){
    let v=val(i);
    if(v===null){ saps_result.textContent="⚠️ Complete todas las variables"; return; }
    t+=v;
  }
  saps_result.textContent=`SAPS II total: ${t} puntos`;
}
function resetSAPS(){ reset(["saps_age","saps_hr","saps_sys","saps_temp","saps_gcs","saps_uo","saps_bun","saps_wbc","saps_k","saps_na","saps_hco3","saps_bili","saps_adm"],"saps_result"); }
