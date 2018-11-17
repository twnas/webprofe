const connection = require('../db.js');
const reportes = require('./reportes');
const {getPeriodoEscolar} = require('./homeUtils');
const con = new connection();

exports.getGradosSecciones = () => {
  let gradosSecciones = {};
  let query = `SELECT g.idGrado, g.correlativo,
  g.denominacion AS denominacionGrado,
  s.denominacion AS denominacionSeccion, s.idSeccion
	FROM grado g 
    LEFT JOIN seccion s ON g.idGrado = s.idGrado
    AND '1' = '1'
    ORDER BY g.correlativo, s.denominacion;`;
  return con.query(query).then(rows => {
    let promises = [];
    rows.forEach((row, index) => {
      promises.push(con.query(`SELECT ? AS idGrado, idSeccion, COUNT(*) AS numAlumnos FROM alumno WHERE idSeccion = ?`, [row.idGrado, row.idSeccion]))
    });
    rows.forEach(row => {
      gradosSecciones[row.idGrado] = {
        id: row.idGrado,
        denominacion: row.denominacionGrado,
        correlativo: row.correlativo,
        secciones: (gradosSecciones[row.idGrado] ? gradosSecciones[row.idGrado].secciones : null) || {}
      };
      gradosSecciones[row.idGrado].secciones[`${row.idSeccion}`] = {
        idSeccion: row.idSeccion,
        denominacion: row.denominacionSeccion
      } 
    })
    return Promise.all(promises).then(matrix => {
      matrix.forEach(row => {
        console.log("row", row);
        if(gradosSecciones[row[0].idGrado].secciones[`${row[0].idSeccion}`]) {
          gradosSecciones[row[0].idGrado].secciones[row[0].idSeccion].numAlumnos = row[0].numAlumnos
        }
      })
      Object.keys(gradosSecciones).forEach(key => {
        let secs = [];
        Object.keys(gradosSecciones[key].secciones).forEach(keySeccion => {
          secs.push(gradosSecciones[key].secciones[keySeccion]);
        })
        gradosSecciones[key].secciones = secs;
      })
      let gras = [];
      Object.keys(gradosSecciones).forEach(key => {
        gras.push(gradosSecciones[key]);
      })
      return gras;
    })
  });
};

exports.gradosSeccionesGet = (req, res) => {
  exports.getGradosSecciones().then(gradosSecciones => {
    res.json(gradosSecciones);
  });
};

exports.newSeccionPost = (req, res) => {
  let newSeccion = req.body;
  con.query('INSERT INTO seccion(denominacion, idGrado) VALUES(?, ?)', [newSeccion.denominacion, newSeccion.idGrado])
    .then(insertedRow => {
      con.query('SELECT * FROM seccion WHERE idSeccion = ?', [insertedRow.insertId]).then(newResult => {
        res.json(newResult);
      })
    });
};

exports.newGradoPost = (req, res) => {
  let newGrado = req.body;
  console.log(newGrado);
  getPeriodoEscolar().then(periodoEscolar => {
    console.log(periodoEscolar);
    con.query('INSERT INTO grado(denominacion, abreviacion, correlativo, idPeriodoEscolar) VALUES(?, ?, ?, ?)',
    [newGrado.denominacion, newGrado.abreviacion, newGrado.correlativo, periodoEscolar.idPeriodoEscolar])
    .then(insertedRow => {
      con.query('SELECT * FROM grado WHERE idGrado = ?', [insertedRow.insertId]).then(nGrado => {
        res.json(nGrado[0]);
      })
    })
  })
};

exports.deleteGradoPost = (req, res) => {
  con.query('SELECT COUNT(*) AS count FROM seccion WHERE idGrado = ?', [req.body.idGrado])
  .then(count => {
    console.log(count);
    if(count[0].count === 0) {
      con.query('DELETE FROM grado WHERE idGrado = ?', [req.body.idGrado]).then(result => {
        res.json({wasDeleted: true})
      })
    } else {
      res.json({wasDeleted: false})
    }
  })
}

