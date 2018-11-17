$("#registroDocenteForm").submit(function (e) {
	e.preventDefault();
	let formData = $("#registroDocenteForm").serializeArray();
	let data = {};
	for (let input of formData) {
		if (input.name != "password1" && input.name != "password2" && input.name != "email")
			data[input.name] = input.value.toUpperCase();
		else {
			data[input.name] = input.value;
		}
	}
	$.post('/admin/docentes/registrarDocente', data)
		.done((data) => {
			console.log(data);
			alert(data.status);
			setTimeout(function () { location.reload() }, 1000);
		})
		.fail((err) => {
			console.log(err.responseJSON);
			alert('Error:' + err.responseJSON.status);
		})
});
var seccionesMap = {};
$(function () {
	//Listar Docentes
	fetch('/api/docentes')
		.then((response) => {
			return response.json();
		})
		.then((docentes) => {
			console.log(docentes)
			let index = 1;
			for (let docente of docentes) {
				let tr = $(document.createElement('tr'));
				let th = $(document.createElement('th'));
				th.attr('scope', 'row').append(index);
				tr.append(th);
				let data = ["apellidos", "nombres", "DNI", "email", "estadoActivo"]
				for (let d of data) {
					let td = $(document.createElement('td'));
					if (d == "estadoActivo") {
						td.append(docente[d] == '1' ? 'Activo' : 'Inactivo')
					} else {
						td.append(docente[d]);
					}

					tr.append(td);
				}
				// Acciones
				let tdAcciones = $(document.createElement('td'));
				let buttonSalon = $(document.createElement('button')).addClass('btn btn-primary');
				let buttonActivo = $(document.createElement('button')).addClass('btn btn-warning');
				let buttonAdmin = $(document.createElement('button')).addClass('btn btn-info');
				buttonSalon.attr('data-toggle', 'modal')
				buttonSalon.attr('data-target', '#asignarDocenteModal');
				buttonSalon.attr('data-iddocente', docente.idDocente);
				buttonSalon.attr('id', 'asignarSalonButton-'+docente.idDocente);
				buttonSalon.append('Asignar Salón');

				buttonActivo.append(docente.estadoActivo == '1' ? 'Desactivar' : 'Activar');
				buttonActivo.attr('data-iddocente', docente.idDocente);
				buttonActivo.attr('id', 'toggleActivoButton-'+docente.idDocente);
				buttonAdmin.append(docente.esAdmin == '0' ? 'Hacer Admin' : 'Quitar Admin');
				buttonAdmin.attr('data-iddocente', docente.idDocente);
				buttonAdmin.attr('id', 'toggleAdminButton-'+docente.idDocente);
				tdAcciones.append(buttonSalon, buttonActivo, buttonAdmin);
				tr.append(tdAcciones)
				index += 1;
				$('#docentesTableBody').append(tr);
			}
			asignarListenersSalon();
		})
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
		.then((response)=>{
			return response.json();
		})
		.then((areas)=>{
			let areaSelect = $('#areaSelect');
			for(let area of areas){
				let option = $(document.createElement('option'));
				option.append(area.nombre);
				option.val(area.idArea);
				areaSelect.append(option);
			}
		})

	
});

let idDocenteTemp;
// Listener asginar button

function asignarListenersSalon(){
	$('button[id^="asignarSalonButton"]').click(function(){
		let idDocente = $(this).data('iddocente');
		idDocenteTemp = idDocente;
		getAreaSeccionDocente(idDocente);
	})
	$('button[id^="toggleActivoButton"]').click(function(){
		let idDocente = $(this).data('iddocente');
		let tipo = $(this).html();
		let nuevoEstado = '1';
		if(tipo == 'Desactivar'){
			nuevoEstado = '0';
		}
		$.post(`/api/docentes/toggleEstadoDocente/${idDocente}`, { nuevoEstado: nuevoEstado})
			.done((response)=>{
				alert(response.status);
				setTimeout(function () { location.reload() }, 250);
			})
			.fail((err)=>{
				alert('Error:' + err.responseJSON.status);
			})
	})
	$('button[id^="toggleAdminButton"]').click(function(){
		let idDocente = $(this).data('iddocente');
		let tipo = $(this).html();
		let nuevoEstado = '0';
		if(tipo == 'Hacer Admin'){
			nuevoEstado = '1';
		}
		$.post(`/api/docentes/toggleEstadoAdmin/${idDocente}`, { nuevoEstado: nuevoEstado})
			.done((response)=>{
				alert(response.status);
				setTimeout(function () { location.reload() }, 250);
			})
			.fail((err)=>{
				alert('Error:' + err.responseJSON.status);
			})
	})
}
function getAreaSeccionDocente(idDocente){
	fetch(`/api/docentes/areaSeccion/${idDocente}`)
		.then((response)=>{
			return response.json();
		})
		.then((areasSeccion)=>{
			listarAreaSeccionDocente(areasSeccion);
		})
}
function listarAreaSeccionDocente(areasSeccion){
	console.log("listando", areasSeccion);
	let areaSeccionTable = $('#areaSeccionTable');
	let counter = 1;
	for(let cursoSecc of areasSeccion){
		let tr = $(document.createElement('tr'));
		let th = $(document.createElement('th'));
		th.attr('scope','row');
		th.append(counter);
		let tdGrado = $(document.createElement('td'));
		let tdSeccion = $(document.createElement('td'));
		let tdArea = $(document.createElement('td'));
		tdGrado.append(cursoSecc.grado);
		tdSeccion.append(cursoSecc.seccion);
		tdArea.append(cursoSecc.area);
		tr.append(th, tdGrado, tdSeccion, tdArea);
		areaSeccionTable.append(tr);
		counter+=1;
		console.log('Apeending');
	}
}

$('#guardarAreaSeccionDocente').click(function(){
	let idSeccion = $('#seccionSelect').val();
	let idArea = $('#areaSelect').val();
	console.log("Docente", idDocenteTemp, "seccion", idSeccion, "area", idArea);
	if(!idSeccion || !idArea){
		alert('Tiene que seleccionar una sección y un área');
	}else{
		$.post(`/api/docentes/addAreaSeccion/${idDocenteTemp}`, {'idSeccion': idSeccion, 'idArea':idArea})
			.done((data)=>{
				alert(data.status);
				setTimeout(function () { location.reload() }, 250);
			})
			.fail((err)=>{
				alert('Error:' + err.responseJSON.status);
			})
	}
})
