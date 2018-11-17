let gradosSecciones;
let areas;
let idAreaActual, idAlumnoActual, idSeccionActual, idGradoActual;
let notasLocal;

let postOptions = (ob) => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ob)
  }
};

function getGradosSecciones() {
  return fetch('/api/gradosSecciones').then(gradosSeccionesResponse => gradosSeccionesResponse.json())
}

function getAreas() {
  return fetch('/api/areas').then(areasResponse => areasResponse.json())
}

function getNotas(idArea, idSeccion) {
  return fetch(`/api/notas/${idSeccion}/${idArea}`).then(notasResponse => notasResponse.json())
}

Promise.all([getGradosSecciones(), getAreas()]).then(matrix => {
  [gradosSecciones, areas] = matrix;
  idGradoActual = gradosSecciones[0].id;
  idSeccionActual = gradosSecciones[0].secciones[0].idSeccion;
  idAreaActual = areas[0].idArea;
  poblarNotas();
})

function poblarNotas() {
  getNotas(idSeccionActual, idAreaActual).then(notas => {
    notasLocal = notas;
    let tbodyNotasAlumnos = $('table tbody');
    tbodyNotasAlumnos.html('');
    notas.forEach((nota, index) => {
      let n = nota.notas;
      tbodyNotasAlumnos.append(`
      <tr id="${nota.idAlumno}">
        <td>${index + 1}</td>
        <td>${nota.apellidos}</td>
        <td>${nota.nombres}</td>
        <td class="${n[0] <= 10 ? 'text-danger': 'text-primary'}" data-index="0"><b>${n[0]?n[0]:''}</b></td>
        <td class="${n[1] <= 10 ? 'text-danger': 'text-primary'}" data-index="1"><b>${n[1]?n[1]:''}</b></td>
        <td class="${n[2] <= 10 ? 'text-danger': 'text-primary'}" data-index="2"><b>${n[2]?n[2]:''}</b></td>
        <td class="${n[3] <= 10 ? 'text-danger': 'text-primary'}" data-index="3"><b>${n[3]?n[3]:''}</b></td>
        <td>
          <button class="btn btn-primary" onclick="setModal(${nota.idAlumno})">Editar notas</button>
          <select id="select${nota.idAlumno}-${nota.idArea}" onchange="banearAlumno(${nota.idAlumno},${nota.idArea})">
            <option disabled selected>Seleccionar...</option>
            <option value="esExonerado">Exonerar</option>
            <option value="noAsiste">No asiste</option>
          </select>
        </td>
      </tr>
      `);
    });
  });
}

function setModal(idAlumno) {
  idAlumnoActual = idAlumno;
  $('#input1erBimestre').val(notasLocal.find(nota => nota.idAlumno === idAlumno).notas[0]),
  $('#input2doBimestre').val(notasLocal.find(nota => nota.idAlumno === idAlumno).notas[1]),
  $('#input3erBimestre').val(notasLocal.find(nota => nota.idAlumno === idAlumno).notas[2]),
  $('#input4toBimestre').val(notasLocal.find(nota => nota.idAlumno === idAlumno).notas[3]),
  $('#editarNotasModal').modal('show');
}

$(document).ready(() => {
  $('#confirmarEditarNota').on('click', () => {
    editarNotas(idAlumnoActual)
  });

  $('#selectGrado').bind('change', function() {
    idGradoActual = $(this).val();
    $('#selectSeccion').html('');
    gradosSecciones.find(grado => grado.id == idGradoActual).secciones.forEach((seccion) => {
      $('#selectSeccion').append(`
      <option value="${seccion.idSeccion}">${seccion.denominacion}</option>
      `)
    })
  })

  $('#selectSeccion').bind('change', function() {
    idSeccionActual = $(this).val();
    poblarNotas();
  })

  $('#selectArea').bind('change', function() {
    idAreaActual = $(this).val();
    poblarNotas();
  })
})

function editarNotas(idAlumno) {
  let notasForUpdate = [
    $('#input1erBimestre').val(),
    $('#input2doBimestre').val(),
    $('#input3erBimestre').val(),
    $('#input4toBimestre').val(),
  ];
  let notasRequest = {idAlumno, idArea: idAreaActual, notasForUpdate};
  updateNotas(notasRequest).then(update => {
    if(update.result === "ok") {
      let u = update.registro;
      resestClassesFromNotas();
      $(`#${idAlumnoActual} td[data-index='0'] b`).html($('#input1erBimestre').val());
      $(`#${idAlumnoActual} td[data-index='1'] b`).html($('#input2doBimestre').val());
      $(`#${idAlumnoActual} td[data-index='2'] b`).html($('#input3erBimestre').val());
      $(`#${idAlumnoActual} td[data-index='3'] b`).html($('#input4toBimestre').val());
      alert('Notas editadas con éxito');
    }
  });
}

function resestClassesFromNotas() {
  $(`#${idAlumnoActual} td[data-index='0']`).attr('class', 'text-success');
  $(`#${idAlumnoActual} td[data-index='1']`).attr('class', 'text-success');
  $(`#${idAlumnoActual} td[data-index='2']`).attr('class', 'text-success');
  $(`#${idAlumnoActual} td[data-index='3']`).attr('class', 'text-success');
}

function updateNotas(notasRequest) {
  return fetch('/api/notas/updateNotas', postOptions(notasRequest)).then(updateResponse => {
    return updateResponse.json();
  })
}

function banearAlumno(idAlumno, idArea) {
  let tipo = $(`#select${idArea}-${idAlumno}`).val();
  fetch('/api/notas/banearAlumno', postOptions({
    idArea: idArea,
    idAlumno: idAlumno,
    tipo: tipo
  })).then(exoneracioResponse => exoneracioResponse.json())
  .then(exoneracion => {
    console.log(exoneracion);
    alert('Se actualizó satisfactoriamente');
  })
}