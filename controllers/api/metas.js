const connection = require('../db');
const reportes = require('./reportes');
let con = new connection();
exports.metasGet = (req, res) => {
  ({idArea, idSeccion} = req.params);
  let con = new connection();
  con.query(`SELECT mB.idBimestre, asd.idAreaSeccionDocente, asd.idArea, asd.idSeccion, intervalo1, intervalo2, intervalo3, intervalo4 FROM bimestre b
  LEFT JOIN metaBimestre mB ON b.idBimestre = mB.idBimestre
  JOIN areaSeccionDocente asd ON asd.idAreaSeccionDocente = mB.idAreaSeccionDocente
  WHERE asd.idSeccion = ? AND asd.idArea = ?
  ORDER BY b.correlativo ASC;`, [idSeccion, idArea]).then((result) => {
    con.close();
    res.json(result);
  }) 
}

exports.updateMetasPost = (req, res) => {
  const con = new connection();
  console.log(req.body);
  ({idBimestre, idArea, idSeccion, intervalos}  = req.body);
  reportes.getIdAreaSeccionDocente(idArea, idSeccion).then(idAreaSeccionDocente => {
    if(idAreaSeccionDocente) {
      con.query('SELECT COUNT(*) AS existe FROM metaBimestre WHERE idAreaSeccionDocente = ? AND idBimestre = ?', [idAreaSeccionDocente, idBimestre]).then(rows => {
        if(rows[0].existe < 1) {
          con.query('INSERT INTO metaBimestre(idAreaSeccionDocente, idBimestre, intervalo1, intervalo2, intervalo3, intervalo4) VALUES (?,?,?,?,?,?)', [
            idAreaSeccionDocente, idBimestre, intervalos[0], intervalos[1], intervalos[2], intervalos[3]
          ]).then(result => res.json({result: 'ok', update: result}))
        } else {
          con.query('UPDATE metaBimestre SET intervalo1 = ?, intervalo2 = ?, intervalo3 = ?, intervalo4 = ? WHERE idBimestre = ? AND idAreaSeccionDocente = ?', [
            intervalos[0], intervalos[1], intervalos[2], intervalos[3], idBimestre, idAreaSeccionDocente
          ]).then(result => res.json({result: 'ok', update: result}))
        }
      });
    } else {
      con.query('INSERT INTO areaSeccionDocente(idArea, idSeccion) VALUES (?, ?)', [idArea, idSeccion]).then(insertedRow => {
        let newIdAreaSeccionDocente = rows[0].idAreaSeccionDocente;
        con.query('INSERT INTO metaBimestre(idAreaSeccionDocente, idBimestre, intervalo1, intervalo2, intervalo3, intervalo4) VALUES (?,?,?,?,?,?)', [
          newIddAreaSeccionDocente, idBimestre, intervalos[0], intervalos[1], intervalos[2], intervalos[3]
        ]).then(result => res.json({result: 'ok', update: result}))
      });
    }
  })
}