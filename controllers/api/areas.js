const connection = require('../db.js');
const con = new connection();
exports.getAreas = () => {
  return con.query(
    'SELECT idPeriodoEscolar FROM periodoEscolar WHERE estado = \'1\''
  ).then(row => {
    let idPeriodo = row[0].idPeriodoEscolar;
    return con.query('SELECT * FROM area WHERE idPeriodoEscolar = ? AND estado = ?', [idPeriodo, '1']);
  }).then(areas => {
    return areas;
  })
};

exports.areasGet = (req, res) => {
  exports.getAreas().then(areas => {
    res.json(areas);
  })
};

exports.newAreaPost = (req, res) => {
  let newArea = req.body;
  con.query(
    'INSERT INTO area(nombre, idPeriodoEscolar, estado) VALUES (?,?,1)',
    [newArea.nombre, newArea.idPeriodoEscolar]
  ).then(insertedRow => {
    console.log(insertedRow);
    res.json({ 'result': 'ok', 'newArea': insertedRow.insertId });
  });
};

exports.updateAreaPost = (req, res) => {
  let areaForUpdate = req.body;
  con.query('UPDATE area SET nombre = ? WHERE idArea = ?', [areaForUpdate.nombre, areaForUpdate.idArea]).then((updatedRow) => {
    res.json({ 'result': 'ok' })
  });
};

exports.deleteAreaPost = (req, res) => {
  let areaForDelete = req.body;
  con.query('UPDATE area SET estado = \'0\' WHERE idArea = ?', [areaForDelete.idArea]).then((rowUpdated) => {
    res.json({ 'result': 'ok', 'idAreaEliminada': rowUpdated[0].idArea })
  });
};