const connection = require('../db.js');
const bcrypt = require('bcryptjs');
const con = new connection();
exports.registrarDocentesPost = (req, res) => {
  let errors = [];
  let { nombres, apellidoPaterno, apellidoMaterno, DNI, password1, password2, email } = req.body;
  if (password1 != "" && (password1 != password2)) {
    errors.push('Las contraseñas no coinciden');
  }
  if (!nombres || !apellidoPaterno || !apellidoMaterno || !DNI || !password1 || !password2 || !email) {
    errors.push('No ha completado todos los campos');
  }
  if (errors.length > 0) {
    res.status(400).json({ 'status': 'Errores en los datos: ' + errors.join(", ") });
  } else {
    
    con.query('SELECT * FROM usuario WHERE email = ? OR DNI = ? ', [email, DNI])
      .then((rows) => {
        let user = rows[0];
        if (user) {
          res.status(400).json({ 'status': 'El correo o el DNI ya existen' });
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password1, salt, (err, hash) => {
              if (err) throw err;
              password1 = hash;
              con.query('INSERT INTO usuario (DNI, apellidoPaterno, apellidoMaterno, nombres, email, password, esAdmin) VALUES(?,?,?,?,?,?,?)',
                [DNI, apellidoPaterno, apellidoMaterno, nombres, email, password1, '0'])
                .then((rows) => {
                  res.json({'status': 'Docente creado'});
                })
            });
          });
        }
      })
      .catch((err)=>{
        res.status(500).json({'status':'Ocurrió un error en la base de datos'});
        console.log("Error:", err);
      })
  }
}