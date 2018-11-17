let idAreaActual, idSeccionActual, areas, gradosSecciones, bimestreActual;

let postOptions = (ob) => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ob)
  }
};

function getMetas(idArea, idSeccion) {
  fetch(`/api/metas/${idArea}/${idSeccion}`)
    .then(metasResponse => metasResponse.json())
    .then(metas => {
      limpiarMetas();
      poblarMetas(metas);
    });
}

$(document).ready(() => {
  $('#selectGrado').bind('change', function() {
    idGradoActual = $(this).val();
    $('#selectSeccion').html('');
    gradosSecciones.find(grado => grado.id == idGradoActual).secciones.forEach((seccion) => {
      $('#selectSeccion').append(`
      <option value="${seccion.idSeccion}">${seccion.denominacion}</option>
      `)
    })
  })

  $('#confirmarEditarMetas').on('click', () => {
    let updateRequest = {
      intervalos: [
        $('#inputIntervalo1').val(),
        $('#inputIntervalo2').val(),
        $('#inputIntervalo3').val(),
        $('#inputIntervalo4').val()
      ],
      idBimestre: bimestreActual,
      idArea: idAreaActual,
      idSeccion: idSeccionActual
    }
    fetch('/api/updateMetas', postOptions(updateRequest))
      .then(updateResponse => updateResponse.json())
      .then(update => {
        console.log(update)
        getMetas(idAreaActual, idSeccionActual);
      });
  })

  $('#selectSeccion').bind('change', function() {
    idSeccionActual = $(this).val();
    getMetas(idAreaActual, idSeccionActual);
  })

  $('#selectArea').bind('change', function() {
    idAreaActual = $(this).val();
    getMetas(idAreaActual, idSeccionActual);
  })
})
Promise.all([getGradosSecciones(), getAreas()]).then(matrix => {
  [gradosSecciones, areas] = matrix;
  idGradoActual = gradosSecciones[0].id;
  idSeccionActual = gradosSecciones[0].secciones[0].idSeccion;
  idAreaActual = areas[0].idArea;
  getMetas(idAreaActual, idSeccionActual);
})

function getGradosSecciones() {
  return fetch('/api/gradosSecciones').then(gradosSeccionesResponse => gradosSeccionesResponse.json())
}

function getAreas() {
  return fetch('/api/areas').then(areasResponse => areasResponse.json())
}

function limpiarMetas() {
  for(let i=1; i<=4; i++){
    for(let j=2; j<=4; j++){
      $(`#${i}-${j}`).text('');
    }
  }
}

function poblarMetas(metas) {
  console.log(metas);
  for(let i=1; i<=4; i++){
    for(let j=2; j<=4; j++){
      let metaForPut = metas.find(meta => meta.idBimestre === j)
      $(`#${i}-${j}`).text(metaForPut?metaForPut[`intervalo${i}`]?metaForPut[`intervalo${i}`]:'':'');
    }
  }
}

function editarMetas(bimestre) {
  bimestreActual = bimestre;
  for(let i=1; i<=4; i++){
    $(`#inputIntervalo${i}`).val($(`#${i}-${bimestre}`).text())
  }
  $('#editarMetasModal').modal('show');
}