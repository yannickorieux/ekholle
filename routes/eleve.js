const express = require('express');
const router = express.Router();
const login = require('./login');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/*
**************************
page index eleve
**************************
*/
router.get('/', login.isLoggedIn, function(req, res, next) {
  console.log(req.session.role );
  if (req.session.role === 'eleve') {
    res.render('eleve.ejs', {
      title: 'e-khôlle - eleve',
      user: req.prenom + '-' + req.nom,
      role: req.session.role,
      id: req._id,
      classe : req.session.classe,
      etab: req.session.etab,
    });
  } else {
    res.redirect('/' + req.session.role);
  }

});


/*
**************************
liste des colles de l'eleve
**************************
*/
router.post('/tableCollesJSON/', login.isLoggedIn, function(req, res) {
  console.log(req.body);
  let Structure = require('../models/structure')(req.session.etab);
  let professeurs = req.session.etab + '_professeurs';
  let matieres = req.session.etab + '_matieres';
  Structure.aggregate([
    {
      $match: { nom : req.body.classe}
    },
    {
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
        idColleur: "$matieres.colleurs._id",
        idMatiere : "$matieres.matiere",
        colles: "$matieres.colleurs.colles",
        idEleve : "$matieres.colleurs.colles.eleve",
      }
    },
    {
      $match: { idEleve : ObjectId(req.body.idEleve) }
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
      $lookup: {
        from: matieres,
        localField: "idMatiere",
        foreignField: "_id",
        as: "matieres"
      }
    },
    {
      $unwind: "$matieres"
    },
    {
      $project: {
        note: "$colles.note",
        noNote: "$colles.noNote",
        sujet: "$colles.sujet",
        date: "$colles.date",
        obsEleve: "$colles.obsEleve",
        nomP: "$professeurs.nom",
        prenomP: "$professeurs.prenom",
        matiere : "$matieres.nom",
      }
    },
    {
      $sort: {
        date: -1
      }
    },
  ]).exec(function(err, data) {
    console.log(data);
    if (err) return console.error(err);
    res.send(data);
  });
});

/*
**************************
table pour afficher les programes de l'élève
**************************
*/

router.post('/tableProgrammeEleveJSON/', login.isLoggedIn, function(req, res) {
  let Structure = require('../models/structure')(req.session.etab);
  let professeurs = req.session.etab + '_professeurs';
  let matieres = req.session.etab + '_matieres';
  Structure.aggregate([
    {
      $match: {nom : req.body.classe}
    },
    {
      $unwind: "$matieres"
    },
    {
      $project: {
        classe: "$nom",
        idProf: "$matieres.professeur",
        idMat: "$matieres.matiere",
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
      $unwind: "$professeurs"
    },
    {
      $lookup: {
        from: matieres,
        localField: "idMat",
        foreignField: "_id",
        as: "matieres"
      }
    },
    {
      $unwind: "$matieres"
    },
    {
      $project: {
        classe: 1,
        matiere: "$matieres.nom",
        nom : "$professeurs.nom",
        prenom : "$professeurs.prenom",
        debut : "$programme.debut",
        fin : "$programme.fin",
        titre: "$programme.titre",
        detail: "$programme.detail",
      }
    },
  ]).exec(function(err, data) {
    console.log(data);
    if (err) return console.error(err);
    res.send(data);
  });
});
module.exports = router;
