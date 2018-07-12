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
  classe = req.etab + '_classes'
  Eleve.aggregate([{
      $group: {
        _id: '$classe', //$region is the column name in collection
        count: {
          $sum: 1
        },
      }
    }, {
      $lookup: {
        from: classe,
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
  ]).exec(function(err, classes) {
    if (err) return console.error(err);

    let data = []
    classes.forEach(function(value) {

      data.push({
        nom: value.nom,
        total: value.total,
        niveau: value.classe[0].niveau,
        taux : " à renseigner"
      })

    });
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




router.get('/tableClassesJSON/', login.isLoggedIn, function(req, res) {
  let Classe = require('../models/classe')(req.etab)
  Classe.find(function(err, classes) {
    if (err) return console.error(err);
    res.json(classes);
  });
});

router.post('/tableEquipeClasseJSON/', login.isLoggedIn, function(req, res) {
  let classe = req.body.classe;
  let Classe = require('../models/classe')(req.etab);
  let MatiereClasse = require('../models/matiereClasse')(req.etab);
  let Matiere = require('../models/matiere')(req.etab);
  let Professeur = require('../models/professeur')(req.etab);
  Classe.findOne({
    "nom": classe
  }).populate({
    path: 'matieres',
    model: MatiereClasse,
    populate: [{
        path: 'matiere',
        model: Matiere,
      },
      {
        path: 'professeur',
        model: Professeur
      }
    ]
  }).exec(function(err, classe) {
    if (err) return console.error(err);
    let data = []
    if (classe != null) {
      classe.matieres.forEach(function(value) {
        data.push({
          "matiere": value.matiere.nom,
          "professeur": value.professeur.prenom + '\u0020' + value.professeur.nom,
          "duree": value.duree,
        })
      });
    }
    res.json(data);
  });
});


router.post('/tableElevesClasseJSON/', login.isLoggedIn, function(req, res) {
  let classe = req.body.classe;
  let Eleve = require('../models/eleve')(req.etab);
  Eleve.find({
    "classe": classe
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


router.post('/addMatiereClasseJSON/', login.isLoggedIn, function(req, res) {
  let MatiereClasse = require('../models/matiereClasse')(req.etab);
  MatiereClasse.find({
    $and: [{
      "classe": req.body.idClasse
    }, {
      "matiere": req.body.idMatiere
    }, {
      "professeur": req.body.idProfesseur
    }]
  }, function(err, exist) {
    if (exist.length === 0) {

      let matClasse = new MatiereClasse({
        'classe': {
          _id: req.body.idClasse
        },
        'matiere': {
          _id: req.body.idMatiere
        },
        'professeur': {
          _id: req.body.idProfesseur
        },
        'duree': req.body.duree
      });
      matClasse.save(function(err) {
        if (err) return handleError(err);
        let Classe = require('../models/classe')(req.etab)
        Classe.findOneAndUpdate({
          '_id': req.body.idClasse
        }, {
          $push: {
            'matieres': {
              _id: matClasse._id
            }
          }
        }, function(err, classe) {
          if (err) return console.error(err);
          res.send({
            "error": "ok"
          });
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
  let Professeur = require('../models/professeur')(req.etab)
  Professeur.find(function(err, professeurs) {
    if (err) return console.error(err);
    res.json(professeurs);
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

router.get("/decompteHeuresJSON/", login.isLoggedIn, function(req, res) {
  let Colle = require('../models/colle')(req.etab);
  let Professeur = require('../models/professeur')(req.etab);
  let ColleurMatiere = require('../models/colleurMatiere')(req.etab);
  Colle.aggregate([{
      $group: {
        _id: '$professeur', //$region is the column name in collection
        count: {
          $sum: 1
        },
        heures: {
          $sum: '$duree'
        }
      }
    }])
    .exec(function(err, result) {
      if (err) {
        next(err);
      } else {
        Colle.populate(result, {
          path: '_id',
          model: 'Professeur'
        }, function(err, populatedResult) {
          let data = []
          populatedResult.forEach(function(value) {
            data.push({
              "prenom": value._id.prenom,
              "nom": value._id.nom,
              "grade": value._id.grade,
              "nombre": value.count,
              "heures": value.heures,
            })
          });
          res.json(data);
          // Your populated translactions are inside populatedTransactions
        });

      }
    });


});

module.exports = router;
