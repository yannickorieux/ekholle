
module.exports = {
  // route middleware  pour verifier que chaque utilisateur est connecté
  isLoggedIn: function isLoggedIn(req, res, next) {
    let Login;
    if (req.session.role === 'professeur') {
      let Professeur = require('../models/professeur')(req.session.etab);
      Login = Professeur;
    } else if (req.session.role === 'admin') {
      let Admin = require('../models/admin')(req.session.etab);
      Login = Admin;
    } else if (req.session.role === 'eleve') {
      let Eleve = require('../models/eleve')(req.session.etab);
      Login = Eleve;
    }
    else {
      return res.redirect('/users');
    }
    Login.findById(req.session.userId)
      .exec(function(error, user) {
        if (error) {
          res.locals.messages = req.flash('msg', "Erreur");
          return res.redirect('/login');
        } else {
          if (user === null) {
            res.locals.messages = req.flash('msg', "Vous n'êtes pas connecté, veuillez vous identifier");
            return res.redirect('/login');
          } else {
            req.nom = user.nom;
            req.prenom = user.prenom;
            req._id = user._id;
            return next();
          }
        }
      });
  }

}
