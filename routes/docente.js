const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');
const { ensureAuthenticated } = require('../helpers/auth');
/* GET home page. */
router.get('/login', docenteController.docenteLoginGet);
router.post('/login', docenteController.docenteLoginPost);

router.get('/planMejora', ensureAuthenticated, docenteController.planMejoraGet);

router.get('/metas', ensureAuthenticated, docenteController.metasGet);

router.get('/historialEstudiante', ensureAuthenticated, docenteController.historialEstudianteGet);

router.get('/resumenGrado', ensureAuthenticated, docenteController.resumenGradoGet);

router.get('/resumenCurso', ensureAuthenticated, docenteController.resumenCursoGet);

router.get('/resumenPersonalizado', ensureAuthenticated, docenteController.resumenPersonalizadoGet);

module.exports = router;
