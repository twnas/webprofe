const connection = require('../db');
const con = new connection();
exports.periodoGet = (req, res) => {
  con.query('SELECT * FROM periodoEscolar ORDER BY año DESC')
    .then((periodos) => {
      res.json(periodos);
    })
}

exports.periodoPost = (req, res) => {
  let periodo = req.body.periodo;
  con.query('SELECT * FROM periodoEscolar WHERE año = ?', [periodo])
    .then((periodos) => {
      if (periodos.length) {
        res.status(400).json({ 'status': 'El periodo ya existe' });
      }else{
        con.query('INSERT INTO periodoEscolar(año, estado) VALUES(?, \'1\')', [periodo])
          .then((insertedRow) => {
            res.json({ 'status': 'ok', 'idPeriodo': insertedRow.insertId });
          })
      }
    })

}

exports.activarPerdiodoPost = (req, res) => {
  let idPeriodo = req.body.idPeriodo;
  con.query('UPDATE periodoEscolar SET estado = \'0\'', [idPeriodo])
    .then((insertedRow) => {
      con.query('UPDATE periodoEscolar SET estado = \'1\' WHERE idPeriodoEscolar = ? ', [idPeriodo])
        .then(() => {
          res.json({ 'status': 'ok' });
        })
    })
}

exports.eliminarPerdiodoPost = (req, res) => {
  let idPeriodo = req.body.idPeriodo;
  con.query('SELECT * FROM area WHERE idPeriodoEscolar = ?', [idPeriodo])
    .then((areas) => {
      con.query('SELECT * FROM grado WHERE idPeriodoEscolar = ?', [idPeriodo])
        .then((grado) => {
          if (areas.length == 0 && grado.length == 0) {
            con.query('DELETE FROM periodoEscolar WHERE idPeriodoEscolar = ? AND estado != \'1\'', [idPeriodo])
              .then(() => {
                res.json({ 'status': 'ok' });
              })
              .catch((err) => {
                console.log("Error:", err);
                res.send(500).json({ 'status': 'Error al borrar periodo en base de datos' });
              })
          } else {
            res.status(400).json({ 'status': 'Periodo tiene información' });
          }
        })
    })
}