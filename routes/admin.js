const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminDocenteController = require('../controllers/admin/docenteController');
const { ensureAdminAuthenticated } = require('../helpers/auth');


router.get('/login', adminController.loginAdminGet);
router.post('/login', adminController.loginAdminPost);

router.get('/index', ensureAdminAuthenticated, adminController.resumenAdminGet);

router.get('/periodos', ensureAdminAuthenticated, adminController.periodosAdminGet);

router.get('/areas', ensureAdminAuthenticated, adminController.areasAdminGet);

router.get('/gradosSecciones', ensureAdminAuthenticated, adminController.gradosSeccionesAdminGet);

router.get('/docentes', ensureAdminAuthenticated, adminController.docentesAdminGet);
router.post('/docentes/registrarDocente', ensureAdminAuthenticated, adminDocenteController.registrarDocentesPost);

router.get('/administradores', ensureAdminAuthenticated, adminController.administradoresGet);

router.get('/estudiantes', ensureAdminAuthenticated, adminController.estudiantesAdminGet);
router.get('/estudiantes/:idSeccion', ensureAdminAuthenticated, adminController.estudiantesSeccionGet);

router.get('/notas', ensureAdminAuthenticated, adminController.notasAdminGet);

router.get('/planMejora', ensureAdminAuthenticated, adminController.planMejoraAdminGet);

router.get('/metas', ensureAdminAuthenticated, adminController.metasGet);

module.exports = router;
