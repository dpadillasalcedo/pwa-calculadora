/* ================= CAM-ICU ================= */

function calcCAM(){

const s1 = parseInt(document.getElementById("cam_step1").value);
const s2 = parseInt(document.getElementById("cam_step2").value);
const s3 = parseInt(document.getElementById("cam_step3").value);
const s4 = parseInt(document.getElementById("cam_step4").value);

const resultBox = document.getElementById("resultadoCAMICU");

if(isNaN(s1) || isNaN(s2) || isNaN(s3) || isNaN(s4)){
resultBox.innerHTML = "Please complete all CAM-ICU steps.";
return;
}

let result = "";
let detail = "";

if(s1 === 0){
result = "CAM-ICU NEGATIVE";
detail = "Step 1 negative → Delirium ruled out.";
}
else if(s1 === 1 && s2 === 1 && (s3 === 1 || s4 === 1)){
result = "CAM-ICU POSITIVE";
detail = "Criteria met: 1 + 2 + (3 or 4). Delirium present.";
}
else{
result = "CAM-ICU NEGATIVE";
detail = "Criteria not fully met.";
}

resultBox.innerHTML =
"<strong>" + result + "</strong><br>" + detail;
}

function resetCAM(){
document.querySelectorAll("#camicu select").forEach(el=>el.value="");
document.getElementById("resultadoCAMICU").innerHTML="";
}


/* ================= NIHSS ================= */

function calcNIHSS(){

let total = 0;
let valid = true;

/* Sum all NIHSS items */
document.querySelectorAll(".nihss").forEach(el=>{
if(el.value === "") valid = false;
else total += parseInt(el.value);
});

if(!valid){
document.getElementById("nihss_result").innerHTML =
"Please complete all NIHSS items.";
document.getElementById("nihss_interpretation").innerHTML = "";
return;
}

/* Detect disabling symptoms */

let disabling = false;

/* Hemianopsia */
const hemianopsia = document.getElementById("n_visual")?.value;

/* Aphasia */
const aphasia = document.getElementById("n_language")?.value;

/* Neglect */
const neglect = document.getElementById("n_neglect")?.value;

/* Motor deficit against gravity (arm or leg ≥2) */
const motorArm = document.getElementById("n_motor_arm")?.value;
const motorLeg = document.getElementById("n_motor_leg")?.value;

if(
(parseInt(hemianopsia) > 0) ||
(parseInt(aphasia) > 0) ||
(parseInt(neglect) > 0) ||
(parseInt(motorArm) >= 2) ||
(parseInt(motorLeg) >= 2)
){
disabling = true;
}

/* Severity classification */

let severity = "";

if(total === 0) severity = "No stroke symptoms";
else if(total <= 4) severity = "Minor stroke";
else if(total <= 15) severity = "Moderate stroke";
else if(total <= 20) severity = "Moderate to severe stroke";
else severity = "Severe stroke";

/* Output */

document.getElementById("nihss_result").innerHTML =
"Total NIHSS Score: <strong>" + total + "</strong>";

let disabilityText = disabling
? "Disabling symptoms present."
: "No disabling symptoms detected.";

document.getElementById("nihss_interpretation").innerHTML =
"Severity classification: <strong>" + severity + "</strong><br>" +
disabilityText;
}

function resetNIHSS(){
document.querySelectorAll(".nihss").forEach(el=>el.value="");
document.getElementById("nihss_result").innerHTML="";
document.getElementById("nihss_interpretation").innerHTML="";
}
