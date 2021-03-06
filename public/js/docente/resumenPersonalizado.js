var seccionesMap = {};
$(function () {
  // Listar Grados Secciones
  fetch('/api/gradosSecciones')
    .then((response) => {
      return response.json();
    })
    .then((gradosSecciones) => {
      console.log(gradosSecciones);
      let gradoSelect = $('#gradoSelect');
      for (let grado of gradosSecciones) {
        seccionesMap[grado.id] = grado.secciones;
        let option = $(document.createElement('option'));
        option.append(grado.denominacion);
        option.val(grado.id);
        gradoSelect.append(option);
      }
    })
  $('#gradoSelect').change(function () {
    $("#seccionSelect option[value!='']").remove();
    let idGrado = $("#gradoSelect option:checked").val();
    if (idGrado !== "") {
      let seccionSelect = $('#seccionSelect');
      for (let seccion of seccionesMap[idGrado]) {
        let option = $(document.createElement('option'));
        option.val(seccion.idSeccion)
        option.append(seccion.denominacion);
        seccionSelect.append(option);
      }
    }
  });

  // Listar Áreas

  fetch('/api/areas')
    .then((response) => {
      return response.json();
    })
    .then((areas) => {
      let areaSelect = $('#areaSelect');
      for (let area of areas) {
        let option = $(document.createElement('option'));
        option.append(area.nombre);
        option.val(area.idArea);
        areaSelect.append(option);
      }
    })
})

$('#gradoSelect').change(function(){
  $('#gradoSelect option').removeAttr('selected');
  $('#gradoSelect option:selected').attr('selected', '');
})
$('#areaSelect').change(function(){
  $('#areaSelect option').removeAttr('selected');
  $('#areaSelect option:selected').attr('selected', '');
});
$('#seccionSelect').change(function(){
  $('#seccionSelect option').removeAttr('selected');
  $('#seccionSelect option:selected').attr('selected', '');
})

