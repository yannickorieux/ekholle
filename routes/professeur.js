const express = require('express');
const router = express.Router();
const login = require('./login');



/*
**************************
page index professeur
**************************
*/
router.get('/', login.isLoggedIn, function(req, res, next) {
  res.render('professeur.ejs', {
    title: 'e-khôlle - professeur',
    user: req.prenom + '-' + req.nom,
    role: req.session.role,
    id: req._id,
    etab: req.etab,
  });
});


/*
**************************
association matiere/classe avec le professeur pour datalist
**************************
*/
router.post('/listeMatiereClasseJSON/', login.isLoggedIn, function(req, res) {
  let _id = req.body.idClasse;
  let MatiereClasse = require('../models/matiereClasse')(req.etab);
  let Matiere = require('../models/matiere')(req.etab);
  let Professeur = require('../models/professeur')(req.etab);
  MatiereClasse.find({
    "classe": _id
  }).populate({
    path: 'matiere',
    model: Matiere
  }).populate({
    path: 'professeur',
    model: Professeur
  }).exec(function(err, matiereClasse) {
    if (err) return console.error(err);
    let data = [];
    matiereClasse.forEach(function(value) {
      data.push({
        "_id": value._id,
        "matiere": value.matiere.nom + '---' + value.professeur.prenom + '-' + value.professeur.nom,
      })
    });
    res.json(data);
  });
});

/*
**************************
ajoute une matiere/classe/professeur dans la base
**************************
*/
router.post('/addMatiereProfesseurJSON/', login.isLoggedIn, function(req, res) {
  let Matiere = require('../models/matiere')(req.etab);
  let Professeur = require('../models/professeur')(req.etab);
  let ColleurMatiere = require('../models/colleurMatiere')(req.etab);
  ColleurMatiere.find({
    $and: [{
      "professeur": req.body.idProfesseur
    }, {
      "matiere": req.body.idClasseMatiere
    }]
  }, function(err, exist) {
    console.log(exist);
    if (exist.length === 0) {
      let colleurMatiere = new ColleurMatiere({
        'professeur': {
          _id: req.body.idProfesseur
        },
        'matiere': {
          _id: req.body.idClasseMatiere
        },
      });
      colleurMatiere.save(function(err) {
        if (err) return handleError(err);
        Professeur.findOneAndUpdate({
          '_id': req.body.idProfesseur
        }, {
          $push: {
            'matieres': {
              _id: colleurMatiere._id
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
  let idProfesseur = req.body.idProfesseur;
  let Matiere = require('../models/matiere')(req.etab);
  let MatiereClasse = require('../models/matiereClasse')(req.etab);
  let Professeur = require('../models/professeur')(req.etab);
  let ColleurMatiere = require('../models/colleurMatiere')(req.etab);
  let Classe = require('../models/classe')(req.etab);
  ColleurMatiere.find({
    "professeur": idProfesseur
  }).populate({
    path: 'matiere',
    model: MatiereClasse,
    populate: [{
        path: 'classe',
        model: Classe
      },
      {
        path: 'matiere',
        model: Matiere
      },
      {
        path: 'professeur',
        model: Professeur
      }
    ]
  }).exec(function(err, classes) {
    if (err) return console.error(err);
    let data = []
    classes.forEach(function(value) {
      data.push({
        "_id": value._id,
        "classe": value.matiere.classe.nom,
        "matiere": value.matiere.matiere.nom,
        "duree": value.matiere.duree,
        "professeur": value.matiere.professeur.prenom + '\u0020' + value.matiere.professeur.nom,
      })
    });
    res.send(data);
  });
});

/*
**************************
liste des élèves à coller pour la matière choisie ar le colleur
**************************
*/
router.post('/listeElevesJSON/', login.isLoggedIn, function(req, res) {
  let Matiere = require('../models/matiere')(req.etab);
  let ColleurMatiere = require('../models/colleurMatiere')(req.etab);
  let MatiereClasse = require('../models/matiereClasse')(req.etab);
  let Classe = require('../models/classe')(req.etab);
  ColleurMatiere.findOne({
    "_id": req.body.idColle
  }).populate({
    path: 'matiere',
    model: MatiereClasse,
    populate: [{
      path: 'classe',
      model: Classe,
    }, ]
  }).exec(function(err, data) {
    if(typeof data =='undefined'){
      res.send([]);
      return;
    }
    let classe = data.matiere.classe.nom;
    let option = data.matiere.option; //liste des num ine des eleves suivants l option
    let Eleve = require('../models/eleve')(req.etab);
    Eleve.find({
      $and : [{
          "classe": classe
        },
        {
          'ine': {
            $nin: option
          }
        }
      ]
    }).exec(function(err, eleves) {
      let data = []
      eleves.forEach(function(value) {
        data.push({
          "_id": value._id,
          "prenom": value.prenom,
          "nom": value.nom,
        })
      });
      res.send(data);
    })
  })
});

/*
**************************
Ajout d'une colle dans la base
**************************
*/
router.post('/addColleJSON/', login.isLoggedIn, function(req, res) {
  let ColleurMatiere = require('../models/colleurMatiere')(req.etab);
  let MatiereClasse = require('../models/matiereClasse')(req.etab);
  let Classe = require('../models/classe')(req.etab);
  ColleurMatiere.findOne({
    _id: req.body.idColle
  }).populate({
    path: 'matiere',
    model: MatiereClasse,
    populate: [{
      path: 'classe',
      model: Classe
    }]
  }).exec(function(err, result) {
    if (err) return console.error(err);
    let Colle = require('../models/colle')(req.etab);
    let colle = new Colle({
      'eleve': {
        _id: req.body.idEleve
      },
      'professeur': {
        _id: req.body.idProfesseur
      },
      'matiere': {
        _id: req.body.idColle
      },
      'note': req.body.note,
      'duree': result.matiere.duree,
      'classe': result.matiere.classe.nom,
      'sujet': req.body.sujet,
      'date': req.body.date
    });
    colle.save(function(err) {
      if (err) return handleError(err);
    });
    res.send();

  });

});

/*
**************************
table pour afficher la liste des colles dans une matière donnee
**************************
*/
router.post('/tableCollesJSON/', login.isLoggedIn, function(req, res) {
  let idMatiere = req.body.idMatiere;
  let Colle = require('../models/colle')(req.etab);
  let Eleve = require('../models/eleve')(req.etab);
  Colle.find({
    "matiere": idMatiere
  }).populate('eleve').exec(function(err, colles) {
    if (err) return console.error(err);
    let data = []
    colles.forEach(function(value) {
      data.push({
        "nom": value.eleve.prenom + ' ' + value.eleve.nom,
        "note": value.note,
        "date": value.date,
        "sujet": value.sujet,
      })
    });
    res.send(data);
  });
});

module.exports = router;
