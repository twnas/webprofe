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

$('#listarEstudiantesButton').click(function () {
  let idSeccion = $('#seccionSelect').val();
  let idArea = $('#areaSelect').val();
  if (idSeccion && idArea) {
    fetch(`/api/gradosSecciones/historialLogrosSeccion/${idSeccion}/${idArea}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        let notas = data.notas;
        if (!notas) {
          alert("No hay notas para el área-sección seleccionada");
        } else {
          procesarNotas(notas);
        }
      })
  }
})

function procesarNotas(notas) {
  console.log(notas);
}
function listenersRows() {
  $('#alumnosTableBody tr').click(function () {
    if ($(this).hasClass('highlight')) {
      $(this).removeClass('highlight');
    } else {
      $('#alumnosTableBody tr').removeClass('highlight');
      $(this).addClass('highlight');
    }
  })
}
function draw(idAlumno, idArea) {
 $('svg').empty();
  var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
  
  var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    yScale = d3.scaleLinear().rangeRound([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  d3.json(`/api/estudiantes/notas/${idAlumno}/${idArea}`, function (error, data) {
    if (error) throw error;
    xScale.domain(data.map(function (d) { return d.bimestre; }));
    yScale.domain([0, 20]);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale).ticks(20))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Nota");

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return xScale(d.bimestre); })
      .attr("y", function (d) { return yScale(d.nota); })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) { return height - yScale(d.nota); })
      .on("mouseover", function (d) {
        var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
        console.log("x", parseFloat(d3.select(this).attr("x")))
        var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;
        console.log("y", parseFloat(d3.select(this).attr("y")))
        d3.select("#tooltip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")
          .select("#value")
          .text(d.nota);


        d3.select("#tooltip").classed("hidden", false);

      })
      .on("mouseout", function () {


        d3.select("#tooltip").classed("hidden", true);

      })
  });
}
$('#obtenerNotasButton').click(function () {
  let idAlumno = $('tr.highlight').data('idalumno');
  let idArea = $('#areaSelect').val();
  console.log(idAlumno, idArea);
  if(!idAlumno || !idArea){
    alert("Tiene que seleccionar un área y un alumno")
  }else{
    draw(idAlumno, idArea);
  }
})

$('#seccionSelect').click(function () {
  let idSeccion = $('#seccionSelect').val();

  if (idSeccion == "") {
    console.log("NEL")
  } else {
    fetch(`/api/estudiantes/listar/${idSeccion}`)
      .then((response) => {
        return response.json();
      })
      .then((estudiantes) => {
        let tbody = $('#alumnosTableBody');
        estudiantesLista = {};
        $('#alumnosTableBody tr').remove();
        cont = 1;
        for (let estudiante of estudiantes) {
          let tr = $(document.createElement('tr'));
          let th = $(document.createElement('th'));
          th.attr('scope', 'row');
          th.append(cont);
          let tdDNI = $(document.createElement('td'));
          let tdApellidos = $(document.createElement('td'));
          let tdNombres = $(document.createElement('td'));
          tdDNI.append(estudiante.dni);
          tdApellidos.append(estudiante.apellidos);
          tdNombres.append(estudiante.nombres);
          tr.append(th, tdDNI, tdApellidos, tdNombres);
          tr.attr("data-idalumno", estudiante.idAlumno);
          estudiantesLista[estudiante.idAlumno] = estudiante;
          tbody.append(tr);
          cont += 1;
        }
        listenersRows();
      })
  }
})