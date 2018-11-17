const express = require('express');
const router = express.Router();

/* Carga de API's */
const apiPeriodo = require('../controllers/api/periodo');
const apiAreas = require('../controllers/api/areas');
const apiGradosSecciones = require('../controllers/api/gradosSecciones');
const apiDocentes = require('../controllers/api/docentes');
const apiNotas = require('../controllers/api/notas');
const apiEstudiantes = require('../controllers/api/estudiantes');
const apiPlanMejora = require('../controllers/api/docente/planMejora');
const apiMetas = require('../controllers/api/metas');

/**************
 ** PERIODOS **
 **************/
router.get('/periodo', apiPeriodo.periodoGet);
router.post('/periodo/registrar', apiPeriodo.periodoPost);
router.post('/periodo/eliminar', apiPeriodo.eliminarPerdiodoPost);
router.post('/periodo/activar', apiPeriodo.activarPerdiodoPost);

/**************
 *** ÁREAS ***
 **************/
router.get('/areas', apiAreas.areasGet);
router.post('/areas/newArea', apiAreas.newAreaPost);
router.post('/areas/updateArea', apiAreas.updateAreaPost);
router.post('/areas/deleteArea', apiAreas.deleteAreaPost);

/********************
 *GRADOS Y SECCIONES*
 ********************/
router.get('/gradosSecciones', apiGradosSecciones.gradosSeccionesGet);
router.post('/gradosSecciones/newSeccion', apiGradosSecciones.newSeccionPost);
router.post('/gradosSecciones/newGrado', apiGradosSecciones.newGradoPost);
router.post('/gradosSecciones/deleteGrado', apiGradosSecciones.deleteGradoPost);
router.post('/gradosSecciones/deleteSeccion', apiGradosSecciones.deleteSeccionPost);
router.get('/gradosSecciones/historialLogrosSeccion/:idSeccion/:idArea', apiGradosSecciones.historialLogrosSeccionGet);
router.get('/gradosSecciones/historialLogrosGrado/:idGrado/:idArea', apiGradosSecciones.historialLogrosGradoGet);
router.get('/gradosSecciones/historialLogrosArea/:idArea', apiGradosSecciones.historialLogrosAreaGet);

/*********************
 ***** DOCENTES ******
 *********************/

router.get('/docentes/', apiDocentes.docentesGet);
router.get('/docentes/areaSeccion/:idDocente', apiDocentes.docentesAreaSeccionGet);
router.post('/docentes/addAreaSeccion/:idDocente', apiDocentes.addAreaSeccionDocentePost);
router.post('/docentes/toggleEstadoDocente/:idDocente', apiDocentes.toggleEstadoDocentePost);
router.post('/docentes/toggleEstadoAdmin/:idDocente', apiDocentes.toggleAdminDocentePost);
router.get('/docente/administradores/', apiDocentes.administradoresGet);


/*********************
 ******* NOTAS *******
 *********************/
router.get('/notas/:idSeccion/:idArea', apiNotas.notasGet);
router.post('/notas/updateNotas', apiNotas.updateNotasPost);
router.post('/notas/banearAlumno', apiNotas.banearAlumnoPost);

/*********************
 **** ESTUDIANTES  ***
 *********************/
router.post('/estudiantes/actualizar/:idAlumno', apiEstudiantes.actualizarAlumnoPost);
router.post('/estudiantes/toggleEstado/:idAlumno/:nuevoEstado', apiEstudiantes.toggleEstadoAlumno);
router.get('/estudiantes/listar/:idSeccion', apiEstudiantes.alumnosGradoSeccionGet);
router.get('/estudiantes/notas/:idAlumno/:idArea', apiEstudiantes.notasAlumnoAreaGet);
router.post('/estudiantes/agregar/:idSeccion', apiEstudiantes.registrarAlumnoSeccionPost);

/*********************
 ** PLAN DE MEJORA ***
 *********************/
router.get('/planMejora/:idArea/:idSeccion', apiPlanMejora.mensajesGet);
router.post('/planMejora/newMensaje', apiPlanMejora.newMensajePost);
router.post('/planMejora/editarMensaje', apiPlanMejora.updateMensajePost);
router.post('/planMejora/deleteMensaje', apiPlanMejora.deleteMensajePost);

/*********************
 ******* METAS *******
 *********************/
router.get('/metas/:idArea/:idSeccion', apiMetas.metasGet);
router.post('/updateMetas', apiMetas.updateMetasPost);

module.exports = router;

