const connection = require('../../db');
const {getIdAreaSeccionDocente} = require('../reportes');
let con = new connection();
exports.mensajesGet = (req, res) => {
  
  let mensajes = {};
  ({idArea, idSeccion} = req.params);
  con.query('SELECT idMensaje, contenido, idTipoMensaje FROM mensaje WHERE idArea = ? AND idSeccion = ?', 
  [idArea, idSeccion]).then(rows => {
    mensajes['fortalezas'] = rows.filter(row => row.idTipoMensaje === 1);
    mensajes['estrategias'] = rows.filter(row => row.idTipoMensaje === 2);
    mensajes['compromisos'] = rows.filter(row => row.idTipoMensaje === 3);
    res.json(mensajes);
  })
}

exports.newMensajePost = (req, res) => {
  ({idArea, idSeccion, contenido, idTipoMensaje} = req.body);
  con.query('INSERT INTO mensaje(idArea, idSeccion, contenido, idTipoMensaje) VALUES(?,?,?,?)',
  [idArea, idSeccion, contenido, idTipoMensaje]).then(insertedRow => {
    console.log(insertedRow);
    res.json({result: "ok", registro: insertedRow[0]});
  })
}

exports.updateMensajePost = (req, res) => {
  ({idMensaje, contenido} = req.body);
  con.query('UPDATE mensaje SET contenido = ? WHERE idMensaje = ?', [idMessage, contenido]).then(updatedRow => {
    res.json({result: "ok"}); 
  })
}

exports.deleteMensajePost = (req, res) => {
  con.query('DELETE FROM mensaje WHERE idMensaje = ?', [req.body.idMensaje]).then(result => {
    console.log(result);
    res.json(result);
  })
}