$('#generarReporteButton').click(function () {
  let idSeccion = $('#seccionSelect').val();
  let idArea = $('#areaSelect').val();
  if (idSeccion && idArea) {
    fetch(`/api/gradosSecciones/historialLogrosSeccion/${idSeccion}/${idArea}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        let metas = data.metas;
        let notas = data.notas;
        if(!notas || !metas){
          alert("No hay notas  o metas para el area seleccionada");
        }else{
          procesarNotasMetas(notas, metas);
        }
      })
  }
})
function procesarNotasMetas(notas, metas) {
  let matrixTotal = []
  for (let i = 0; i < 7; i += 1) {
    let temp = [];
    for (let j = 0; j < 18; j += 1) {
      temp.push(0);
    }
    matrixTotal.push(temp);
  }
  // Procesamiento
  let totalAnual = 0;
  let total;
  for (let i = 1; i <= 3; i++) {
    metas[i].intervalo1 = metas[i].intervalo1 || 0;
    metas[i].intervalo2 = metas[i].intervalo2 || 0;
    metas[i].intervalo3 = metas[i].intervalo3 || 0;
    metas[i].intervalo4 = metas[i].intervalo4 || 0;
    total = metas[i].intervalo1 + metas[i].intervalo2 + metas[i].intervalo3 + metas[i].intervalo4;
    // hardcoded
    metas[i].exonerados = 0;
    metas[i].inasistencia = 0;
    // end  hardcoded
    let exonerados = metas[i].exonerados;
    let inasistencia = metas[i].inasistencia;
    total += exonerados + inasistencia;
    totalAnual += total;
    // Filling matrix
    for (let j = 1; j <= 4; j++) {
      matrixTotal[j - 1][4 * (i - 1) + 2] = metas[i]["intervalo" + j];
      if(total != 0)
        matrixTotal[j - 1][4 * (i - 1) + 3] = metas[i]["intervalo" + j] / total * 100;
      else 
        matrixTotal[j - 1][4 * (i - 1) + 3] = 0;
    }
    matrixTotal[4][4 * (i - 1) + 2] = metas[i].exonerados;
    if(total != 0)
      matrixTotal[4][4 * (i - 1) + 3] = metas[i].exonerados / total * 100;
    else 
      matrixTotal[4][4 * (i - 1) + 3] = 0;
    matrixTotal[5][4 * (i - 1) + 2] = metas[i].inasistencia;
    if(total != 0)
      matrixTotal[5][4 * (i - 1) + 3] = metas[i].inasistencia / total * 100;
    else
      matrixTotal[5][4 * (i - 1) + 3] = 0;
    matrixTotal[6][4 * (i - 1) + 2] = total;
    matrixTotal[6][4 * (i - 1) + 3] = 100;
  }

  // Notas hasta 4to bimestre
  for (let i = 0; i < 7; i++) {
    matrixTotal[i][15] = matrixTotal[i][11];
    matrixTotal[i][14] = matrixTotal[i][10];
  }
  for (let i = 1; i <= 4; i++) {
    let rangos = [0, 0, 0, 0, 0, 0, 0];
    for (let nota of notas) {
      if (nota.noAsiste == "1") {
        rangos[5] += 1
      } else if (nota.exonerado == "1") {
        rangos[4] += 1;
      } else {
        let notaTemp = nota[i + "B"] || 0;
        if (notaTemp <= 10) rangos[3] += 1;
        else if (notaTemp <= 13) rangos[2] += 1;
        else if (notaTemp <= 17) rangos[1] += 1;
        else rangos[0] += 1;
      }
    }
    rangos[6] = notas.length;
    for (let j = 0; j < 7; j++) {
      matrixTotal[j][4 * (i - 1)] = rangos[j];
      matrixTotal[j][4 * (i - 1) + 1] = rangos[j] / rangos[6] * 100;
    }
  }
  // Resultado Anual
  let rangosGlobales = [0, 0, 0, 0, 0, 0, notas.length];
  for (let nota of notas) {
    if (nota.noAsiste == "1") {
      rangosGlobales[5] += 1
    } else if (nota.exonerado == "1") {
      rangosGlobales[4] += 1;
    } else {
      let notaTemp = 0;
      for (let i = 1; i <= 4; i++) {
        notaTemp += (nota[i + "B"] || 0);
      }
      notaTemp /= 4;
      if (notaTemp <= 10) rangosGlobales[3] += 1;
      else if (notaTemp <= 13) rangosGlobales[2] += 1;
      else if (notaTemp <= 17) rangosGlobales[1] += 1;
      else rangosGlobales[0] += 1;
    }
  }
  for (let j = 0; j < 7; j++) {
    matrixTotal[j][16] = rangosGlobales[j];
    matrixTotal[j][17] = rangosGlobales[j] / rangosGlobales[6] * 100;
  }
  $('#cantidadAlumnos').html('Cantidad de estudiantes: '+notas.length);
  pintarMatriz(matrixTotal);
  drawMain(matrixTotal);
}
function pintarMatriz(matrixTotal) {
  console.log(matrixTotal);
  for(let i = 0;i<7;i++){
    let row = $('#row'+(i+1));
    for(let j=0;j<18;j++){
      if(j%2){
        $('#row'+(i+1)+' td').eq(j).html(matrixTotal[i][j].toFixed(1));
        //td.append(matrixTotal[i][j].toFixed(1));
      }else{
        $('#row'+(i+1)+' td').eq(j).html(matrixTotal[i][j]);
        //td.append(matrixTotal[i][j]);
      }
    }
  }
}

function drawMain(matrix) {
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(function () {
    let arrays = [];
    for(let i=0;i<4;i++){
      let tempArray = [];
      for(let j=0;j<6;j++){
        tempArray.push(matrix[j][4*i]);
      }
      arrays.push(tempArray);
    }
    console.log("ARRAYS", arrays)
    drawChart("I", arrays[0], "pieChartB1");
    drawChart("II", arrays[1], "pieChartB2");
    drawChart("III", arrays[2], "pieChartB3");
    drawChart("IV", arrays[3], "pieChartB4");
  });
}

function drawChart(bimestre, notas, id) {
  let data = google.visualization.arrayToDataTable([
    ['Notas', 'Cantidad de estudiantes'],
    ['18-20', notas[0]],
    ['14-17', notas[1]],
    ['11-13', notas[2]],
    ['0-10', notas[3]],
    ['Exonerados', notas[4]],
    ['No asisten', notas[5]]
  ]);

  var options = {
    title: 'Bimestre ' + bimestre,
    is3D: true,
  };

  var chart = new google.visualization.PieChart(document.getElementById(id));
  chart.draw(data, options);
}