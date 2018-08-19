const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;



/*
**************************
PRIVE
**************************
*/

/*
**************************
ajout colle
**************************
*/
  function ajoutColle(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
  // il faut au prealable filtrer sur la matiere de la colle
  Structure.update({
      'matieres._id': req.body.idMatiereColle
    }, {
      $push: {
        'matieres.$[el1].colleurs.$[el2].colles': {
          'note': req.body.note,
          'noNote': req.body.noNote,
          'sujet': req.body.sujet,
          'date': req.body.date,
          'dateSaisie': req.body.dateSaisie,
          'obsCoordo': req.body.obsCoordo,
          'obsEleve': req.body.obsEleve,
          'eleve': {
            _id: req.body.idEleve
          },
        }
      }
    }, {
      arrayFilters: [{
          'el1._id': ObjectId(req.body.idMatiereColle)
        },
        {
          'el2._id': ObjectId(req.body.idProfesseur)
        }
      ]
    })
    .exec(function(err, result) {
      console.log(result);
      //on peut eventuellement renvoyer un message sur la reussite ou non
      res.send();
    });
}



function modifColle(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
  // il faut au prealable filtrer sur la matiere de la colle

  Structure.update({
      'matieres._id': req.body.idMatiereColle
    }, {
      $set: {
        'matieres.$[el1].colleurs.$[el2].colles.$[el3].note': req.body.note,
        'matieres.$[el1].colleurs.$[el2].colles.$[el3].noNote': req.body.noNote,
        'matieres.$[el1].colleurs.$[el2].colles.$[el3].date': req.body.date,
        'matieres.$[el1].colleurs.$[el2].colles.$[el3].sujet': req.body.sujet,
        'matieres.$[el1].colleurs.$[el2].colles.$[el3].obsCoordo': req.body.obsCoordo,
        'matieres.$[el1].colleurs.$[el2].colles.$[el3].obsEleve': req.body.obsEleve,
      }
    }, {
      arrayFilters: [{
          'el1._id': ObjectId(req.body.idMatiereColle)
        },
        {
          'el2._id': ObjectId(req.body.idProfesseur)
        },
        {
          'el3._id': ObjectId(req.body.idColle)
        }
      ]
    })
    .exec(function(err, result) {
      if (err) return console.error(err);
    });
  res.send();
}









