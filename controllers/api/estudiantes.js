const connection = require('../db.js');
const con = new connection();
exports.alumnosGradoSeccionGet = (req, res) => {

  let idSeccion = req.params.idSeccion;
  con.query('SELECT idAlumno, dni,apellidoPaterno, apellidoMaterno, CONCAT(apellidoPaterno, \' \', apellidoMaterno) apellidos, nombres ' +
    'FROM alumno WHERE idSeccion = ? AND estado = \'1\' ORDER BY apellidos', [idSeccion])
    .then((alumnos) => {
      res.json(alumnos);
    })
}

exports.registrarAlumnoSeccionPost = (req, res) => {
  let idSeccion = req.params.idSeccion;
  let dni = req.body.dni;
  let apellidoPaterno = req.body.apellidoPaterno;
  let apellidoMaterno = req.body.apellidoMaterno;
  let nombres = req.body.nombres;
  con.query('INSERT INTO alumno (dni, apellidoPaterno, apellidoMaterno, nombres, idSeccion, estado) ' +
    'VALUES(?,?,?,?,?, \'1\')', [dni, apellidoPaterno, apellidoMaterno, nombres, idSeccion])
    .then((insertedRow) => {
      res.json({
        'status': 'Alumno creado', 'alumno': {
          dni: dni,
          apellidos: apellidoPaterno + ' ' + apellidoMaterno,
          nombres: nombres,
          idAlumno: insertedRow.insertId
        }
      })
    })
    .catch((err) => {

      console.log(err);
    })
}

exports.actualizarAlumnoPost = (req, res) => {
  let idAlumno = req.params.idAlumno;
  let {dni, apellidoMaterno, apellidoPaterno, nombres} = req.body;
  con.query('UPDATE alumno SET dni = ?, apellidoPaterno = ?, apellidoMaterno = ?, nombres = ? WHERE idAlumno = ? ',
  [dni,apellidoPaterno, apellidoMaterno, nombres, idAlumno])
    .then((updatedRow)=>{
      res.json(updatedRow);
    })
    .catch((err)=>{
      res.status(500).json({'status':'Error en la base de datos'});
    })
}

exports.toggleEstadoAlumno = (req, res)=>{
  let nuevoEstado = req.params.nuevoEstado;
  let idAlumno = req.params.idAlumno;
  if(nuevoEstado != "1"){
    nuevoEstado = "0";
  }
  con.query('UPDATE alumno SET estado = ? WHERE idAlumno = ?', [nuevoEstado, idAlumno])
    .then((updatedRow)=>{
      res.json(updatedRow);
    })
    .catch((err)=>{
      res.status(500).json({'status':'Error en la base de datos'});
      console.log("Error:", err);
    })
}

exports.notasAlumnoAreaGet = (req, res)=>{
  let {idAlumno,idArea} = req.params;
  con.query('SELECT * FROM notasAlumnoArea WHERE idAlumno = ? AND idArea = ?', [idAlumno, idArea])
    .then((notas)=>{
      if(notas.length){
        notas = notas[0];
        res.json([
          {bimestre: "B1",nota:notas.primerBimestre || 0 },
          {bimestre: "B2",nota:notas.segundoBimestre || 0 },
          {bimestre: "B3",nota:notas.tercerBimestre || 0 },
          {bimestre: "B4",nota:notas.cuartoBimestre || 0},
        ])  
      }else{
        res.json([
          {bimestre: "B1",nota:0 },
          {bimestre: "B2",nota:0 },
          {bimestre: "B3",nota:0 },
          {bimestre: "B4",nota:0},
        ])  
      }
    })
    .catch((err)=>{
      res.status(500).json({"status":"Ocurrió un error en la base de datos"});
    })
  
}