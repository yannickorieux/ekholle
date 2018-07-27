const express = require('express');
const router = express.Router();
const login = require('./login');
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




router.post('/login', function(req, res, next) {
  let Login;
  if (req.body.login && req.body.logpassword) {
    if (req.body.statut === 'professeur') {
      let Professeur = require('../models/professeur')(req.etab);
      Login = Professeur;
    } else if (req.body.statut === 'admin') {
      let Admin = require('../models/admin')(req.etab);
      Login = Admin;
    }
    Login.authenticate(Login, req.body.login, req.body.logpassword, function(error, user) {
      if (error || !user) {
        res.locals.messages = req.flash('msg', 'login ou mot de passe incorrect');
        res.redirect('/users');
      } else {
        req.session.userId = user._id;
        req.session.role = req.body.statut;
        if (req.body.statut === 'professeur') {
          return res.redirect('/professeur');
        } else if (req.body.statut === 'admin') {
          return res.redirect('/admin');
        } else {
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


/*
**************************
modifier le mot de passe
**************************
*/
router.post('/modifyPassword', login.isLoggedIn, function(req, res, next) {
  console.log(req.body);
  let Login;
  if (req.session.role === 'professeur') {
    let Professeur = require('../models/professeur')(req.etab);
    Login = Professeur;
  } else if (req.session.role === 'admin') {
    let Admin = require('../models/admin')(req.etab);
    Login = Admin;
  }
  Login.findById(req.session.userId)
    .exec(function(error, user) {
      user.password = req.body.password;
      user.changePwd = true; //l'utilisateur utilise maintenant un mdp crypté
      user.save(function(err, user) {
        Login.authenticate(Login, user.login, req.body.password, function(error, user) {
          return res.send(err);
        });
      });
    });
});




/*
**************************
 création pwd
**************************
*/
function generePassword() {
  let c = 'abcdefghijknopqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ12345679';
  let r = ''
  for (i = 0; i < 8; i++) {
    r += c.charAt(Math.floor(Math.random() * c.length));
  }
  return r
}
/*
**************************
ajouter un professeur
**************************
*/
router.post('/creerProfesseur', login.isLoggedIn, function(req, res, next) {
  let Professeur = require('../models/professeur')(req.etab);
  let login = req.body.login;
  Professeur.find({
      'login': {
        $regex: login + '.*'
      }
    })
    .exec(function(error, professeur) {
      let message = '';
      if (professeur.length > 0) {
        login = login + String(professeur.length)
        message = "Un professeur avec un prénom et nom quasi identique est présent dans la base, vérifiez dans la liste professeur que ce n'est pas un doublon "
      }
      let password = generePassword();
      return res.send({
        'message': message,
        'password': password,
        'login': login
      });
    });
});


router.post('/validerProfesseur', login.isLoggedIn, function(req, res, next) {
  let Professeur = require('../models/professeur')(req.etab);
  let professeur = new Professeur({
    'prenom': req.body.prenom,
    'nom': req.body.nom,
    'login': req.body.login,
    'password': req.body.password,
    'grade': req.body.grade,
    'changePwd': false,
  });
  professeur.save(function(err) {
    if (err) return handleError(err);
  });
  return res.send();
});

module.exports = router;
