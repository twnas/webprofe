const connection = require('../db');
const con = new connection();

exports.metasPorSeccion = (idAreaSeccionDocente) => {
  let query = 'SELECT * FROM bimestre b ' +
    'LEFT JOIN metaBimestre mB ON b.idBimestre = mB.idBimestre ' +
    'AND mB.idAreaSeccionDocente = ? ' +
    'ORDER BY b.correlativo ASC';
  return con.query(query, [idAreaSeccionDocente])
    .then((metas) => {
      return metas;
    });
}

exports.notasPorSeccionCurso = (idArea, idSeccion) => {
  let query = 'SELECT a.idAlumno, a.apellidoPaterno, a.apellidoMaterno, a.nombres, ' +
    'IFNULL(nAA.primerBimestre,0) as 1B , IFNULL(nAA.segundoBimestre,0) 2B, IFNULL(nAA.tercerBimestre,0) 3B,IFNULL(nAA.CuartoBimestre, 0) 4B, ' +
    'IFNULL(nAA.esExonerado, \'0\') exonerado, IFNULL(nAA.noAsiste,\'0\') noAsiste ' +
    'FROM alumno a ' +
    'LEFT JOIN notasAlumnoArea nAA ON nAA.idALumno = a.idAlumno AND nAA.idArea = ?' +
    'WHERE a.idSeccion = ?'
  return con.query(query, [idArea, idSeccion])
    .then((notas) => {
      return notas;
    })
}

exports.getIdAreaSeccionDocente = (idArea, idSeccion) => {
  return con.query('SELECT * FROM areaSeccionDocente WHERE idArea = ? AND idSeccion = ? LIMIT 1', [idArea, idSeccion])
    .then((areaSeccionDocente) => {
      if (areaSeccionDocente.length) {
        return areaSeccionDocente[0].idAreaSeccionDocente;
      } else {
        return false;
      }
    })
}