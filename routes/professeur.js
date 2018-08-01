const express = require('express');
const router = express.Router();
const login = require('./login');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/*
**************************
page index professeur
**************************
*/
router.get('/', login.isLoggedIn, function(req, res, next) {
  if (req.session.role === 'professeur') {
    res.render('professeur.ejs', {
      title: 'e-khôlle - professeur',
      user: req.prenom + '-' + req.nom,
      role: req.session.role,
      id: req._id,
      etab: req.session.etab,
    });
  } else {
    res.redirect('/' + req.session.role);
  }

});




/*
**************************
TAB  COLLEUR
**************************
*/

/*
**************************
association matiere/classe avec le professeur coordo de discipline pour datalist
**************************
*/

router.post('/listeMatiereClasseJSON/', login.isLoggedIn, function(req, res) {
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
});


/*
**************************
ajoute une colle à un professeur en l'associant à une matiere/classe
**************************
*/
router.post('/addMatiereProfesseurJSON/', login.isLoggedIn, function(req, res) {
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
});



/*
**************************
table pour afficher les matieres/classes du colleur
**************************
*/
router.post('/tableMesCollesClassesJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
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
});


/*
**************************
liste des élèves à coller pour la matière choisie ar le colleur
**************************
*/

router.post('/listeElevesJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
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
});


ajoutColle = function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
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



modifColle = function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
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


/*
**************************
Ajout ou modification d'une colle dans la base
**************************
*/
router.post('/addOrModColle/', login.isLoggedIn, function(req, res) {
  if (req.body.mode === 'ajouter') {
    ajoutColle(req, res);
  } else {
    modifColle(req, res);
  }
});

/*
**************************
Suppression d'une colle dans la base
**************************
*/


router.post('/suppColle/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
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
});




/*
**************************
table pour afficher la liste des colles dans une matière du colleur
**************************
*/


router.post('/tableCollesJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
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
        obsCoordo: "$colles.obsCoordo",
        obsEleve: "$colles.obsEleve",
        nom: "$eleves.nom",
        prenom: "$eleves.prenom",
      }
    },
  ]).exec(function(err, data) {

    if (err) return console.error(err);
    res.send(data);
  });
});


/*
**************************
 COORDO de discipline
**************************
*/

/*
**************************
table pour afficher la liste des colleurs du coordo
**************************
*/

router.post('/tableMesClassesJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
  let matiere = req.session.etab + '_matieres';
  let professeur = req.session.etab + '_professeurs'
  Structure.aggregate([{
      $unwind: "$matieres"
    },
    {
      $match: {
        'matieres.professeur': ObjectId(req.body.idProfesseur)
      }
    },
    {
      $unwind: "$matieres.colleurs"
    },
    {
      $project: {
        classe: "$nom",
        idColleur: "$matieres.colleurs._id",
        idMatiere: "$matieres.matiere",
      }
    },
    {
      $lookup: {
        from: matiere,
        localField: "idMatiere",
        foreignField: "_id",
        as: "matiere"
      }
    },
    {
      $lookup: {
        from: professeur,
        localField: "idColleur",
        foreignField: "_id",
        as: "professeur"
      }
    },
    {
      $project: {
        classe: 1,
        nom: "$professeur.nom",
        prenom: "$professeur.prenom",
        matiere: "$matiere.nom",
      }
    },
  ]).exec(function(err, data) {
    if (err) return console.error(err);
    res.send(data);
  });
});


/*
**************************
liste des classes du coordonateur
**************************
*/
router.post("/tableClassesCoordoJSON/", login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
  let matieres = req.session.etab + '_matieres';
  Structure.aggregate([{
        $unwind: "$matieres"
      },
      {
        $match: {
          'matieres.professeur': ObjectId(req.body.idProfesseur)
        }
      },
      {
        $project: {
          idClasseMatiere: "$matieres._id",
          classe: "$nom",
          matiere: "$matieres.matiere",
        }
      },
      {
        $lookup: {
          from: matieres,
          localField: "matiere",
          foreignField: "_id",
          as: "matiere"
        }
      },
      {
        $unwind: "$matiere"
      },
      {
        $project: {
          idClasseMatiere: 1,
          classe: 1,
          matiere: "$matiere.nom",
        }
      },
    ])
    .exec(function(err, data) {
      if (err) return console.error(err);
      res.send(data);
    });

});


