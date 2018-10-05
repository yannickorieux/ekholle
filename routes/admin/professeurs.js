const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const misc = require('./misc')

module.exports={
  /*
  ***********************************
table professeur
  ***********************************
  */
  tableProfesseursJSON:  function(req, res) {
    let Professeur = require('../../models/professeur')(req.session.etab);
    Professeur.aggregate([{
        $project: {
          nom: 1,
          prenom: 1,
          grade: 1,
          login: 1,
          password: 1,
          changePwd: 1,
          email: 1,
          colles: []
        }
      }, ])
      .exec(function(err, data) {
        let listeProfesseurs = data;
        if (err) return console.error(err);
        let Structure = require('../../models/structure')(req.session.etab);
        let matieres = req.session.etab + '_matieres'
        Structure.aggregate([{
              $unwind: "$matieres"
            },
            {
              $unwind: "$matieres.colleurs"
            },
            {
              $lookup: {
                from: matieres,
                localField: "matieres.matiere",
                foreignField: "_id",
                as: "matiere"
              }
            },
            {
              $unwind: "$matiere"
            },
            {
              $project: {
                classe: "$nom",
                matiere: "$matiere.nom",
                colleur: "$matieres.colleurs._id",
              }
            },
          ])
          .exec(function(err, data) {
            if (err) return console.error(err);
            listeProfesseurs.forEach(function(elem) {
              let obj = data.filter(e => e.colleur == String(elem._id));
              if (typeof obj != 'undefined') {
                obj.forEach(function(o) {
                  elem.colles.push({
                    'classe': o.classe,
                    'matiere': o.matiere,
                  });
                });
              }
            });
            res.json(listeProfesseurs);
          });
      });
  },

  /*
  ***********************************
  creer professeur
  ***********************************
  */

  creerProfesseur : function(req, res, next) {
    let Professeur = require('../../models/professeur')(req.session.etab);
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
        let password = misc.generePassword();
        return res.send({
          'message': message,
          'password': password,
          'login': login
        });
      });
  },





  validerProfesseur : function(req, res, next) {
    let Professeur = require('../../models/professeur')(req.session.etab);
    let professeur = new Professeur({
      'prenom': req.body.prenom,
      'nom': req.body.nom,
      'login': req.body.login,
      'password': req.body.password,
      'grade': req.body.grade,
      'changePwd': false,
    });
    professeur.save(function(err) {
      if (err) console.log(err);
    });
    return res.end();
  },



  modifierProfesseur : function(req, res, next) {
    let Professeur = require('../../models/professeur')(req.session.etab);
    Professeur.findOneAndUpdate({'_id' : req.body.idProfesseur}, {$set :{ 'grade' : req.body.grade , 'email' : req.body.email}})
    .exec(function(err) {
      if (err) console.log(err);
      return res.end();
    });

  },



  /*
  **************************
  generer un nouveau code
  **************************
  */

  genererNewCode: function(req, res, next) {
    let Professeur = require('../../models/professeur')(req.session.etab);
    let login=req.body.login;
    let password = misc.generePassword();
    Professeur.findOneAndUpdate({
        'login': login
      } , {$set :{ 'password' : password , 'changePwd' : false}})
      .exec(function(err) {
        if (err) console.log(err);
        return res.end();
      });
  },



}
