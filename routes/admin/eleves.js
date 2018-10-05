const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const misc = require('./misc')

module.exports = {
  nettoyerBaseEleve: function(req, res) {
    let Eleve = require('../../models/eleve')(req.session.etab);
    let Structure = require('../../models/structure')(req.session.etab);
    Eleve.remove({
        'classe': null
      })
      .exec(function(err, results) {
        console.log(results);
        Structure.remove({
          'nom': null
        }).exec(function(err, results) {
          res.end();
        });
      });
  },


  /*
  **************************
  ajouter un eleve
  **************************
  */
  creerEleve: function(req, res, next) {
    let Eleve = require('../../models/eleve')(req.session.etab);
    let login = req.body.login;
    Eleve.findOne({
        'ine': req.body.ine
      })
      .exec(function(error, eleve) {
        let message = '';
        if (eleve !== null) {
          message = "l'élève est déjà présent dans la base"
          return res.send({
            'message': message,
          });
        } else {
          Eleve.find({
              'login': {
                $regex: login + '.*'
              }
            })
            .exec(function(error, eleve) {
              if (eleve.length > 0) {
                login = login + String(eleve.length);
              }
              let password = misc.generePassword();
              return res.send({
                'message': message,
                'password': password,
                'login': login
              });
            });
        }
      });
  },

  /*
  **************************
  Valider  un eleve
  **************************
  */
  validerEleve: function(req, res, next) {
    let Eleve = require('../../models/eleve')(req.session.etab);
    let eleve = new Eleve({
      'prenom': req.body.prenom,
      'nom': req.body.nom,
      'login': req.body.login,
      'password': req.body.password,
      'ine': req.body.ine,
      'classe': req.body.classe,
      'changePwd': false,
    });
    eleve.save(function(err) {
      if (err) console.log(error);
    });
    return res.end();
  },



  /*
  **************************
  generer un nouveau code
  **************************
  */

  genererNewCode: function(req, res, next) {
    let Eleve = require('../../models/eleve')(req.session.etab);
    let login=req.body.login;
    let password = misc.generePassword();
    Eleve.findOneAndUpdate({
        'login': login
      } , {$set :{ 'password' : password , 'changePwd' : false}})
      .exec(function(err) {
        if (err) console.log(err);
        return res.end();
      });
  },

}