exports.deleteSeccionPost = (req, res) => {
  con.query('SELECT COUNT(*) AS count FROM alumno WHERE idSeccion = ? AND estado = \'1\'', [req.body.idSeccion])
  .then(count => {
    if(count[0].count === 0){
      con.query('DELETE FROM seccion WHERE idSeccion = ?', [req.body.idSeccion]).then(result => {
        console.log();
        res.json({wasDeleted: true});
      })
    } else {
      res.json({wasDeleted: false});
    }
  })
}

exports.historialLogrosSeccionGet = (req, res) => {
  let { idSeccion, idArea } = req.params;
  console.log(reportes);
  reportes.getIdAreaSeccionDocente(idArea, idSeccion)
    .then((idAreaSeccionDocente) => {
      if (idAreaSeccionDocente) {
        reportes.metasPorSeccion(idAreaSeccionDocente)
          .then(metas => {
            reportes.notasPorSeccionCurso(idArea, idSeccion)
              .then((notas) => {
                res.json({
                  metas: metas,
                  notas: notas
                })
              })
          })
          .catch(err => {
            res.status(500).json({ status: 'Error en base de datos' })
            console.log("Error", err);
          })
      } else {
        res.status(400).json({ status: 'No tiene metas' })
      }

    })
}

exports.historialLogrosGradoGet = (req, res) => {
  let { idGrado, idArea } = req.params;
  console.log(reportes);
  con.query('SELECT * FROM seccion WHERE idGrado = ?', [idGrado])
    .then((secciones) => {
      let promises = [];
      for (let seccion of secciones) {
        let idSeccion = seccion.idSeccion;
        promises.push(new Promise((resolve, reject) => {
          reportes.getIdAreaSeccionDocente(idArea, idSeccion)
            .then((idAreaSeccionDocente) => {
              if (idAreaSeccionDocente) {
                reportes.metasPorSeccion(idAreaSeccionDocente)
                  .then(metas => {
                    reportes.notasPorSeccionCurso(idArea, idSeccion)
                      .then((notas) => {
                        resolve({
                          metas: metas,
                          notas: notas,
                          denominacion: seccion.denominacion
                        })
                      })
                  })
                  .catch(err => {
                    reject({ status: 'Error en base de datos' });
                    console.log("Error", err);
                  })
              } else {
                resolve({ status: 'No tiene metas' });
              }

            })
        }))
      }
      Promise.all(promises)
        .then((values) => {
          res.json(values);
        })
        .catch((err) => {
          res.status(500).json({ 'status': 'Ocurrió un error en la base de datos' });
        })
    })
}

exports.historialLogrosAreaGet = (req, res) => {
  let { idArea } = req.params;
  con.query('SELECT * FROM areaSeccionDocente WHERE idArea = ?', [idArea])
    .then((areasSeccionesDocentes) => {
      let promises = [];
      promises = [];
      console.log(areasSeccionesDocentes);
      for (let aSD of areasSeccionesDocentes) {
        let idSeccion = aSD.idSeccion;
        let idAreaSeccionDocente = aSD.idAreaSeccionDocente;
        promises.push(new Promise((resolve, reject) => {
          if (idAreaSeccionDocente) {
            console.log("Pidiendo reporte de:", idAreaSeccionDocente);
            let metasPromise = reportes.metasPorSeccion(idAreaSeccionDocente)
            let notasPromise = reportes.notasPorSeccionCurso(idArea, idSeccion)
            Promise.all([metasPromise, notasPromise])
              .then((resultado) => {
                console.log("Resuelto");
                resolve({
                  metas: resultado[0],
                  notas: resultado[1],
                  //denominacion: seccion.denominacion
                })
              })
              .catch(err => {
                reject({ status: 'Error en base de datos' });
                console.log("Error", err);
              })
          } else {
            resolve({ status: 'No tiene metas' });
          }
        }))
      }
      Promise.all(promises)
        .then((values) => {
          console.log("Finalizando :v");
          res.json(values);
        })
        .catch((err) => {
          res.status(500).json({ 'status': 'Ocurrió un error en la base de datos' });
        })
    })
}