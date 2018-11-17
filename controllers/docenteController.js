const connection = require('./db');
const getAreas = require('./api/areas').getAreas;
const getGradosSecciones = require('./api/gradosSecciones').getGradosSecciones;
const passport = require('passport');
let con = new connection();
function getPeriodo() {
  return con.query('SELECT año FROM periodoEscolar WHERE estado = \'1\'').then(rows => {
    return rows;
  });
}

exports.historialEstudianteGet = (req, res)=>{
  res.render('docente/historialEstudiante', {title: 'Historial de estudiantes'});
}

exports.docenteLoginGet = (req, res) => {
  res.render('login', {
    cssFile: "docenteLogin",
    tipoLogin: "Docente"
  });
}

exports.docenteLoginPost = (req, res, next)=>{
  console.log("Body login:", req.body);
  passport.authenticate('local', {
    successRedirect: '/docente/resumenGrado',
    failureRedirect: '/docente/login',
    failureFlash: true
  })(req, res, next)
}

exports.resumenGradoGet = (req, res) => {
  res.render('docente/resumenGrado', {title:'Historial: Área-Grado'});
}

exports.resumenCursoGet = (req, res)=>{
  res.render('docente/resumenCurso', {title:'Historial: Área'});
}
exports.resumenPersonalizadoGet = (req, res)=>{
  res.render('docente/resumenPersonalizado', {title:'Historial: Área-Grado-Sección'});
}

exports.planMejoraGet = (req, res) => {
  Promise.all([getPeriodo(), getAreas(), getGradosSecciones()]).then(matrix => {
    [periodo, areas, grados] = matrix;
    res.render('docente/planMejora', {periodo: periodo[0]['año'], areas: areas, title: 'Plan de mejora', grados: grados});
  })
}
exports.metasGet = (req, res) => {
  Promise.all([getPeriodo(), getAreas(), getGradosSecciones()]).then(matrix => {
    [periodo, areas, grados] = matrix;
    res.render('docente/metas', {periodo: periodo[0]['año'], areas: areas, title: 'Metas', grados: grados});
  })
}