<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Sistemas de puntuación | Calculadora UCI</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#020617">

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #020617;
  color: #e5e7eb;
}
.container {
  max-width: 900px;
  margin: auto;
  padding: 1.5rem;
}
.panel {
  background: #0b1220;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
h1, h2 {
  color: #f8fafc;
}
select, button {
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.5rem;
  background: #020617;
  color: #e5e7eb;
  border: 1px solid #1e293b;
  border-radius: 8px;
}
button.primary {
  background: #0ea5e9;
  color: #020617;
  font-weight: 600;
}
button.secondary {
  background: transparent;
  color: #94a3b8;
}
.result {
  margin-top: 1rem;
  font-weight: 700;
}
footer {
  text-align: center;
  padding: 1rem;
  color: #94a3b8;
}
</style>
</head>

<body>
<main class="container">

<header>
  <h1>Sistemas de puntuación UCI</h1>
  <p>Uso educativo · Escalas validadas</p>
</header>

<!-- ===================== SOFA-2 ===================== -->
<section class="panel">
<h2>SOFA-2</h2>

<select id="sofa_neuro">
  <option value="">Neurológico</option>
  <option value="0">GCS 15</option>
  <option value="1">GCS 13–14</option>
  <option value="2">GCS 9–12</option>
  <option value="3">GCS 6–8</option>
  <option value="4">GCS ≤5</option>
</select>

<select id="sofa_resp">
  <option value="">Respiratorio</option>
  <option value="0">&gt; 300</option>
  <option value="1">≤ 300</option>
  <option value="2">≤ 225</option>
  <option value="3">≤ 150 + soporte</option>
  <option value="4">≤ 75 + soporte / ECMO</option>
</select>

<select id="sofa_cardio">
  <option value="">Cardiovascular</option>
  <option value="0">PAM ≥ 70</option>
  <option value="1">PAM &lt; 70</option>
  <option value="2">Vasopresor bajo</option>
  <option value="3">Vasopresor medio</option>
  <option value="4">Vasopresor alto</option>
</select>

<select id="sofa_liver">
  <option value="">Hígado</option>
  <option value="0">BT ≤ 1.2</option>
  <option value="1">BT ≤ 3</option>
  <option value="2">BT ≤ 6</option>
  <option value="3">BT ≤ 12</option>
  <option value="4">BT &gt; 12</option>
</select>

<select id="sofa_renal">
  <option value="">Riñón</option>
  <option value="0">Cr ≤ 1.2</option>
  <option value="1">Cr ≤ 2.0</option>
  <option value="2">Cr ≤ 3.5</option>
  <option value="3">Cr &gt; 3.5 / anuria</option>
  <option value="4">RRT</option>
</select>

<select id="sofa_hemo">
  <option value="">Plaquetas</option>
  <option value="0">&gt; 150</option>
  <option value="1">≤ 150</option>
  <option value="2">≤ 100</option>
  <option value="3">≤ 80</option>
  <option value="4">≤ 50</option>
</select>

<button class="primary" onclick="calcSOFA()">Calcular SOFA-2</button>
<button class="secondary" onclick="resetSOFA()">Reiniciar cálculo</button>
<div id="sofa_result" class="result"></div>
</section>

<!-- ===================== APACHE II ===================== -->
<section class="panel">
<h2>APACHE II</h2>

<select id="apache_phys">
  <option value="">Fisiología</option>
  <option value="0">Normal / leve</option>
  <option value="5">Moderada</option>
  <option value="10">Severa</option>
  <option value="15">Muy severa</option>
  <option value="20">Extrema</option>
</select>

<select id="apache_age">
  <option value="">Edad</option>
  <option value="0">&lt; 45</option>
  <option value="2">45–54</option>
  <option value="3">55–64</option>
  <option value="5">65–74</option>
  <option value="6">≥ 75</option>
</select>

<select id="apache_chronic">
  <option value="">Enfermedad crónica grave</option>
  <option value="0">No</option>
  <option value="5">Sí</option>
</select>

<button class="primary" onclick="calcAPACHE()">Calcular APACHE II</button>
<button class="secondary" onclick="resetAPACHE()">Reiniciar cálculo</button>
<div id="apache_result" class="result"></div>
</section>

<!-- ===================== SAPS II ===================== -->
<section class="panel">
<h2>SAPS II</h2>

<select id="saps_phys">
  <option value="">Fisiología</option>
  <option value="0">Leve</option>
  <option value="10">Moderada</option>
  <option value="20">Severa</option>
  <option value="30">Muy severa</option>
  <option value="40">Crítica</option>
</select>

<select id="saps_age">
  <option value="">Edad</option>
  <option value="0">&lt; 40</option>
  <option value="7">40–59</option>
  <option value="12">60–69</option>
  <option value="15">70–74</option>
  <option value="18">≥ 75</option>
</select>

<select id="saps_adm">
  <option value="">Tipo de ingreso</option>
  <option value="0">Quirúrgico electivo</option>
  <option value="6">Quirúrgico urgente</option>
  <option value="8">Médico</option>
</select>

<button class="primary" onclick="calcSAPS()">Calcular SAPS II</button>
<button class="secondary" onclick="resetSAPS()">Reiniciar cálculo</button>
<div id="saps_result" class="result"></div>
</section>

</main>

<footer>
© 2026 Critical Care Tools · Uso educativo
</footer>

<script src="puntuacion.js"></script>
</body>
</html>
