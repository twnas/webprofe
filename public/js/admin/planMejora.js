let tiposDeMensaje = ['Fortaleza', 'Estrategia', 'Compromiso'];
let metaNames = ['(18 - 20)', '(14 - 17)', '(11 - 13)', '(0 - 10)']
let aeNames = ['(18 - 20)', 'Mayoría', '(0 - 10)']
let idTipoMensaje = 0;
let gradosSecciones, areas;
let postOptions = (ob) => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ob)
  }
};

$(document).ready(() => {
  $('#confirmarNuevoMensaje').on('click', () => {
    newMensaje({
      idArea: idAreaActual,
      idSeccion: idSeccionActual,
      contenido: $('#inputNuevoMensaje').val(),
      idTipoMensaje: idTipoMensaje + 1
    });
  })

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
    getMensajes(idAreaActual, idSeccionActual);
  })

  $('#selectArea').bind('change', function() {
    idAreaActual = $(this).val();
    getMensajes(idAreaActual, idSeccionActual);
  })
});

function openModal(tipoMensaje) {
  idTipoMensaje = tipoMensaje;
  $('#nuevoMensajeModal span.input-group-text').text(tiposDeMensaje[tipoMensaje]);
  $('#nuevoMensajeModalLabel').text('Agregar ' + tiposDeMensaje[tipoMensaje]);
  $('#inputNuevoMensaje').val('');
  $('#nuevoMensajeModal').modal('show');
}

function getMetas(idArea, idSeccion) {
  return fetch(`/api/gradosSecciones/historialLogrosSeccion/${idSeccion}/${idArea}}]`)
}

function getMensajes(idArea, idSeccion) {
  fetch(`/api/planMejora/${idArea}/${idSeccion}`)
    .then(planMejoraResponse => planMejoraResponse.json())
    .then(planMejora => {
      limpiarMensajes();
      planMejora.fortalezas.forEach(fortaleza => {
        $('#listFortalezas').append(`
        <li id="mensaje${fortaleza.idMensaje}" class="list-group-item list-group-item-action">
          <button onclick="eliminarMensaje(${fortaleza.idMensaje})" class="btn btn-outline-danger btn-sm float-right">&times;</button>
          <span>${fortaleza.contenido}</span>
        </li>
        `);
      })
      planMejora.estrategias.forEach(estrategia => {
        $('#listEstrategias').append(`
        <li id="mensaje${estrategia.idMensaje}" class="list-group-item list-group-item-action">
          <button onclick="eliminarMensaje(${estrategia.idMensaje})" class="btn btn-outline-danger btn-sm float-right">&times;</button>
          <span>${estrategia.contenido}</span>
        </li>
        `);
      })
      planMejora.compromisos.forEach(compromiso => {
        $('#listCompromisos').append(`
        <li id="mensaje${compromiso.idMensaje}" class="list-group-item list-group-item-action">
          <button onclick="eliminarMensaje(${compromiso.idMensaje})" class="btn btn-outline-danger btn-sm float-right">&times;</button>
          <span>${compromiso.contenido}</span>
        </li>
        `);
      })
    })
  getMetas(idArea, idSeccion).then(metasResponse => metasResponse.json())
    .then(metasJson => {
      let meta = metasJson.metas.find(m => m.idBimestre != null) || metas[3];
      let total = 0;
      for(let i=1;i<=4;i++){
        total += meta['intervalo'+(i)];
        $(`#m${i} strong`).text(`${metaNames[i-1]} ${(n=meta['intervalo'+i])?n:0}`);
      }

      $(`#ae1 strong`).text(aeNames[0] + ' ' + (((n=meta.intervalo1)?n:0)*100/total).toFixed(2) + ' %');
      $(`#ae2 strong`).text(aeNames[1] + ' ' + (((n=meta.intervalo2+meta.intervalo3)?n:0)*100/total).toFixed(2) + ' %');
      $(`#ae3 strong`).text(aeNames[2] + ' ' + (((n=meta.intervalo4)?n:0)*100/total).toFixed(2) + ' %');
    })
}

function getGradosSecciones() {
  return fetch('/api/gradosSecciones').then(gradosSeccionesResponse => gradosSeccionesResponse.json())
}

function getAreas() {
  return fetch('/api/areas').then(areasResponse => areasResponse.json())
}

Promise.all([getGradosSecciones(), getAreas()]).then(matrix => {
  [gradosSecciones, areas, metasResponse] = matrix;
  idGradoActual = gradosSecciones[0].id;
  idSeccionActual = gradosSecciones[0].secciones[0].idSeccion;
  idAreaActual = areas[0].idArea;
  getMensajes(idAreaActual, idSeccionActual);
})

function limpiarMensajes() {
  $('#listFortalezas').html(`<button class="btn btn-primary list-group-item list-group-item-action" onclick="openModal(0)">Agregar fortaleza</butto`)
  $('#listEstrategias').html(`<button class="btn btn-primary list-group-item list-group-item-action" onclick="openModal(1)">Agregar estrategia</butto`)
  $('#listCompromisos').html(`<button class="btn btn-primary list-group-item list-group-item-action" onclick="openModal(2)">Agregar compromiso</butto`)
  for(let i = 1; i <= 4; i++) {
    $(`#m${i} strong`).text(metaNames[i-1]);
  }
  for(let i = 1; i <= 3; i++) {
    $(`#ae${i} strong`).text(aeNames[i-1]);
  }
}

function newMensaje(mensaje) {
  fetch('/api/planMejora/newMensaje', postOptions(mensaje)).then(response => {
    switch (idTipoMensaje) {
      case 0: 
        $('#listFortalezas').append(`
        <li id="mensaje${response.insertId}" class="list-group-item list-group-item-action">
        <button onclick="eliminarMensaje(${response.insertId})" class="btn btn-outline-danger btn-sm float-right">&times;</button>
          <span>${$('#inputNuevoMensaje').val()}</span>
        </li>
        `);
        break;
      case 1: 
        $('#listEstrategias').append(`
        <li id="mensaje${response.insertId}" class="list-group-item list-group-item-action">
          <button onclick="eliminarMensaje(${response.insertId})" class="btn btn-outline-danger btn-sm float-right">&times;</button>
          <span>${$('#inputNuevoMensaje').val()}</span>
        </li>
        `);
        break;
      case 2: 
        $('#listCompromisos').append(`
        <li id="mensaje${response.insertId}" class="list-group-item list-group-item-action">
          <button onclick="eliminarMensaje(${response.insertId})" class="btn btn-outline-danger btn-sm float-right">&times;</button>
          <span>${$('#inputNuevoMensaje').val()}</span>
        </li>
        `);
        break;
      default:
        break;
    }
  })
}

function eliminarMensaje(idMensaje) {
  if(confirm('¿Estás seguro de eliminar?')) {
    fetch('/api/planMejora/deleteMensaje', postOptions({idMensaje: idMensaje})).then(result => {
      $(`#mensaje${idMensaje}`).remove();
    })
  }
}