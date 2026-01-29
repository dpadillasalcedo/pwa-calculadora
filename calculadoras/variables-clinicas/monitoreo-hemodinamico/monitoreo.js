console.log("monitoreo.js cargado correctamente");

/* =========================
   HELPERS
========================= */
function getNum(id){
  const el=document.getElementById(id);
  if(!el||el.value==="")return null;
  const v=Number(el.value);
  return Number.isFinite(v)?v:null;
}
function setHTML(id,html){
  const el=document.getElementById(id);
  if(el)el.innerHTML=html;
}

/* =========================
   ECOCARDIOGRAFÍA
========================= */
function calcularGCEco(){
  const d=getNum("eco_dtsvi"),
        vti=getNum("eco_vti"),
        fc=getNum("eco_fc");

  if(!d||!vti||!fc){
    setHTML("resultadoGCEco","Complete todos los campos.");
    return;
  }

  const gc=((Math.PI*(d/2)**2)*vti*fc)/1000;
  setHTML("resultadoGCEco",`<strong>GC:</strong> ${gc.toFixed(2)} L/min`);
  setHTML(
    "interpretacionGCEco",
    gc<4?"Bajo gasto":gc<=6?"Gasto normal":"Estado hiperdinámico"
  );
}

function calcularFA(){
  const dd=getNum("fa_ddvi"), ds=getNum("fa_dsvi");
  if(!dd||!ds||ds>=dd){
    setHTML("resultadoFA","Datos inválidos.");
    return;
  }
  const fa=((dd-ds)/dd)*100;
  setHTML("resultadoFA",`<strong>FA:</strong> ${fa.toFixed(1)} %`);
}

/* =========================
   OXIGENACIÓN
========================= */
function calcularOxigenacion(){
  const gc=getNum("oxi_gc"),
        hb=getNum("oxi_hb"),
        sao2=getNum("oxi_sao2"),
        pao2=getNum("oxi_pao2"),
        svo2=getNum("oxi_svo2"),
        pvo2=getNum("oxi_pvo2");

  if(!gc||!hb||!sao2||!pao2||!svo2||!pvo2)return;

  const CaO2=hb*1.34*(sao2/100)+pao2*0.003;
  const CvO2=hb*1.34*(svo2/100)+pvo2*0.003;
  const DO2=gc*CaO2*10;
  const VO2=gc*(CaO2-CvO2)*10;

  setHTML(
    "resultadoOxigenacionDetalle",
    `<ul>
      <li><strong>DO₂:</strong> ${DO2.toFixed(0)} mL/min</li>
      <li><strong>VO₂:</strong> ${VO2.toFixed(0)} mL/min</li>
    </ul>`
  );
}

/* =========================
   PRESIONES
========================= */
function calcularRVS(){
  const tam=getNum("rvs_tam"),
        pvc=getNum("rvs_pvc"),
        gc=getNum("rvs_gc");

  if(!tam||!gc)return;

  const rvs=((tam-(pvc||0))/gc)*80;
  setHTML("resultadoRVS",`<strong>RVS:</strong> ${rvs.toFixed(0)} dyn·s·cm⁻⁵`);
}
