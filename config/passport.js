const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const connection = require('../controllers/db');
const con = new connection();
module.exports = function (passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match User
    console.log("Test passport");
    con.query('SELECT * from usuario where email = ? ', [email])
      .then((user) => {
        console.log('Logeando ', email);
        if (user.length == 0) {
          return done(null, false, { 'message': 'Usuario no encontrado' });
        } else {
          // Match password
          bcrypt.compare(password, user[0].password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user[0]);
            } else {
              return done(null, false, { 'message': 'Password incorrecta' });
            }
          })
        }
      });
  }));
  passport.serializeUser(function (user, done) {
    done(null, user.idUsuario);
  });

  passport.deserializeUser(function (idUsuario, done) {
    con.query('SELECT * FROM usuario where idUsuario = ?', [idUsuario])
      .then((user) => {
        user = user[0];
        done(null, user);
      });
  });
}