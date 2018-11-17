const connection = require('../db');
const con = new connection();
exports.notasGet = (req, res) => {
  ({idSeccion, idArea} = req.params);
  let notasResponse = [];
  con.query(`SELECT a.idSeccion, n.idArea, a.idAlumno, CONCAT(a.apellidoPaterno, " ", a.apellidoMaterno) AS apellidos, a.nombres, n.primerBimestre, n.segundoBimestre, n.tercerBimestre, n.cuartoBimestre FROM notasAlumnoArea n
    RIGHT JOIN alumno a ON a.idAlumno = n.idAlumno
    AND n.idArea = ? WHERE a.idSeccion = ?;
  `, [idSeccion, idArea]).then(notas => {
    notas.forEach(nota => {
      notasResponse.push({
        idAlumno: nota.idAlumno,
        idArea: nota.idArea,
        apellidos: nota.apellidos,
        nombres: nota.nombres,
        notas: [
          nota.primerBimestre,
          nota.segundoBimestre,
          nota.tercerBimestre,
          nota.cuartoBimestre
        ]
      })
    });
    res.json(notasResponse);
  });
};

exports.updateNotasPost = (req, res) => {
  ({notasForUpdate, idAlumno, idArea} = req.body);
  con.query('SELECT COUNT(*) AS existe FROM notasAlumnoArea '+
  ' WHERE idAlumno = ? AND idArea = ?', [idAlumno, idArea]).then(rows => {
    if(rows[0].existe < 1) {
      return con.query(`INSERT INTO notasAlumnoArea(
        idAlumno,
        idArea,
        primerBimestre,
        segundoBimestre,
        tercerBimestre,
        cuartoBimestre
      ) VALUES (
        ?,?,?,?,?,? 
      )`, [
        idAlumno,
        idArea,
        notasForUpdate[0],
        notasForUpdate[1],
        notasForUpdate[2],
        notasForUpdate[3]
      ]);
    } else {
      return con.query(`UPDATE notasAlumnoArea SET
       primerBimestre = ?, 
       segundoBimestre = ?, 
       tercerBimestre = ?, 
       cuartoBimestre = ? WHERE idAlumno = ? AND idArea = ?`, [
        notasForUpdate[0],
        notasForUpdate[1],
        notasForUpdate[2],
        notasForUpdate[3],
        idAlumno,
        idArea
      ])
    }
  }).then(result => {
    res.json({result: "ok", registro: notasForUpdate})
  })
};

exports.banearAlumnoPost = (req, res) => {
  ({idAlumno, idArea, tipo} = req.body);
  console.log(idAlumno, idArea);
  con.query('SELECT COUNT(*) AS existe FROM notasAlumnoArea '+
  ' WHERE idAlumno = ? AND idArea = ?', [idAlumno, idArea]).then(rows => {
    if(rows[0].existe < 1) {
      if(tipo === 'esExonerado') {
        con.query('INSERT INTO notasAlumnoArea(idAlumno, idArea, esExonerado)VALUES(?,?,\'1\')', [idAlumno, idArea]).then(result => {
          return result;
        })
      } else {
        con.query('INSERT INTO notasAlumnoArea(idAlumno, idArea, noAsiste)VALUES(?,?,\'1\')', [idAlumno, idArea]).then(result => {
          return result;
        })
      }
    } else {
      if(tipo === 'esExonerado') {
        con.query('UPDATE notasAlumnoArea SET esExonerado = \'1\' WHERE idAlumno = ? AND idArea = ?', [idAlumno, idArea]).then(result => {
          return result;
        })
      } else {
        con.query('UPDATE notasAlumnoArea SET noAsiste = \'1\' WHERE idAlumno = ? AND idArea = ?', [idAlumno, idArea]).then(result => {
          return result;
        })
      }
    }
  }).then(result => {
    res.json({result: "ok"});
  })
  
}