/*
**************************
table pour afficher la liste des colles dans une matière donnee pour le coordo
**************************
*/
router.post('/tableCollesCoordoJSON/', login.isLoggedIn, function(req, res) {

  let Structure = require('../models/structure')(req.session.etab);
  let eleves = req.session.etab + '_eleves';
  let professeurs = req.session.etab + '_professeurs';
  Structure.aggregate([{
      $unwind: "$matieres"
    },
    {
      $match: {
        'matieres._id': ObjectId(req.body.idClasseMatiere)
      }
    },
    {
      $project: {
        colleurs: "$matieres.colleurs",
      }
    },
    {
      $unwind: "$colleurs"
    },
    {
      $unwind: "$colleurs.colles"
    },
    {
      $project: {
        idColleur: "$colleurs._id",
        colles: "$colleurs.colles"
      }
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
      $lookup: {
        from: professeurs,
        localField: "idColleur",
        foreignField: "_id",
        as: "professeurs"
      }
    },
    {
      $unwind: "$professeurs"
    },
    {
      $project: {
        idMatiereColle: '$matiere',
        idColle: "$colles._id",
        note: "$colles.note",
        noNote: "$colles.noNote",
        sujet: "$colles.sujet",
        date: "$colles.date",
        obsCoordo: "$colles.obsCoordo",
        obsEleve: "$colles.obsEleve",
        nomE: "$eleves.nom",
        prenomE: "$eleves.prenom",
        nomP: "$professeurs.nom",
        prenomP: "$professeurs.prenom",
      }
    },
  ]).exec(function(err, data) {
    if (err) return console.error(err);
    res.send(data);
  });
});

/*
**************************
table pour afficher les résultats et moyenne pour les classes du coordo
**************************
*/
router.post('/tableResultatsCoordoJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
  let eleves = req.session.etab + '_eleves';
  Structure.aggregate([{
      $unwind: "$matieres"
    },
    {
      $match: {
        'matieres._id': ObjectId(req.body.idClasseMatiere)
      }
    },
    {
      $project: {
        colleurs: "$matieres.colleurs",
      }
    },
    {
      $unwind: "$colleurs"
    },
    {
      $unwind: "$colleurs.colles"
    },
    {
      $project: {
        colles: "$colleurs.colles",
        idE: "$colleurs.colles.eleve",
        notesModif: {
          $cond: [{
              $ne: ["$colleurs.colles.note", null]
            },
            '$colleurs.colles.note',
            '$colleurs.colles.noNote'
          ]
        }
      }
    },
    {
      $group: {
        _id: '$idE', //$region is the column name in collection
        notes: {
          $push: '$notesModif'
        },
        moyenne: {
          $avg: "$colles.note"
        },
      },
    },
    {
      $sort: {
        moyenne: 1
      }
    },
    {
      $lookup: {
        from: eleves,
        localField: "_id",
        foreignField: "_id",
        as: "eleves"
      }
    },
    {
      $unwind: "$eleves"
    },
    {
      $project: {
        moyenne: 1,
        notes: "$notes",
        nomE: "$eleves.nom",
        prenomE: "$eleves.prenom",
      }
    },
  ]).exec(function(err, data) {

    if (err) return console.error(err);
    res.send(data);
  });
});

/*
**************************
table pour afficher le bilan des heures réalisées par le colleur
**************************
*/

router.post("/tableDecompteHeuresJSON/", login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
  let matieres = req.session.etab + '_matieres'
  Structure.aggregate([{
        $unwind: "$matieres"
      },
      {
        $unwind: "$matieres.colleurs"
      },
      {
        $unwind: "$matieres.colleurs.colles"
      },
      {
        $match: {
          'matieres.colleurs._id': ObjectId(req.body.idProfesseur)
        }
      },
      {
        $project: {
          classe: "$nom",
          matiere: "$matieres.matiere",
          extraPeriode: 1,
          debut: '$periode.debut',
          fin: '$periode.fin',
          professeur: "$matieres.colleurs._id",
          colles: "$matieres.colleurs.colles",
          classeMatiere: "$matieres._id",
          date: "$colles.date",
          duree: {
            $cond: [

              {
                $and: [{
                    $eq: ["$extraPeriode", true]
                  },
                  {
                    $gte: ["$matieres.colleurs.colles.date", "$periode.debut"]
                  }, {
                    $lte: ["$matieres.colleurs.colles.date", "$periode.fin"]
                  }
                ]
              },

              '$matieres.dureeExc',
              '$matieres.duree'
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            classeMatiere: '$classeMatiere',
            duree: '$duree',
            classe: '$classe',
            matiere: '$matiere',
          }, //$region is the column name in collection
          count: {
            $sum: 1
          },
          heures: {
            $sum: '$duree'
          },

        },
      },
      {
        $lookup: {
          from: matieres,
          localField: "_id.matiere",
          foreignField: "_id",
          as: "matieres"
        }
      },
      {
        $unwind: "$matieres"
      },
      {
        $project: {
          _id :0,
          classe: "$_id.classe",
          matiere: "$matieres.nom",
          count: 1,
          heures :1,
        }
      },
    ])
    .exec(function(err, data) {

      if (err) return console.error(err);
      res.json(data);
    });
});

module.exports = router;
