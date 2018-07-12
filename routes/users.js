const express = require('express');
const router = express.Router();
// const User = require('../models/user');
// const Professeur = require('../models/professeur');
// const Admin = require('../models/admin');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users.ejs', {
    title: 'e-khôlle',
    role: req.session.role,
  });
});




router.post('/login',function(req, res, next) {
  let Login;
  if (req.body.login && req.body.logpassword) {
    if (req.body.statut==='professeur'){
      let Professeur = require('../models/professeur')(req.etab);
      Login=Professeur;
        }
    else if (req.body.statut==='admin') {
      let Admin = require('../models/admin')(req.etab);
      Login=Admin;
    }
      Login.authenticate(Login,req.body.login, req.body.logpassword, function(error, user) {
        if (error || !user) {
          res.locals.messages = req.flash('msg', 'login ou mot de passe incorrect');
          res.redirect('/users');
        } else {
          req.session.userId = user._id;
          req.session.role=req.body.statut;
          if(req.body.statut==='professeur'){
            return res.redirect('/professeur');
          }
          else if(req.body.statut==='admin'){
            return res.redirect('/admin');
          }
          else{
          return res.redirect('/');
          }
        }
      });


  } else {
    let err = new Error('All fields required.');
    res.locals.messages = req.flash('msg', 'Tous les champs sont requis');
    return next(err);
  }
});

// router.post('/login',function(req, res, next) {
//   // confirm that user typed same password twice
//   if (req.body.password !== req.body.passwordConf) {
//     res.locals.messages = req.flash('msg', 'les mots de passe ne correspondent pas');
//     return res.redirect('/login');
//   }
//
//   if (req.body.email &&
//     req.body.nom &&
//     req.body.prenom &&
//     req.body.password &&
//     req.body.passwordConf) {
//
//     let userData = {
//       email: req.body.email,
//       nom: req.body.nom,
//       prenom: req.body.prenom,
//       password: req.body.password,
//       passwordConf: req.body.passwordConf,
//     }
//     User.create(userData, function(error, user) {
//       if (error) {
//         console.log(error);
//         res.locals.messages = req.flash('msg', 'Le compte existe déjà');
//         return res.redirect('/');
//       } else {
//         req.session.userId = user._id;
//         console.log(req.session.userId)
//         return res.redirect('/');
//       }
//     });
//
//   } else if (req.body.logemail && req.body.logpassword) {
//     User.authenticate(req.body.logemail, req.body.logpassword, function(error, user) {
//       if (error || !user) {
//         res.locals.messages = req.flash('msg', 'email ou mot de passe incorrect');
//         res.redirect('/users');
//       } else {
//         req.session.userId = user._id;
//         return res.redirect('/');
//       }
//     });
//   } else {
//     let err = new Error('All fields required.');
//     res.locals.messages = req.flash('msg', 'Tous les champs sont requis');
//     return next(err);
//   }
// });

router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/users');
      }
    });
  }
});



module.exports = router;
