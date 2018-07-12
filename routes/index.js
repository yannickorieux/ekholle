const express = require('express');
const router = express.Router();
const User = require('../models/user');
const login= require('./login');



/* GET home page. */
router.get('/', login.isLoggedIn , function(req, res, next) {
  res.render('index', {
    title: 'e-khôlle',
    user: req.prenom+'-'+req.nom,
    role: req.session.role,
  });
});

module.exports = router;
