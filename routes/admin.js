const express = require('express');
const router = express.Router();
const login = require('./login');
const moment = require('moment')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.get('/', login.isLoggedIn, function(req, res, next) {
  if (req.session.role === 'admin') {
    res.render('admin.ejs', {
      title: 'e-khôlle - administration',
      user: req.prenom + '-' + req.nom,
      role: req.session.role,
    });
  } else {
    res.redirect('/' + req.session.role);
  }
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
  let Eleve = require('../models/eleve')(req.session.etab);
  structure = req.session.etab + '_structures'
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
    res.json(data);
  });
});


/*
**************************
      Script pour afficher la table des matieres
 **************************
 */
router.get('/tableMatieresJSON/', login.isLoggedIn, function(req, res) {
  let Matiere = require('../models/matiere')(req.session.etab)
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
  let Structure = require('../models/structure')(req.session.etab)
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
  let Structure = require('../models/structure')(req.session.etab);
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
        extraPeriode: "$extraPeriode",
        periode: '$periode',
        duree: "$matieres.duree",
        dureeExc: "$matieres.dureeExc",
        classe: "$nom",
        matiere: "$matieres.matiere",
        professeur: "$matieres.professeur",
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
      $lookup: {
        from: professeurs,
        localField: "professeur",
        foreignField: "_id",
        as: "professeur"
      }
    },
    {
      $unwind: '$matiere'
    },
    {
      $unwind: '$professeur'
    },
    {
      $project: {
        extraPeriode: 1,
        debutPeriode: '$periode.debut',
        finPeriode: '$periode.fin',
        classe: 1,
        duree: 1,
        dureeExc: 1,
        matiere: "$matiere.nom",
        nom: "$professeur.nom",
        prenom: "$professeur.prenom",
      }
    },
  ]).exec(function(err, data) {
    if (err) return console.error(err);
    res.json(data);
  });
});

/*
**************************
       gestion des periodes
 **************************
 */
router.post('/changeExtraPeriode/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab)
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
});

router.post('/defExtraPeriode/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab)
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
    res.json();
  });
});

/*
**************************
       liste des élèves
 **************************
 */
router.post('/tableElevesClasseJSON/', login.isLoggedIn, function(req, res) {
  let Eleve = require('../models/eleve')(req.session.etab);
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
  let Structure = require('../models/structure')(req.session.etab);
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
  let Professeur = require('../models/professeur')(req.session.etab);
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
      let Structure = require('../models/structure')(req.session.etab);
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
});

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
/*
**************************
     definition année
 **************************
 */
router.post('/defAnnee/', login.isLoggedIn, function(req, res) {
  let Admin = require('../models/admin')(req.session.etab)
  Admin.findOneAndUpdate({
    _id: req._id
  }, {
    $set: {
      'annee': {
        'debut': moment(req.body.debutAnnee, 'DD/MM/YYYY').startOf('day'),
        'fin': moment(req.body.finAnnee, 'DD/MM/YYYY').startOf('day')
      }
    }
  }).exec(function(err, data) {
    console.log(data);
    if (err) return console.error(err);
    res.json();
  });
});

/*
**************************
     renvoie l'année et les périodes
 **************************
 */
router.get('/getAnnee/', login.isLoggedIn, function(req, res) {
  let Admin = require('../models/admin')(req.session.etab)
  Admin.findOne({
    _id: req._id
  }).exec(function(err, data) {
    if (err) return console.error(err);
    res.json(data);
  });
});

/*
**************************
     sauvegarde ou modifie une période
 **************************
 */
