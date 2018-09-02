const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment')

/*
**************************
       ajout d'une  matiere sur une classe
 **************************
 */
function ajoutClasseMatiere(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
  Structure.find({
      $and: [{
          '_id': req.body.idClasse
        }, {
          'matieres.matiere': req.body.idMatiere
        },
        {
          'matieres.professeur': req.body.idProfesseur
        }
      ]
    })
    .exec(function(err, exist) {
      if (err) return console.error(err);
      if (typeof exist === 'undefined' || exist.length === 0) {
        Structure.findOneAndUpdate({
          '_id': req.body.idClasse
        }, {
          $push: {
            'matieres': {
              matiere: req.body.idMatiere,
              professeur: req.body.idProfesseur,
              duree: req.body.duree,
              dureeExc: req.body.duree, //la duree exceptionelle est mise par defaut à la duree de l'annee
            }
          }
        }).exec(function(err, structure) {
          if (err) return console.error(err);
          res.send({
            "error": "ok"
          });
        });
      } else {
        res.send({
          "error": "Cette association professeur/Matière est déjà créée"
        });
      }
    });
}


function modifClasseMatiere(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);

  Structure.update({
      'matieres._id': req.body.idClasseMatiere
    }, {
      $set: {
        'matieres.$[el1].duree': req.body.duree,
        'matieres.$[el1].dureeExc': req.body.dureeExc,
      }
    }, {
      arrayFilters: [{
        'el1._id': ObjectId(req.body.idClasseMatiere)
      }, ]
    })
    .exec(function(err, result) {
      if (err) return console.error(err);
    });
  res.send({
    "error": "ok"
  });
}


