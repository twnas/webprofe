module.exports = {
  ensureAuthenticated: function (req, res, next) {
    console.log(req.user);
    if (req.isAuthenticated()) {
      return next();
    } else {
      console.log("nel");
      req.flash('error_msg', 'No estás autorizado');
      res.redirect('/docente/login');
    }
  },
  ensureAdminAuthenticated: function (req, res, next) {
    console.log("User:", req.user);
    if (req.isAuthenticated() && req.user.esAdmin == '1') {
      return next();
    } else {
      req.flash('error_msg', 'No estás autorizado');
      res.redirect('/admin/login');
    }
  },
}