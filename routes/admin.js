const express = require('express');
const router = express.Router();
const login = require('./login');



router.get('/', login.isLoggedIn, function(req, res, next) {
  res.render('admin.ejs', {
    title: 'e-khôlle - administration',
    user: req.prenom + '-' + req.nom,
    role: req.session.role,
  });
});



/*
**************************
    GESTION CLASSES
 **************************
 */
/*
**************************
      Script pour afficher la sructure des classes
 **************************
 */
router.get('/tableStructureJSON/', login.isLoggedIn, function(req, res) {
  let Eleve = require('../models/eleve')(req.etab);
  structure = req.etab + '_structures'
  Eleve.aggregate([{
      $group: {
        _id: '$classe', //$region is the column name in collection
        count: {
          $sum: 1
        },
      }
    }, {
      $lookup: {
        from: structure,
        localField: "_id",
        foreignField: "nom",
        as: "classe"
      }
    },
    {
      $project: {
        nom: "$_id",
        total: "$count",
        classe: '$classe'
      }
    }
  ]).exec(function(err, data) {
    if (err) return console.error(err);
    console.log(data);
    res.json(data);
  });
});


/*
**************************
      Script pour afficher la table des matieres
 **************************
 */
router.get('/tableMatieresJSON/', login.isLoggedIn, function(req, res) {
  let Matiere = require('../models/matiere')(req.etab)
  Matiere.find(function(err, matieres) {
    if (err) return console.error(err);
    res.json(matieres);
  });
});



/*
**************************
       table des classes
 **************************
 */
router.get('/tableClassesJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.etab)
  Structure.find({}, {
    nom: 1,
    niveau: 1
  }, function(err, structure) {
    if (err) return console.error(err);
    res.json(structure);
  });
});

/*
**************************
       liste des équipes classes matiere-coordo
 **************************
 */
router.post('/tableEquipeClasseJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.etab);
  let Matiere = require('../models/matiere')(req.etab);
  let Professeur = require('../models/professeur')(req.etab);
  Structure.findOne({
    "nom": req.body.classe
  }, {
    'matieres.matiere': 1,
    'matieres.professeur': 1,
    'matieres.duree': 1
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
    if (typeof data.matieres === 'undefined') {
      data.matieres = [];
    }
    res.json(data.matieres);
  });
});

/*
**************************
       liste des élèves
 **************************
 */
router.post('/tableElevesClasseJSON/', login.isLoggedIn, function(req, res) {
  let Eleve = require('../models/eleve')(req.etab);
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
});

/*
**************************
       ajout d'une  matiere sur une classe
 **************************
 */
router.post('/addMatiereClasseJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.etab);
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
              duree: req.body.duree
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
});

/*
**************************
      FIN GESTION CLASSES
 **************************
 */


/*
**************************
      GESTION PROFESSEURS
 **************************
 */

router.get('/tableProfesseursJSON/', login.isLoggedIn, function(req, res) {
  let Professeur = require('../models/professeur')(req.etab);
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
      if (err) return console.error(err);
      let Structure = require('../models/structure')(req.etab);
      Structure.aggregate([{
            $unwind: "$matieres"
          },
          {
            $unwind: "$matieres.colleurs"
          },
          {
            $lookup: {
              from: data,
              localField: "matieres.colleurs.professeur",
              foreignField: "_id",
              as: "professeur"
            }
          },
        ])
        .exec(function(err, data) {
          if (err) return console.error(err);
          console.log(data);
          // let data = [];
          // professeurs.forEach(function(value) {
          //   let colles = [];
          //   value.colles.forEach(function(value) {
          //     colles.push({
          //       'classe': value.matiere.classe.nom,
          //       'matiere': value.matiere.matiere.nom
          //     })
          //   })
          //   data.push({
          //     "_id": value._id,
          //     "prenom": value.prenom,
          //     "nom": value.nom,
          //     "login": value.login,
          //     "password": value.password,
          //     "changePwd": value.changePwd,
          //     "grade": value.grade,
          //     "email": value.email,
          //     "colles": colles,
          //   })
          // });
          res.json(data);
        });
    });
});


// let Professeur = require('../models/professeur')(req.etab)
// let MatiereClasse = require('../models/matiereClasse')(req.etab);
// let ColleurMatiere = require('../models/colleurMatiere')(req.etab);
// let Classe = require('../models/classe')(req.etab);
// let Matiere = require('../models/matiere')(req.etab);
// Professeur.find().populate({
//     path: 'colles',
//     model: ColleurMatiere,
//     select: {
//       '_id': 1
//     },
//     populate: [{
//       path: 'matiere',
//       model: MatiereClasse,
//       select: {
//         '_id': 1
//       },
//       populate: [{
//           path: 'classe',
//           model: Classe,
//           select: {
//             'nom': 1
//           },
//         },
//         {
//           path: 'matiere',
//           model: Matiere,
//           select: {
//             'nom': 1
//           },
//         }
//       ]
//     }]
//   })
//   .exec(function(err, professeurs) {
//     if (err) return console.error(err);
//     let data = [];
//     professeurs.forEach(function(value) {
//       let colles = [];
//       value.colles.forEach(function(value) {
//         colles.push({
//           'classe': value.matiere.classe.nom,
//           'matiere': value.matiere.matiere.nom
//         })
//       })
//       data.push({
//         "_id": value._id,
//         "prenom": value.prenom,
//         "nom": value.nom,
//         "login": value.login,
//         "password": value.password,
//         "changePwd": value.changePwd,
//         "grade": value.grade,
//         "email": value.email,
//         "colles": colles,
//       })
//     });
//     res.json(data);
//   });
// });
/*
**************************
      FIN GESTION PROFESSEURS
 **************************
 */


/*
**************************
      GESTION RAMASSAGES
 **************************
 */

router.get("/decompteHeuresJSON/", login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.etab);
  let professeur = req.etab + '_professeurs'
  Structure.aggregate([{
        $unwind: "$matieres"
      },
      {
        $unwind: "$matieres.colleurs"
      },

      {
        $group: {
          _id: '$matieres.colleurs._id', //$region is the column name in collection
          count: {
            $sum: {
              $size: '$matieres.colleurs.colles'
            }
          },
          // heures: {
          //   $sum: '$duree'
          // }
        },
      },
      {
        $lookup: {
          from: professeur,
          localField: "_id",
          foreignField: "_id",
          as: "professeur"
        }
      },
      {
        $unwind: "$professeur"
      },
      {
        $project: {
          nom: "$professeur.nom",
          prenom: "$professeur.prenom",
          grade: "$professeur.grade",
          count: 1,
          heures: 'a faire'
        }
      },
    ])
    .exec(function(err, data) {
      console.log(data);
      if (err) return console.error(err);
      res.json(data);
    });
});



module.exports = router;
