const express = require('express');
const router = express.Router();
const User = require('../models/user');
const login = require('./login');



/* GET home page. */

router.get('/', function(req, res, next) {
  if (req.session.role === 'professeur') {
    res.redirect('/professeur')
  } else if (req.session.role === 'admin') {
    res.redirect('/admin')
  } else if (req.session.role === 'eleve') {
    res.redirect('/eleve')
  } else if (typeof req.session.etab !== 'undefined') {
    res.redirect('/users')
  } else {
    res.render('index', {
      title: 'e-khôlle',
      role: '',
      lycee: '',
    });
  }

});

router.get('/home', function(req, res, next) {
  let role = '';
  let lycee = '';
  if (typeof req.session.role !== 'undefined') role = req.session.role;
  if (typeof req.session.lycee !== 'undefined') role = req.session.lycee;
  res.render('index', {
    title: 'e-khôlle',
    role: role,
    lycee: lycee,
  });

});


router.post('/choixEtab', function(req, res, next) {
  req.session.etab = req.body.prefix;
  req.session.lycee = req.body.etablissement;
  res.end('')
});


router.get('/listeEtablissementsJSON', function(req, res, next) {
  let Etablissement = require('../models/etablissement');
  Etablissement.find({}, function(err, result) {
    if (err) throw err;
    res.send(result)
  });
});



module.exports = router;
