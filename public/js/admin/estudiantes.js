var seccionesMap = {};
var estudiantesLista = {};
$(function () {
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
  $('#agregarAlumno').submit(function (e) {
    e.preventDefault();
    let idSeccion = $('#seccionSelect').val();
    let dni = $('#inputDNI').val();
    let nombres = $('#inputNombres').val();
    let apellidoPaterno = $('#inputApellidoPaterno').val();
    let apellidoMaterno = $('#inputApellidoMaterno').val();
    if (!idSeccion || !dni || !nombres || !apellidoPaterno || !apellidoMaterno) {
      alert('Faltan ingresar datos en el formulario');
    } else {
      $.post(`/api/estudiantes/agregar/${idSeccion}`, {
        dni: dni,
        apellidoMaterno: apellidoMaterno,
        apellidoPaterno: apellidoPaterno,
        nombres: nombres
      })
        .done((response) => {
          $('#agregarAlumnoModal').modal('hide')
          console.log(response);
          let tbody = $('#alumnosTableBody');
          let tr = $(document.createElement('tr'));
          let th = $(document.createElement('th'));
          th.attr('scope', 'row');
          th.append(cont);
          let tdDNI = $(document.createElement('td'));
          let tdApellidos = $(document.createElement('td'));
          let tdNombres = $(document.createElement('td'));
          tdDNI.append(response.alumno.dni);
          tdApellidos.append(response.alumno.apellidos);
          tdNombres.append(response.alumno.nombres);
          tr.append(th, tdDNI, tdApellidos, tdNombres);
          tr.data('idAlumno', response.alumno.idAlumno);
          tbody.append(tr);
          cont += 1;
          listenersRows();
        })
        .fail((err) => {
          alert("Ocurrió un error al insertar al estudiante");
        })
    }
  });
  $('#agregarAlumno').submit(function (e) {
    e.preventDefault();
  })
  $('#modificarAlumno').submit(function (e) {
    e.preventDefault();
  })
})
let cont;
$('#seccionSelect').click(function () {
  let idSeccion = $('#seccionSelect').val();
  if (idSeccion == "") {

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

function listenersRows() {
  $('#alumnosTable tbody tr').click(function () {
    if ($(this).hasClass('highlight')) {
      $(this).removeClass('highlight');
    } else {
      $('#alumnosTable tbody tr').removeClass('highlight');
      $(this).addClass('highlight');
    }
  })
}
$('#modificarAlumnoButton').click(function () {
  let tr = $('tr.highlight');
  if (tr.length) {
    let idEstudiante = tr.data('idalumno');
    let estudiante = estudiantesLista[idEstudiante];
    $('#inputDNIMod').val(estudiante.dni);
    $('#inputApellidoPaternoMod').val(estudiante.apellidoPaterno);
    $('#inputApellidoMaternoMod').val(estudiante.apellidoMaterno);
    $('#inputNombresMod').val(estudiante.nombres);
  } else {
    alert("Tienes que seleccionar a un estudiante");
  }
})

$('#modificarAlumno').submit(function (e) {
  e.preventDefault();
  let tr = $('tr.highlight');
  if (tr.length) {
    let idEstudiante = tr.data('idalumno');
    let dni = $('#inputDNIMod').val();
    let apellidoPaterno = $('#inputApellidoPaternoMod').val();
    let apellidoMaterno = $('#inputApellidoMaternoMod').val();
    let nombres = $('#inputNombresMod').val();
    if(!dni || !apellidoMaterno || !apellidoPaterno || !nombres){
      alert("Faltan llenar datos");
      return ;
    }
    let data = {
      dni: dni,
      apellidoMaterno: apellidoMaterno,
      apellidoPaterno: apellidoPaterno,
      nombres: nombres
    }
    $.post(`/api/estudiantes/actualizar/${idEstudiante}`, data)
      .done((response)=>{
        alert("Modificado");
        location.reload();
      })
      .fail((err)=>{
        alert("Ocurrió un error en la base de datos");
      })
  } else {
    alert("Tienes que seleccionar a un estudiante");
  }
});

$('#toggleEstadoAlumno').click(function () {
  let tr = $('tr.highlight');
  
  if (tr.length) {
    let idEstudiante = tr.data('idalumno');
    let dni = prompt("Confirmación, ingrese el DNI del estudiante");
    if(dni == estudiantesLista[idEstudiante].dni){
      $.post(`/api/estudiantes/toggleEstado/${idEstudiante}/0`)
        .done((response)=>{
          console.log(response);
          alert("El alumno fue eliminado");
        })
        .fail((err)=>{

        })
    }else{
      alert("El DNI no coincide");
    }
    
  } else {
    alert("Tienes que seleccionar a un estudiante");
  }
})