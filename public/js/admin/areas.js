let areaSeleccionada = null;
let areas = null;
let postOptions = (ob) => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ob)
  }
};

fetch('/api/areas').then(areas =>{
  return areas.json()
}).then(as =>{
  areas = as;
});

function setAreaSeleccionada(idArea) {
  areaSeleccionada = areas.find(area => area.idArea === idArea);
  $('.list-group-item').removeClass('active');
  $('#item' + idArea).addClass('active');
  $('#inputNuevoNombreArea').val(areaSeleccionada.nombre);
  $('#modificarArea').removeAttr('disabled');
}
$(document).ready(() => {
  $('#confirmarNuevaArea').on('click', () => {
    let nombreArea = $('#inputNombreArea').val();
    newArea({nombre: nombreArea, idPeriodoEscolar: areas[0].idPeriodoEscolar});
  });

  $('#eliminarArea').on('click', () => {
    deleteArea({idArea: areaSeleccionada.idArea});
  });

  $('#confirmarModificarArea').on('click', () => {
    let nombrePorModificar = $('#inputNuevoNombreArea').val();
    updateArea({nombre: nombrePorModificar, idArea: areaSeleccionada.idArea});
  });
});

function newArea(area) {
  fetch('/api/areas/newArea', postOptions(area)).then(newArea => {
    let newAreaHtml = `<span class="list-group-item list-group-item-action" id="item${newArea.idArea}" onclick="setAreaSeleccionada(${newArea.idArea})">
        ${area.nombre}
      </span>`;
    $('#listAreas').append(newAreaHtml);
  });
}

function updateArea(area) {
  fetch('/api/areas/updateArea', postOptions(area)).then(newAreaResponse => {
    $('#item' + area.idArea).text(area.nombre);
  });
}

function deleteArea(area) {
  fetch('/api/areas/deleteArea', postOptions(area)).then(deletedArea => {
    $('#item' + areaSeleccionada.idArea).remove();
  });
}