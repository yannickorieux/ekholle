const express = require('express');
const router = express.Router();
const login = require('./login');
const async = require('async');
const nodeMailer = require("nodemailer");
const crypto = require('crypto');
const queryString = require('query-string');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users.ejs', {
    title: 'e-khôlle',
    role: req.session.role,
  });
});

/*
**************************
connexion
**************************
*/

router.post('/login', function(req, res, next) {
  let Login;
  if (req.body.login && req.body.logpassword) {
    if (req.body.profil === 'professeur') {
      let Professeur = require('../models/professeur')(req.session.etab);
      Login = Professeur;
    } else if (req.body.profil === 'admin') {
      let Admin = require('../models/admin')(req.session.etab);
      Login = Admin;
    } else if (req.body.profil === 'eleve') {
      let Eleve = require('../models/eleve')(req.session.etab);
      Login = Eleve;
    }
    Login.authenticate(Login, req.body.login, req.body.logpassword, function(error, user) {
      if (error || !user) {
        res.locals.messages = req.flash('msg', 'login ou mot de passe incorrect');
        res.redirect('/users');
      } else {
        req.session.userId = user._id;
        req.session.role = req.body.profil;
        if (req.body.profil === 'professeur') {
          return res.redirect('/professeur');
        } else if (req.body.profil === 'admin') {
          return res.redirect('/admin');
        } else if (req.body.profil === 'eleve') {
          req.session.classe = user.classe;
          return res.redirect('/eleve');
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


/*
**************************
déconnexion
**************************
*/
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    let etab = req.session.etab;
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        // on peut de nouveau creer une session
        return res.redirect('/' + etab);
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
  let Login;
  if (req.session.role === 'professeur') {
    let Professeur = require('../models/professeur')(req.session.etab);
    Login = Professeur;
  } else if (req.session.role === 'admin') {
    let Admin = require('../models/admin')(req.session.etab);
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


// =====================================
// Contact support ========
// =====================================

transporter = nodeMailer.createTransport({
  host: 'auth.smtp.1and1.fr',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'administrateur@e-kholle.fr', // generated ethereal user
    pass: 's20y14n01o29' // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false
  }
});



router.post('/contactSupport', function(req, res, next) {
  let mailOptions = {
    from: req.body.sender,
    to: 'administrateur@e-kholle.fr',
    subject: req.body.subject,
    text: req.body.message,
    html: '<b>' + req.body.message + '</b>',
  };
  transporter.sendMail(mailOptions, function(error, info) {
    console.log(error, info);
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  transporter.close();
  return res.redirect('back');
});





// =====================================
// Mot de passe oublié
// =====================================
router.get('/forgot', function(req, res) {
  res.render('forgot.ejs', {
    role: req.session.role,
    title: 'e-khôlle',
    form: 'forgot'
  });
});


router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {

      if (req.body.profil === 'professeur') {
        let Professeur = require('../models/professeur')(req.session.etab);
        Login = Professeur;
      } else if (req.body.profil === 'admin') {
        let Admin = require('../models/admin')(req.session.etab);
        Login = Admin;
      }
      Login.findOne({
        login: req.body.login
      }, function(err, user) {
        if (!user) {
          res.locals.messages = req.flash('msg', "Ce login n'est pas présent dans la base de l'application.");
          return res.redirect('/users/forgot');
        }
        user.email = req.body.logemail
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      console.log(user.email);
      console.log(req.body.profil);
      console.log(req.headers.host);
        console.log(token);
      var mailOptions = {
        to: user.email,
        from: 'administrateur@e-kholle.fr',
        subject: 'changer le mot de passe de votre comptr e-kholle',
        text: 'Vous avez reçu ce message car (vous ou un tiers) a fait une demande de modification du mot de passe de votre comte.\n\n' +
          'Coller le lien dans le navigateur  pour terminer le processus de modification :\n\n' +
          'http://' + req.headers.host + '/users/reset/?etab=' + req.session.etab + '&profil=' + req.body.profil + '&token=' + token + '\n\n' +
          'Si vous ne souhaitez pas poursuivre, ignorer le message et votre mot de passe sera conservé.\n'
      };
      transporter.sendMail(mailOptions, function(err, info) {
        res.locals.messages = req.flash('msg', "Un email vous a été envoyé à l'adresse " + user.email + ' avec les instructions à suivre.');
        console.log('Message sent: ' + info);
        done(err, 'done');
      });
    }
  ], function(err) {
    console.log(err);
    if (err) return next(err);
    transporter.close();
    res.redirect('/users/forgot');
  });
});




// =====================================
// Mot de passe  reset
// =====================================

// =====================================
// Au chargement de l'url on recupere l'etab, le token et le profil pour activer le form reset
// ===

router.get('/reset/', function(req, res, next) {
  req.session.etab = req.query.etab;
  req.session.role = req.query.profil;
  let profil = req.query.profil;
  if (profil === 'professeur') {
    let Professeur = require('../models/professeur')(req.session.etab);
    Login = Professeur;
  } else if (profil === 'admin') {
    let Admin = require('../models/admin')(req.session.etab);
    Login = Admin;
  }
  Login.findOne({
    resetPasswordToken: req.query.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (!user) {
      res.locals.messages = req.flash('msg', 'Le délai pour modifier votre mot de passe a expiré.');
      return res.redirect('/users/forgot');
    }
    res.render('forgot.ejs', {
      title: 'e-khôlle',
      role: req.session.role,
      //user: req.username,
      form: 'reset'
    });
  });
});

// =====================================
// validation du  form reset
// ===
router.post('/reset/', function(req, res) {
  async.waterfall([
    function(done) {
      if (req.body.password !== req.body.passwordConf) {
        res.locals.messages = req.flash('msg', 'les mots de passe ne correspondent pas');
        return res.redirect('back');
      }
      let profil = req.session.role;
      if (profil === 'professeur') {
        let Professeur = require('../models/professeur')(req.session.etab);
        Login = Professeur;
      } else if (profil === 'admin') {
        let Admin = require('../models/admin')(req.session.etab);
        Login = Admin;
      } else if (req.session.role === 'eleve') {
        let Eleve = require('../models/eleve')(req.session.etab);
        Login = Eleve;
      }
      Login.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!user) {
          req.flash('msg', 'Le délai pour modifier votre mot de passe a expiré');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err, user) {
          Login.authenticate(Login, user.login, req.body.password, function(err, user) {
            req.session.userId = user._id;
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: 'administrateur@e-kholle.fr',
        subject: 'Votre mot de passe a été modifié',
        text: 'Bonjour,\n\n' +
          'Ce message confirme que le mot de passe de votre compte a été modifié.\n'
      };
      transporter.sendMail(mailOptions, function(err, info) {
        req.flash('msg', 'Succès! Votre mot de passe a été modifié.');
        console.log('Message sent: ' + info.response);
        done(err, 'done');
      });
    }
  ], function(err) {
    transporter.close();
    res.end();
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
  let Professeur = require('../models/professeur')(req.session.etab);
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
  let Professeur = require('../models/professeur')(req.session.etab);
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
