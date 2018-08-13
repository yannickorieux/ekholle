const express = require('express');
const router = express.Router();
const User = require('../models/user');
const login= require('./login');



/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.role === 'professeur') {
      res.redirect('/professeur')
    }
    else if (req.session.role === 'admin') {
      res.redirect('/admin')
    }
    else {
      res.redirect('/users')
    }
  // res.render('index', {
  //   title: 'e-khôlle',
  //   user: req.prenom+'-'+req.nom,
  //   role: req.session.role,
  // });
});

module.exports = router;