module.exports = {


  /*
  **************************
  association matiere/classe avec le professeur coordo de discipline pour datalist
  **************************
  */

  listeMatiereClasseJSON : function(req, res) {
    let Structure = require('../models/structure')(req.session.etab);
    let Matiere = require('../models/matiere')(req.session.etab);
    let Professeur = require('../models/professeur')(req.session.etab);
    Structure.findOne({
      "_id": req.body.idClasse
    }, {
      'matieres.matiere': 1,
      'matieres.professeur': 1,
      'matieres.duree': 1,
      'matieres._id': 1
    }).populate({
      path: 'matieres.matiere',
      model: Matiere,
      select: {
        'nom': 1,
        '_id': 0
      }
    }).populate({
      path: 'matieres.professeur',
      model: Professeur,
      select: {
        'nom': 1,
        'prenom': 1,
        '_id': 0
      }
    }).exec(function(err, data) {
      if (err) return console.error(err);
      res.json(data.matieres);
    });
  },

  /*
  **************************
  ajoute une colle à un professeur en l'associant à une matiere/classe
  **************************
  */
  addMatiereProfesseurJSON : function(req, res) {
    let Matiere = require('../models/matiere')(req.session.etab);
    let Professeur = require('../models/professeur')(req.session.etab);
    let Structure = require('../models/structure')(req.session.etab);
    Structure.update({
      "_id": req.body.idClasse
    }, {
      $addToSet: {
        'matieres.$[element].colleurs': {
          _id: req.body.idProfesseur
        }
      }
    }, {
      arrayFilters: [{
        'element._id': ObjectId(req.body.idClasseMatiere)
      }]
    }).exec(function(err, data) {
      if (data.nModified !== 0) {
        res.send({
          "error": "ok"
        });
      } else {
        res.send({
          "error": "Cette association Colleur/Matière est déjà créée"
        });
      }
    });
  },


  /*
  **************************
  table pour afficher les matieres/classes du colleur
  **************************
  */
  tableMesCollesClassesJSON : function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    let matiere = req.session.etab + '_matieres';
    let professeur = req.session.etab + '_professeurs'
    Structure.aggregate([{
          $unwind: "$matieres"
        },
        {
          $match: {
            'matieres.colleurs._id': ObjectId(req.body.idProfesseur)
          }
        },
        {
          $project: {
            classe: "$nom",
            idClasseMatiere: "$matieres._id",
            duree: "$matieres.duree",
            matiere: "$matieres.matiere",
            professeur: "$matieres.professeur"
          }
        },
        {
          $lookup: {
            from: matiere,
            localField: "matiere",
            foreignField: "_id",
            as: "matiere"
          }
        },
        {
          $lookup: {
            from: professeur,
            localField: "professeur",
            foreignField: "_id",
            as: "professeur"
          }
        },
        {
          $unwind: "$professeur"
        },
        {
          $unwind: "$matiere"
        },
        {
          $project: {
            idMatiereColleur: '$_id',
            classe: 1,
            idClasseMatiere: 1,
            duree: 1,
            matiere: '$matiere.nom',
            nom: '$professeur.nom',
            prenom: '$professeur.prenom'
          }
        },

      ])
      .exec(function(err, data) {
        if (err) return console.error(err);
        res.send(data);
      });
  },



  /*
  **************************
  liste des élèves à coller pour la matière choisie ar le colleur
  **************************
  */
  listeElevesJSON : function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    let eleves = req.session.etab + '_eleves';
    Structure.aggregate([{
        $unwind: "$matieres"
      },
      {
        $match: {
          $and: [{
            'matieres.colleurs._id': ObjectId(req.body.idProfesseur),
            'matieres._id': ObjectId(req.body.idColle)
          }]
        }
      },
      {
        $lookup: {
          from: eleves,
          localField: "nom",
          foreignField: "classe",
          as: "eleves"
        }
      },
      {
        $unwind: "$eleves"
      },
      {
        $project: {
          _id: "$eleves._id",
          nom: "$eleves.nom",
          prenom: "$eleves.prenom",
        }
      },
      {
        $sort: {
          nom: 1,
          prenom: 1
        }
      }
    ]).exec(function(err, data) {

      // if (typeof data == 'undefined') {
      //   res.send([]);
      //   return;
      // }
      // let classe = data.matiere.classe.nom;
      // let option = data.matiere.option; //liste des num ine des eleves suivants l option
      //
      // Eleve.find({
      //   $and: [{
      //       "classe": classe
      //     },
      //     {
      //       'ine': {
      //         $nin: option
      //       }
      //     }
      //   ]
      // }).exec(function(err, eleves) {
      //   let data = []
      //   eleves.forEach(function(value) {
      //     data.push({
      //       "_id": value._id,
      //       "prenom": value.prenom,
      //       "nom": value.nom,
      //     })
      //   });
      //

      res.send(data);
    })
  },


  /*
  **************************
  Ajout ou modification d'une colle dans la base
  **************************
  */
  addOrModColle : function(req, res) {
    if (req.body.mode === 'ajouter') {
      ajoutColle(req, res);
    } else {
      modifColle(req, res);
    }
  },

  /*
  **************************
  Suppression d'une colle dans la base
  **************************
  */


  suppColle : function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    // il faut au prealable filtrer sur la matiere de la colle
    Structure.update({}, {
      $pull: {
        'matieres.$[].colleurs.$[].colles': {
          '_id': ObjectId(req.body.idColle)
        }
      }
    }, {
      'multi': true
    }).exec(function(err, result) {
      if (err) return console.error(err);
      res.send();
    });
  },

  /*
  **************************
  table pour afficher la liste des colles dans une matière du colleur
  **************************
  */


  tableCollesJSON : function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    let eleves = req.session.etab + '_eleves';
    Structure.aggregate([{
        $unwind: "$matieres"
      },
      {
        $unwind: "$matieres.colleurs"
      },
      {
        $match: {
          $and: [{
            'matieres.colleurs._id': ObjectId(req.body.idProfesseur),
            'matieres._id': ObjectId(req.body.idMatiereColle)
          }]
        }
      },
      {
        $project: {
          matiere: "$matieres._id",
          colles: "$matieres.colleurs.colles"
        }
      },
      {
        $unwind: "$colles"
      },
      {
        $lookup: {
          from: eleves,
          localField: "colles.eleve",
          foreignField: "_id",
          as: "eleves"
        }
      },
      {
        $unwind: "$eleves"
      },
      {
        $project: {
          idMatiereColle: '$matiere',
          idColle: "$colles._id",
          note: "$colles.note",
          noNote: "$colles.noNote",
          sujet: "$colles.sujet",
          date: "$colles.date",
          dateSaisie: "$colles.dateSaisie",
          obsCoordo: "$colles.obsCoordo",
          obsEleve: "$colles.obsEleve",
          nom: "$eleves.nom",
          prenom: "$eleves.prenom",
        }
      },
      {
        $sort: {
          date: -1
        }
      },
    ]).exec(function(err, data) {
      if (err) return console.error(err);
      res.send(data);
    });
  },

  /*
  **************************
  table pour afficher les programes de colle du colleur
  **************************
  */

  tableProgrammeColleurJSON : function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    let professeurs = req.session.etab + '_professeurs';
    Structure.aggregate([{
        $unwind: "$matieres"
      },
      {
        $unwind: "$matieres.colleurs"
      },
      {
        $match: {
            'matieres.colleurs._id': ObjectId(req.body.idProfesseur)
          }
      },
      {
        $project: {
          classe: "$nom",
          idProf: "$matieres.professeur",
          programme : "$matieres.programme",
        }
      },
      {
        $unwind: "$programme"
      },
      {
        $lookup: {
          from: professeurs,
          localField: "idProf",
          foreignField: "_id",
          as: "professeurs"
        }
      },
      {
        $project: {
          classe: 1,
          idMat: 1,
          nom : "$professeurs.nom",
          prenom : "$professeurs.prenom",
          debut : "$programme.debut",
          fin : "$programme.fin",
          titre: "$programme.titre",
          detail: "$programme.detail",
        }
      },
    ]).exec(function(err, data) {
      if (err) return console.error(err);
      res.send(data);
    });
  },

  //fin exports
}