router.post('/sauvePeriode/', login.isLoggedIn, function(req, res) {
  let Admin = require('../models/admin')(req.session.etab)
  if (req.body.id === '') {
    //on ajoute une periode
    Admin.update({
      _id: req._id
    }, {
      $addToSet: {
        'periodes': {
          debutPeriode: req.body.debutPeriode,
          finPeriode: req.body.finPeriode,
          description: req.body.description,
        }
      }
    }).exec(function(err, data) {
      res.send(err);
    });
  } else {
    //on modifie
    Admin.update({
      _id: req._id
    }, {
      $set: {
        'periodes.$[el].debutPeriode': req.body.debutPeriode,
        'periodes.$[el].finPeriode': req.body.finPeriode,
        'periodes.$[el].description': req.body.description,
      }
    }, {
      arrayFilters: [{
        'el._id': ObjectId(req.body.id)
      }]
    }).exec(function(err, data) {
      console.log(data);
      res.send(err);
    });
  }
});


/*
**************************
     Supprime une période
 **************************
 */
router.post('/suppPeriode/', login.isLoggedIn, function(req, res) {
  console.log(req.body);
  let Admin = require('../models/admin')(req.session.etab)
  Admin.update({}, {
      $pull: {
        'periodes': {
          '_id': ObjectId(req.body.idPeriode)
        }
      }
    }, {
      'multi': true
    })
    .exec(function(err, result) {
      console.log(result);
      if (err) return console.error(err);
      //on modifie si idNext !==''
      if(req.body.idNext!==''){
        Admin.update({
          _id: req._id
        }, {
          $set: {
            'periodes.$[el].debutPeriode': req.body.dateFinPrevious,
          }
        }, {
          arrayFilters: [{
            'el._id': ObjectId(req.body.idNext)
          }]
        }).exec(function(err, result) {
          console.log(result);
          if (err) return console.error(err);
          res.send(err);
        });
      }
      else{
         res.send(err);
      }
    });
});
/*
**************************
     Bilan
 **************************
 */
router.post("/decompteHeuresJSON/", login.isLoggedIn, function(req, res) {
  let Admin = require('../models/admin')(req.session.etab)
  Admin.aggregate([{
        $unwind: "$periodes"
      },
      {
        $project: {
          periode: '$periodes',
        }
      },
      {
        $match: {
          'periode._id': ObjectId(req.body.idPeriode)
        }
      },
    ])
    .exec(function(err, data) {
      let debutPeriode = data[0].periode.debutPeriode;
      let finPeriode = data[0].periode.finPeriode;
      let Structure = require('../models/structure')(req.session.etab);
      let professeur = req.session.etab + '_professeurs'
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
          $project: {
            classe: '$nom',
            extraPeriode: 1,
            debut: '$periode.debut',
            fin: '$periode.fin',
            professeur: "$matieres.colleurs._id",
            colles: "$matieres.colleurs.colles",
            dateSaisie: "$matieres.colleurs.colles.dateSaisie",
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
        }, {
          $match: {
            dateSaisie: {
              $gte: debutPeriode,
              $lt: finPeriode
            }
          }
        },
        {
          $group: {
            _id: {
              professeur: '$professeur',
              classe: '$classe',
              duree: '$duree'
            }, //$region is the column name in collection
            count: {
              $sum: 1
            },
            heures: {
              $sum: '$duree'
            }
          },
        },
        {
          $group: {
            _id: '$_id.professeur',
            bilan: {
              $push: {
                classe: '$_id.classe',
                count: '$count',
                heures: '$heures',
                duree: '$_id.duree'
              }
            },
            count: {
              $sum: '$count'
            },
            heures: {
              $sum: '$heures'
            },
          }
        }, {
          $lookup: {
            from: professeur,
            localField: "_id",
            foreignField: "_id",
            as: "professeur"
          }
        }, {
          $unwind: "$professeur"
        },
        {
          $project: {
            nom: "$professeur.nom",
            prenom: "$professeur.prenom",
            grade: "$professeur.grade",
            bilan: 1,
            count: 1,
            heures: 1

          }
        },
      ]).exec(function(err, data) {
        console.log(data);
        if (err) return console.error(err);
        res.json(data);
      });
    });
});




module.exports = router;
