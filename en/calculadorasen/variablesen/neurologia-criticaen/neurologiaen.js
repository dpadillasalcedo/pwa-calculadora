/* ================= CAM-ICU ================= */

function calcCAM(){

const s1 = parseInt(document.getElementById("cam1").value);
const s2 = parseInt(document.getElementById("cam2").value);
const s3 = parseInt(document.getElementById("cam3").value);
const s4 = parseInt(document.getElementById("cam4").value);

if(isNaN(s1)||isNaN(s2)||isNaN(s3)||isNaN(s4)){
document.getElementById("cam_result").innerHTML="Complete all steps.";
return;
}

let detail="";
let result="";

if(s1===0){
result="CAM-ICU NEGATIVE";
detail="Step 1 negative → Delirium ruled out.";
}
else if(s1===1 && s2===1 && (s3===1 || s4===1)){
result="CAM-ICU POSITIVE";
detail="Criteria met: 1 + 2 + (3 or 4). Delirium present.";
}
else{
result="CAM-ICU NEGATIVE";
detail="Criteria not fully met.";
}

document.getElementById("cam_result").innerHTML=result;
document.getElementById("cam_detail").innerHTML=detail;
}

function resetCAM(){
document.querySelectorAll("#camicu select").forEach(el=>el.value="");
document.getElementById("cam_result").innerHTML="";
document.getElementById("cam_detail").innerHTML="";
}

/* ================= NIHSS ================= */

function calcNIHSS(){

let total=0;
let valid=true;

document.querySelectorAll(".nihss").forEach(el=>{
if(el.value==="") valid=false;
else total+=parseInt(el.value);
});

if(!valid){
document.getElementById("nihss_result").innerHTML="Complete all NIHSS items.";
return;
}

let severity="";

if(total===0) severity="No stroke symptoms";
else if(total<=4) severity="Minor stroke";
else if(total<=15) severity="Moderate stroke";
else if(total<=20) severity="Moderate to severe stroke";
else severity="Severe stroke";

document.getElementById("nihss_result").innerHTML=
"Total NIHSS Score: <strong>"+total+"</strong>";

document.getElementById("nihss_interpretation").innerHTML=
"Severity classification: <strong>"+severity+"</strong>";
}

function resetNIHSS(){
document.querySelectorAll(".nihss").forEach(el=>el.value="");
document.getElementById("nihss_result").innerHTML="";
document.getElementById("nihss_interpretation").innerHTML="";
}
