let grados;
let secciones;
let idGradoActual;
let idSeccionActual;
let nuevaDenominacion;

let postOptions = (ob) => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ob)
  }
};

fetch('/api/gradosSecciones')
  .then(gradosResponse => gradosResponse.json())
  .then(gradosJson => grados = gradosJson);

$(document).ready(() => {
  $('#confirmarNuevoGrado').on('click', () => {
    let grado = {
      denominacion: $('#inputDenominacionGrado').val(),
      abreviacion: $('#inputAbreviacionGrado').val(),
      correlativo: $('#inputCorrelativoGrado').val(),
      idPeriodoEscolar: grados[0].idPeriodoEscolar
    };
    newGrado(grado);
  });

  $('#confirmarNuevaSeccion').on('click', () => {
    nuevaDenominacion = $('#inputNuevaSeccion').val();
    newSeccion({denominacion: nuevaDenominacion, idGrado: idGradoActual});
  });
});

function agregarSeccion(idGrado) {
  idGradoActual = idGrado;
  $('#nuevaSeccionModalLabel').html(`Agregar sección al <b>${grados.find(g => g.id === idGrado).denominacion}</b>`);
  $('#nuevaSeccionModal').modal('show');
}

function newSeccion(seccion) {
  fetch('/api/gradosSecciones/newSeccion', postOptions(seccion)).then(newSeccionResponse => {
    return newSeccionResponse.json();
  }).then(newSeccion => {
    $('table tbody').append(`<tr id="${newSeccion.idSeccion}}">
        <td>${nuevaDenominacion}</td>
        <td>0</td>
        <td><a class="btn btn-secondary" href="/admin/estudiantes/${newSeccion.idSeccion}">Ver estudiantes</a>
        <button class="btn btn-danger" onclick=eliminarSeccion(${idGradoActual}, ${seccion.idSeccion})> Eliminar sección</button></td>
      </tr>`);
  });
}

function newGrado(grado) {
  fetch('/api/gradosSecciones/newGrado', postOptions(grado))
    .then(newGradoResponse => newGradoResponse.json())
    .then(newGrado => {
      $('#accordionGradosSecciones').append(`<div class="card">
    <div class="card-header" id="heading">
        <h5 class="mb-0">
          <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse${newGrado.idGrado}" aria-expanded="false" aria-controls="#collapse${grado.idGrado}">${newGrado.denominacion}</button>
          <button onclick="onclick=eliminarGrado(${newGrado.idGrado})" class="btn btn-sm btn-danger float-right">Eliminar</button>
        </h5>
    </div>
    <div class="collapse" id="collapse${newGrado.idGrado}" aria-labelledby="heading${newGrado.idGrado}" data-parent="#accordionGradosSecciones">
        <div class="card-body"><button class="btn btn-primary float-right" onclick="agregarSeccion(${newGrado.idGrado})">Agregar seccion</button>
            <div class="table text-center">
                <table>
                    <thead>
                        <tr>
                            <th>Sección</th>
                            <th>Número de estudiantes</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>`)
      grados.push({id: newGrado.idGrado, denominacion: newGrado.denominacion, correlativo: newGrado.correlativo});
    })  
}

function eliminarGrado(idGrado) {
  if(confirm('¿Está seguro de eliminar el '+ grados.find(grado => grado.id === idGrado).denominacion)) {
    fetch('/api/gradosSecciones/deleteGrado', postOptions({idGrado: idGrado}))
      .then(deleteResponse => deleteResponse.json())
      .then(deleteJson => {
        if(deleteJson.wasDeleted) {
          alert('El grado fue eliminado exitosamente');
          $(`#card${idGrado}`).remove();
        } else {
          alert('El grado no pudo ser eliminado porque existen secciones que dependen de él');
        }
      })
  }
}

function eliminarSeccion(idGrado, idSeccion) {
  if(confirm('¿Está seguro de eliminar la sección? '+ grados.find(g => g.id === idGrado).secciones.find(s => s.idSeccion === idSeccion).denominacion  )) {
    fetch('/api/gradosSecciones/deleteSeccion', postOptions({idSeccion: idSeccion}))
      .then(deleteResponse => deleteResponse.json())
      .then(deleteJson => {
        if(deleteJson.wasDeleted) {
          alert('La sección fue eliminada exitosamente');
          $(`#row${idSeccion}`).remove();
        } else {
          alert('La sección no pudo ser eliminada porque existen alumnos que dependen de ella');
        }
      })
  }
}