module.exports = {

  /*
  **************************
      GESTION CLASSES
   **************************
   */


  /*
  **************************
        Script pour modifier le niveau des classes
   **************************
   */


  niveau: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    Structure.findOneAndUpdate({
        '_id': ObjectId(req.body.idClasse)
      }, {
        $set: {
          'niveau': parseInt(req.body.niveau)
        }
      })
      .exec(function(err, structure) {
        if (err) return console.error(err);
        res.end();
      });

  },

  /*
  **************************
        Script pour afficher la sructure des classes
   **************************
   */
  tableStructureJSON: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    Structure.aggregate([{
      $project: {
        idClasse: "$_id",
        nom: 1,
        niveau: 1,
        totalEleves: 1,
        taux: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{
                    $gt: ["$totalEleves", 35]
                  }, {
                    $eq: ["$niveau", 1]
                  }]
                },
                then: 'HI 1ère année plus de 35',
              },
              {
                case: {
                  $and: [{
                      $gte: ["$totalEleves", 20]
                    },
                    {
                      $lte: ["$totalEleves", 35]
                    }, {
                      $eq: ["$niveau", 2]
                    }
                  ]
                },
                then: 'HI 2ième année 20 à 35',
              },
              {
                case: {
                  $and: [{
                      $gte: ["$totalEleves", 20]
                    },
                    {
                      $lte: ["$totalEleves", 35]
                    }, {
                      $eq: ["$niveau", 1]
                    }
                  ]
                },
                then: 'HI 1ère année 20 à 35',
              },
              {
                case: {
                  $and: [{
                    $lt: ["$totalEleves", 20]
                  }, {
                    $eq: ["$niveau", 2]
                  }]
                },
                then: 'HI 2ième année moins de 20',
              },
              {
                case: {
                  $and: [{
                    $lt: ["$totalEleves", 20]
                  }, {
                    $eq: ["$niveau", 1]
                  }]
                },
                then: 'HI 1ère moins de 20',
              },
              {
                case: {
                $and: [{
                  $gt: ["$totalEleves", 35]
                }, {
                  $eq: ["$niveau", 2]
                }]
              },
              then: 'HI 2ième année plus de 35',
            }, ],
            default: "Niveau non renseigné"
          }
        }
      }
    }]).exec(function(err, data) {
      if (err) return console.error(err);
      res.json(data);
    });
  },






  /*
  **************************
         table des classes
   **************************
   */
  tableClassesJSON: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab)
    Structure.find({}, {
      nom: 1,
      niveau: 1
    }, function(err, structure) {
      if (err) return console.error(err);
      res.json(structure);
    });
  },

  /*
  **************************
         liste des équipes classes matiere-coordo
   **************************
   */
  tableEquipeClasseJSON: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    let professeurs = req.session.etab + '_professeurs'
    let matieres = req.session.etab + '_matieres'
    Structure.aggregate([{
        $match: {
          'nom': req.body.classe
        }
      },
      {
        $unwind: '$matieres'
      },
      {
        $project: {
          idClasseMatiere: '$matieres._id',
          extraPeriode: "$extraPeriode",
          periode: '$periode',
          duree: "$matieres.duree",
          dureeExc: "$matieres.dureeExc",
          classe: "$nom",
          matiere: "$matieres.matiere",
          professeur: "$matieres.professeur",
          colleurs: "$matieres.colleurs"
        }
      },
      {
        $lookup: {
          from: matieres,
          localField: "matiere",
          foreignField: "_id",
          as: "matieres"
        }
      },
      {
        $lookup: {
          from: professeurs,
          localField: "professeur",
          foreignField: "_id",
          as: "professeurs"
        }
      },
      {
        $unwind: '$matieres'
      },
      {
        $unwind: '$professeurs'
      },
      {
        $project: {
          idClasseMatiere: 1,
          extraPeriode: 1,
          debutPeriode: '$periode.debut',
          finPeriode: '$periode.fin',
          classe: 1,
          duree: 1,
          dureeExc: 1,
          matiere: "$matieres.nom",
          nom: "$professeurs.nom",
          prenom: "$professeurs.prenom",
          colleurs: "$colleurs._id"
        }
      },
      {
        $lookup: {
          from: professeurs,
          localField: "colleurs",
          foreignField: "_id",
          as: "colleurs"
        }
      },
      {
        $project: {
          idClasseMatiere: 1,
          extraPeriode: 1,
          debutPeriode: 1,
          finPeriode: 1,
          classe: 1,
          duree: 1,
          dureeExc: 1,
          matiere: 1,
          nom: 1,
          prenom: 1,
          nomColleur: "$colleurs.nom",
          prenomColleur: "$colleurs.prenom",
        }
      },
    ]).exec(function(err, data) {
      if (err) return console.error(err);
      res.json(data);
    });
  },



  /*
  **************************
         gestion des periodes
   **************************
   */
  changeExtraPeriode: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab)
    Structure.findOneAndUpdate({
      _id: req.body.idClasse
    }, {
      $set: {
        'extraPeriode': req.body.extraPeriode
      }
    }).exec(function(err, structure) {
      if (err) return console.error(err);
      res.json();
    });
  },




  defExtraPeriode: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab)
    Structure.findOneAndUpdate({
      _id: req.body.idClasse
    }, {
      $set: {
        'periode': {
          'debut': moment(req.body.debutPeriode, 'DD/MM/YYYY').startOf('day'),
          'fin': moment(req.body.finPeriode, 'DD/MM/YYYY').startOf('day')
        }
      }
    }).exec(function(err, structure) {
      if (err) return console.error(err);
      res.end();
    });
  },


  /*
  **************************
         liste des élèves
   **************************
   */
  tableElevesClasseJSON: function(req, res) {
    let Eleve = require('../../models/eleve')(req.session.etab);
    Eleve.find({
      "classe": req.body.classe
    }).exec(function(err, classe) {
      if (err) return console.error(err);
      let data = []
      if (classe != null) {
        classe.forEach(function(value) {
          data.push({
            "nom": value.nom,
            "prenom": value.prenom,
            "login": value.login,
            "password": value.password,
          });
        });
      }
      res.json(data);
    });
  },



  /*
  **************************
         ajout ou modification d'une matiere
   **************************
   */
  addOrModClasseMatiere: function(req, res) {
    if (req.body.mode === 'ajouter') {
      ajoutClasseMatiere(req, res);
    } else {
      modifClasseMatiere(req, res);
    }
  },

  /*
  **************************
         suppression d'une matiere
   **************************
   */
  suppClasseMatiere: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    Structure.update({}, {
      $pull: {
        'matieres': {
          '_id': ObjectId(req.body.idClasseMatiere)
        }
      }
    }, {
      'multi': true
    }).exec(function(err, result) {
      if (err) return console.error(err);
      res.end();
    });
  },



}
