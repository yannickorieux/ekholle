const async = require('async');
const nodeMailer = require("nodemailer");
const config = require('../../secret');
const crypto = require('crypto');

transporter = nodeMailer.createTransport({
  host: config.host,
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.email, // generated ethereal user
    pass: config.emailPassword // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false
  }
});


module.exports = {

  /*
  **************************
  modifier le mot de passe une fois connecté
  **************************
  */
  modifyPassword : function(req, res, next) {
    let Login;
    if (req.session.role === 'professeur') {
      let Professeur = require('../../models/professeur')(req.session.etab);
      Login = Professeur;
    } else if (req.session.role === 'admin') {
      let Admin = require('../../models/admin')(req.session.etab);
      Login = Admin;
    } else if (req.session.role === 'eleve') {
      let Eleve = require('../../models/eleve')(req.session.etab);
      Login = Eleve;
    }
    Login.findById(req.session.userId)
      .exec(function(error, user) {
        user.password = req.body.password;
        user.changePwd = true; //l'utilisateur utilise maintenant un mdp crypté
        user.save(function(err, user) {
          Login.authenticate(Login, user.login, req.body.password, function(error, user) {
            if (!err) return res.end();
            else {
              console.log("une erreur s'est produite");
              res.redirect('/users');
            }
          });
        });
      });
  },

  /*
  **************************
  modifier le mot de passe en mode non connecté (oubli mot de passe)
  **************************
  */


  sendMail : function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {

        if (req.body.profil === 'professeur') {
          let Professeur = require('../../models/professeur')(req.session.etab);
          Login = Professeur;
        } else if (req.body.profil === 'admin') {
          let Admin = require('../../models/admin')(req.session.etab);
          Login = Admin;
        } else if (req.body.profil === 'eleve') {
          let Eleve = require('../../models/eleve')(req.session.etab);
          Login = Eleve;
        }
        Login.findOne({
          login: req.body.login
        }, function(err, user) {
          if (!user) {
            res.locals.messages = req.flash('msg', "Ce login n'est pas présent dans la base de l'application.");
            return res.redirect('/users/forgot');
          }
          if (user.changePwd === false) {
            res.locals.messages = req.flash('msg', "Ce login est  présent dans la base mais votre compte n'a pas été activé avec le code fourni.");
            return res.redirect('/users');
          }
          user.email = req.body.logemail
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          req.session.role = req.body.profil //on enregistre dans la session le role pour ensuite une fois connectée aprçs ch passwd afficher correct. le profil
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.email,
          subject: 'changer le mot de passe de votre compte e-kholle',
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
  },




  // =====================================
  // Mot de passe  reset
  // =====================================

  // =====================================
  // Au chargement de l'url on recupere l'etab, le token et le profil pour activer le form reset
  // ===

  testToken : function(req, res, next) {
    req.session.etab = req.query.etab;
    req.session.role = req.query.profil;
    let profil = req.query.profil;
    if (profil === 'professeur') {
      let Professeur = require('../../models/professeur')(req.session.etab);
      Login = Professeur;
    } else if (profil === 'admin') {
      let Admin = require('../../models/admin')(req.session.etab);
      Login = Admin;
    }
    else if (req.body.profil === 'eleve') {
      let Eleve = require('../../models/eleve')(req.session.etab);
      Login = Eleve;
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
        lycee: req.session.lycee,
        form: 'reset'
      });
    });
  },




  // =====================================
  // validation du  form reset
  // ===
  savePassword : function(req, res) {
    async.waterfall([
      function(done) {
        if (req.body.password !== req.body.passwordConf) {
          res.locals.messages = req.flash('msg', 'les mots de passe ne correspondent pas');
          return res.redirect('back');
        }
        let profil = req.session.role;
        if (profil === 'professeur') {
          let Professeur = require('../../models/professeur')(req.session.etab);
          Login = Professeur;
        } else if (profil === 'admin') {
          let Admin = require('../../models/admin')(req.session.etab);
          Login = Admin;
        } else if (req.session.role === 'eleve') {
          let Eleve = require('../../models/eleve')(req.session.etab);
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
              if (typeof user.classe !== 'undefined') req.session.classe = user.classe; //pour l'eleve on recupere sa classe
              done(err, user);
            });
          });
        });
      },
      function(user, done) {
        var mailOptions = {
          to: user.email,
          from: config.email,
          subject: 'Votre mot de passe a été modifié',
          text: 'Bonjour,\n\n' +
            'Ce message confirme que le mot de passe de votre compte a été modifié.\n'
        };
        transporter.sendMail(mailOptions, function(err, info) {
          req.flash('msg', 'Succès! Votre mot de passe a été modifié.');
          done(err, 'done');
        });
      }
    ], function(err) {
      transporter.close();
      res.end();
    });
  },

}
