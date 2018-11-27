var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/admin/login')
});

module.exports = router;

const fs = require('fs')

function monitorar () {
  const arquivos = fs.readdirSync('./arquivos')
  console.log(`${arquivos.length} arquivos encontrados!`)

  for (let arquivo of arquivos) {
    console.log(arquivo)
  }
}

setInterval(monitorar, 5000)
