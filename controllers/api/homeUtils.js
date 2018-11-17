const connection = require('../db');
const con = new connection();

function getPeriodoEscolar() {
  return con.query('SELECT * FROM periodoEscolar WHERE estado = \'1\'').then(periodoEscolar => periodoEscolar[0]);
}
function getResumenDocentes () {
  return con.query('SELECT COUNT(*) AS resumen FROM usuario WHERE estadoActivo = \'1\'');
}
function getResumenEstudiantes () {
  return getPeriodoEscolar().then(periodoEscolar => {
    return con.query(`SELECT COUNT(*) AS resumen FROM alumno a 
    JOIN seccion s ON s.idSeccion = a.idSeccion
    JOIN grado g ON g.idGrado = s.idGrado
    WHERE a.estado = '1' AND g.idPeriodoEscolar = ?`, [periodoEscolar.idPeriodoEscolar]);
  })
}
function getResumenAdministradores () {
  return con.query('SELECT COUNT(*) AS resumen FROM usuario WHERE estadoActivo = \'1\' AND esAdmin =\'1\'');
}
function getResumenGrados () {
  return getPeriodoEscolar().then(periodoEscolar => {
    return con.query('SELECT COUNT(*) AS resumen FROM grado WHERE idPeriodoEscolar = ?', [periodoEscolar.idPeriodoEscolar])
  })
}
function getResumenSecciones () {
  return getPeriodoEscolar().then(periodoEscolar => {
    return con.query('SELECT COUNT(*) AS resumen FROM seccion s JOIN grado g ON s.idGrado = g.idGrado WHERE g.idPeriodoEscolar = ?', [periodoEscolar.idPeriodoEscolar])
  })
}
function getResumenAreas () {
  return getPeriodoEscolar().then(periodoEscolar => {
    return con.query('SELECT COUNT(*) AS resumen FROM area WHERE estado = \'1\' AND idPeriodoEscolar = ?', [periodoEscolar.idPeriodoEscolar]);
  })
}

module.exports = {
  getPeriodoEscolar,
  getResumenDocentes,
  getResumenEstudiantes,
  getResumenAdministradores,
  getResumenGrados,
  getResumenSecciones,
  getResumenAreas
}


