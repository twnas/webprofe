const connection = require('../db.js');
const con = new connection();
exports.docentesGet = (req, res) => {
  con.query('SELECT idUsuario idDocente, nombres, CONCAT(apellidoPaterno," ", apellidoMaterno) apellidos, DNI, email, estadoActivo, esAdmin FROM usuario ORDER BY apellidoPaterno, apellidoMaterno, nombres')
    .then((docentes) => {
      res.json(docentes);
    });
};

exports.docentesAreaSeccionGet = (req, res) => {
  let idDocente = req.params.idDocente;
  let query = 'SELECT aSD.*,g.denominacion grado, s.denominacion seccion, a.nombre area ' +
    'FROM areaSeccionDocente aSD ' +
    'JOIN area a ON a.idArea = aSD.idArea ' +
    'JOIN seccion s ON s.idSeccion = aSD.idSeccion ' +
    'JOIN grado g ON s.idGrado = g.idGrado ' +
    'WHERE aSD.idDocente = ? ' +
    'ORDER BY g.correlativo, s.denominacion, a.nombre'
  con.query(query, [idDocente])
    .then((docentes) => {
      res.json(docentes);
    })
    .catch((err) => {
      res.status(500).json({ 'status': 'Error en la base de datos' });
      console.log('Error:', err);
    })
}

exports.addAreaSeccionDocentePost = (req, res) => {
  let idDocente = req.params.idDocente;
  let idSeccion = req.body.idSeccion;
  let idArea = req.body.idArea;
  if (!idDocente || !idSeccion || !idArea) {
    res.status(400).json({ 'status': 'Faltan parámetros' });
  } else {

    con.query('SELECT * FROM areaSeccionDocente WHERE idArea = ? AND idSeccion = ? AND idDocente = ?', [idArea, idSeccion, idDocente])
      .then((lista) => {
        if (lista.length == 0) {
          con.query('INSERT INTO areaSeccionDocente(idArea, idSeccion, idDocente) ' +
            'VALUES (?,?,?)', [idArea, idSeccion, idDocente])
            .then((insertedRow) => {
              res.json({ 'status': 'Se agregó area, sección al docente' });
            })
            .catch((err) => {
              res.stauts(500).json({ 'status': 'Error en la base de datos' });
              console.log('Error:', err);
            })
        } else {
          res.status(400).json({ 'status': 'El docente ya tiene asignado esa sección y area' });
        }
      })
  }
}

exports.toggleEstadoDocentePost = (req, res) => {
  let nuevoEstado = req.body.nuevoEstado;
  let idDocente = req.params.idDocente;
  if (!nuevoEstado || !idDocente) {
    res.status(400).json({ 'status': 'Faltan parametros' });
  } else {
    idDocente = Number(idDocente);
    con.query('UPDATE usuario SET estadoActivo = ? WHERE idUsuario = ?', [nuevoEstado, idDocente])
      .then((updatedRow) => {
        res.json({ 'status': 'Se actualizó el estado' });
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).json({ 'status': 'Ocurrió un error en la base de datos' });
      })
  }
}


exports.toggleAdminDocentePost = (req, res) => {
  let nuevoEstado = req.body.nuevoEstado;
  let idDocente = req.params.idDocente;
  if (!nuevoEstado || !idDocente) {
    res.status(400).json({ 'status': 'Faltan parametros' });
  } else {
    idDocente = Number(idDocente);
    con.query('SELECT count(*) c from usuario WHERE esAdMIN = \'1\'')
      .then((counter) => {
        counter = counter[0].c;
        console.log(counter, nuevoEstado);
        if (counter <= 1 && nuevoEstado=='0') {
          res.status(400).json({ 'status': 'Inválido, debe de existir al menos un administrador' });
        } else {
          con.query('UPDATE usuario SET esAdmin = ? WHERE idUsuario = ?', [nuevoEstado, idDocente])
            .then((updatedRow) => {
              res.json({ 'status': 'Se actualizó el estado' });
            })
            .catch((err) => {
              console.log("Error:", err);
              res.status(500).json({ 'status': 'Ocurrió un error en la base de datos' });
            })
        }
      })
  }
}
exports.administradoresGet = (req, res) => {
  con.query('SELECT nombres, DNI, estadoActivo, email, CONCAT(apellidoPaterno, \' \', apellidoMaterno) apellidos FROM usuario WHERE esAdmin = \'1\'')
    .then((administradores) => {
      res.json(administradores);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ status: 'Error en la base de datos' });
    })
}