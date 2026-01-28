/* =========================
   HELPERS
========================= */
function getNum(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : null;
}
function anyNull(arr) { return arr.some(v => v === null); }
function setHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function fmt(n,d=2){return Number.isFinite(n)?n.toFixed(d):"—";}

/* =========================
   ECOCARDIOGRAFÍA
========================= */
function calcularGCEco() {
  const d = getNum("eco_dtsvi"), v = getNum("eco_vti"), f = getNum("eco_fc");
  if (anyNull([d,v,f])||d<=0||v<=0||f<=0) return setHTML("resultadoGCEco","Datos inválidos");
  const gc=((Math.PI*(d/2)**2)*v*f)/1000;
  setHTML("resultadoGCEco",`<strong>GC:</strong> ${gc.toFixed(2)} L/min`);
  setHTML("interpretacionGCEco", v<15?"Bajo gasto":v<=22?"Normal":"Hiperdinámico");
}

function calcularFA(){
  const dd=getNum("fa_ddvi"), ds=getNum("fa_dsvi");
  if(anyNull([dd,ds])||ds>=dd) return setHTML("resultadoFA","Datos inválidos");
  const fa=((dd-ds)/dd)*100;
  setHTML("resultadoFA",`<strong>FA:</strong> ${fa.toFixed(1)} %`);
}

/* =========================
   OXIGENACIÓN
========================= */
function calcularOxigenacion(){
  const gc=getNum("oxi_gc"), hb=getNum("oxi_hb"),
  sao2=getNum("oxi_sao2"), pao2=getNum("oxi_pao2"),
  svo2=getNum("oxi_svo2"), pvo2=getNum("oxi_pvo2");
  if(anyNull([gc,hb,sao2,pao2,svo2,pvo2])) return;
  const CaO2=hb*1.34*(sao2/100)+pao2*0.003;
  const CvO2=hb*1.34*(svo2/100)+pvo2*0.003;
  const DO2=gc*CaO2*10, VO2=gc*(CaO2-CvO2)*10;
  setHTML("resultadoOxigenacionDetalle",
    `<ul><li>DO₂ ${fmt(DO2,0)}</li><li>VO₂ ${fmt(VO2,0)}</li></ul>`);
}

/* =========================
   RENAL
========================= */
function renalPaso1(){ if(document.getElementById("renal_hemo").value==="1")document.getElementById("renal_paso2").style.display="block"; }
function renalPaso2(){ document.getElementById("renal_paso3").style.display="block"; }
function renalPaso3(){ document.getElementById("renal_paso4").style.display="block"; }
function renalPaso4(){ setHTML("resultadoRenal","Evaluación completada"); }

/* =========================
   PRESIONES
========================= */
function calcularRVS(){
  const tam=getNum("rvs_tam"), pvc=getNum("rvs_pvc"), gc=getNum("rvs_gc");
  if(anyNull([tam,pvc,gc])||gc<=0)return;
  setHTML("resultadoRVS",`RVS ${(((tam-pvc)/gc)*80).toFixed(0)}`);
}
function calcularPPR(){
  const tam=getNum("ppr_tam"), pia=getNum("ppr_pia");
  if(anyNull([tam,pia]))return;
  setHTML("resultadoPPR",`PPR ${tam-pia}`);
}
function calcularPPC(){
  const tam=getNum("ppc_tam"), pic=getNum("ppc_pic");
  if(anyNull([tam,pic]))return;
  setHTML("resultadoPPC",`PPC ${tam-pic}`);
}
