const connection = require('./db');
const getAreas = require('./api/areas').getAreas;
const homeUtils = require('./api/homeUtils');
const passport = require('passport');
const getGradosSecciones = require('./api/gradosSecciones').getGradosSecciones;
const con = new connection();

function getPeriodo() {
  return con.query('SELECT año FROM periodoEscolar WHERE estado = \'1\'').then(rows => {
    return rows;
  });
}

exports.loginAdminGet = (req, res) => {
  res.render('login', {
    cssFile: "adminLogin",
    tipoLogin: "Admin"
  });
};

exports.loginAdminPost = (req, res, next) => {
  console.log("Body login:", req.body);
  passport.authenticate('local', {
    successRedirect: '/admin/index',
    failureRedirect: '/admin/login',
    failureFlash: true
  })(req, res, next)
};

exports.resumenAdminGet = (req, res) => {
  Promise.all([
    homeUtils.getResumenDocentes(),
    homeUtils.getResumenEstudiantes(),
    homeUtils.getResumenAdministradores(),
    homeUtils.getResumenGrados(),
    homeUtils.getResumenSecciones(),
    homeUtils.getResumenAreas()
  ]).then(matrix => {
    console.log(matrix[0][0]);
    res.render('admin/index', {title: 'Inicio',
      resumenDocentes: matrix[0][0].resumen,
      resumenEstudiantes: matrix[1][0].resumen,
      resumenAdministradores: matrix[2][0].resumen,
      resumenGrados: matrix[3][0].resumen,
      resumenSecciones: matrix[4][0].resumen,
      resumenAreas: matrix[5][0].resumen
    });
  })
};

exports.periodosAdminGet = (req, res) => {
  res.render('admin/periodos');
};
exports.areasAdminGet = (req, res) => {
  Promise.all([getAreas(), getPeriodo()]).then(matrix => {
    [areas, periodo] = matrix;
    res.render('admin/areas', { areas, periodo: periodo[0]['año'], title: 'Areas' });
  })
};
exports.gradosSeccionesAdminGet = (req, res) => {
  Promise.all([getGradosSecciones(), getPeriodo()]).then(matrix => {
    [grados, periodo] = matrix;
    res.render('admin/gradosSecciones', { periodo: periodo[0]['año'], grados, title: 'Grados y Secciones' });
  });
};
exports.docentesAdminGet = (req, res) => {
  con.query('SELECT * FROM periodoEscolar WHERE estado = \'1\'')
    .then((periodo) => {
      if (periodo.length) {
        periodo = periodo[0];
        res.render('admin/docentes', {
          title: 'Docentes',
          periodo: periodo.año,
        });
      } else {
        res.render('admin/docentes', {
          title: 'Docentes',
          periodo: "No hay periodo activo",
        });
      }
    })
};

exports.administradoresGet = (req, res)=>{
  res.render('admin/administradores');
}

exports.estudiantesAdminGet = (req, res) => {
  con.query('SELECT * FROM periodoEscolar WHERE estado = \'1\' LIMIT 1')
    .then(periodo=>{
      if(periodo.length){
        periodo = periodo[0];
        con.query('SELECT g.*,s.idSeccion, s.denominacion FROM grado g JOIN seccion s ON g.idGrado = s.idGrado WHERE idPeriodoEscolar = ?', [periodo.idPeriodoEscolar])
          .then((areas)=>{
            res.render('admin/estudiantes', { 
              title: 'Estudiantes',
              areas: areas,
            });
          })
        
      }else{
        res.render('admin/estudiantes', { title: 'Estudiantes' });
      }
      
    })
  
};

exports.estudiantesSeccionGet =  (req, res) => {
  ({idSeccion} = req.params);
  con.query('SELECT idAlumno, dni, CONCAT(apellidoPaterno, " ", apellidoMaterno) AS apellidos, nombres FROM alumno WHERE idSeccion = ?', [idSeccion]).then(estudiantes => {
    res.render('admin/estudiantes', {estudiantes, title:'Estudiantes'})
  });
}

exports.administradoresAdminGet = (req, res) => {
  res.render('admin/administradores', { title: 'Administradores' });
};
exports.notasAdminGet = (req, res) => {
  Promise.all([getGradosSecciones(), getPeriodo(), getAreas()]).then(matrix => {
    [grados, periodo, areas] = matrix;
    res.render('admin/notas', {title: 'Notas', grados, areas, periodo: periodo[0]['año']})
  })
};
exports.planMejoraAdminGet = (req, res) => {
  Promise.all([getPeriodo(), getAreas(), getGradosSecciones()]).then(matrix => {
    [periodo, areas, grados] = matrix;
    res.render('admin/planMejora', {periodo: periodo[0]['año'], areas: areas, title: 'Plan de mejora', grados: grados});
  })
};
exports.metasGet = (req, res) => {
  Promise.all([getPeriodo(), getAreas(), getGradosSecciones()]).then(matrix => {
    [periodo, areas, grados] = matrix;
    res.render('admin/metas', {periodo: periodo[0]['año'], areas: areas, title: 'Metas', grados: grados});
  })
}