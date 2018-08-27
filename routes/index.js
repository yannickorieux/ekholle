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
    else if (req.session.role === 'eleve') {
      res.redirect('/eleve')
    }
    else if(typeof req.session.etab !== 'undefined'){
      res.redirect('/users')
    }
    else {
      console.log('testindex');
      res.render('index', {
        title: 'e-khôlle',
        role:'' ,
        lycee: '',
      });
    }

});

router.get('/home', function(req, res, next) {
      let role='';
      let lycee='';
      if(typeof req.session.role !== 'undefined') role=req.session.role;
      if(typeof req.session.lycee !== 'undefined') role=req.session.lycee;
      res.render('index', {
        title: 'e-khôlle',
        role: role ,
        lycee: lycee,
      });

});


router.post('/choixEtab', function(req, res, next) {
      if(typeof req.session.userId !== 'undefined'){res.redirect('/')}
      else{
        req.session.etab=req.body.etablissement;
        req.session.lycee=req.body.etablissement;
        res.redirect('/')
      }


});


module.exports = router;
