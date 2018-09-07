
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


/*
**************************
PRIVE
**************************
*/

/*
**************************
Ajout ou modification du programme de colle
**************************
*/


function ajoutProgramme(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
    Structure.update({
      'matieres._id': req.body.idClasseMatiere
    }, {
      $push: {
        'matieres.$[el1].programme': {
          'debut': req.body.debut,
          'fin': req.body.fin,
          'titre': req.body.titre,
          'detail': req.body.detail,
        }
      }
    }, {
      arrayFilters: [{
          'el1._id': ObjectId(req.body.idClasseMatiere)
        },
      ]
    })
    .exec(function(err, result) {
      //on peut eventuellement renvoyer un message sur la reussite ou non
      res.end();
    });
}

function modifProgramme (req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
  Structure.update({
      'matieres._id': req.body.idClasseMatiere
    }, {
      $set: {
        'matieres.$[el1].programme.$[el2].debut': req.body.debut,
        'matieres.$[el1].programme.$[el2].fin': req.body.fin,
        'matieres.$[el1].programme.$[el2].titre': req.body.titre,
        'matieres.$[el1].programme.$[el2].detail': req.body.detail,
      }
    }, {
      arrayFilters: [{
          'el1._id': ObjectId(req.body.idClasseMatiere)
        },
        {
          'el2._id': ObjectId(req.body.idProgramme)
        }
      ]
    })
    .exec(function(err, result) {
      if (err) return console.error(err);
    });
  res.end();
}




module.exports = {

  /*
  **************************
  liste des matieres du coordo
  **************************
  */
  listeClassesMatieresCoordoJSON: function(req, res) {
    let Structure = require('../../models/structure')(req.session.etab);
    let matiere = req.session.etab + '_matieres';
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
            classe: "$nom",
            idClasseMatiere: "$matieres._id",
            matiere: "$matieres.matiere",
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
          $unwind: "$matiere"
        },
        {
          $project: {
            idClasse: '$_id',
            classe: 1,
            idClasseMatiere: 1,
            matiere: '$matiere.nom',
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
  ajoute une colle à un professeur en l'associant à une matiere/classe
  **************************
  */
  addColleur: function(req, res) {
    let Matiere = require('../../models/matiere')(req.session.etab);
    let Professeur = require('../../models/professeur')(req.session.etab);
    let Structure = require('../../models/structure')(req.session.etab);
    Structure.aggregate([
      {
        $unwind: "$matieres"
      },
      {
        $unwind: "$matieres.colleurs"
      },
      {
        $project: {
          idMatiere: "$matieres._id",
          idColleur: "$matieres.colleurs._id"
        }
      },
      {
        $match: {
          $and: [{
              idMatiere: ObjectId(req.body.idClasseMatiere)
            },
            {
              idColleur: ObjectId(req.body.idProfesseur)
            }
          ]
        }
      },
    ]).exec(function(err, data) {
      if (data.length > 0) {
        res.send({
          "error": "Cette association Colleur/Matière est déjà créée"
        });
      } else {
        Structure.update({
          "matieres._id": ObjectId(req.body.idClasseMatiere)
        }, {
          $push: {
            'matieres.$[element].colleurs': {
              _id: ObjectId(req.body.idProfesseur)
            }
          }
        }, {
          arrayFilters: [{
            'element._id': ObjectId(req.body.idClasseMatiere)
          }]
        }).exec(function(err, data) {
          res.send({
            "error": "ok"
          });
        });
      }
    });
  },


/*
**************************
table pour afficher la liste des colleurs du coordo
**************************
*/

tableMesClassesJSON : function(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
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
        idClasseMatiere : "$matieres._id",
        idColleur: "$matieres.colleurs._id",
        idMatiere: "$matieres.matiere",
        colles: "$matieres.colleurs.colles",
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
        idClasseMatiere : 1,
        idColleur : 1,
        totalColles: {
          $size: '$colles._id'
        },
      }
    },
  ]).exec(function(err, data) {
    if (err) return console.error(err);
    res.send(data);
  });
},


/*
**************************
liste des classes du coordonateur
**************************
*/
tableClassesCoordoJSON : function(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
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

},



/*
**************************
table pour afficher la liste des colles dans une matière donnee pour le coordo
**************************
*/
tableCollesCoordoJSON : function(req, res) {

  let Structure = require('../../models/structure')(req.session.etab);
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
table pour afficher les résultats et moyenne pour les classes du coordo
**************************
*/
tableResultatsCoordoJSON : function(req, res) {
  let debutPeriode=req.body.debutPeriode;
  let finPeriode=req.body.finPeriode;
  let Structure = require('../../models/structure')(req.session.etab);
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
        date: "$colleurs.colles.date",
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
      $match : {date: {
        $gte: new Date(debutPeriode),
        $lte: new Date(finPeriode)
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
},




/*
**************************
Ajout ou modification du programme de colle
**************************
*/


addOrModProgramme : function(req, res) {
  if (req.body.mode === 'ajouter') {
    ajoutProgramme(req, res);
  } else {
    modifProgramme(req, res);
  }
},

/*
**************************
Suppression d'un programme de colle
**************************
*/


suppProgramme : function(req, res) {

  let Structure = require('../../models/structure')(req.session.etab);

  Structure.update({
      'matieres._id': req.body.idClasseMatiere
    }, {
    $pull: {
      'matieres.$[].programme': {
        '_id': ObjectId(req.body.idProgramme)
      }
    }
  }, {
    'multi': true
  }).exec(function(err, result) {
    if (err) return console.error(err);
    res.end();
  });
},

/*
**************************
table pour afficher le programme du coordo
**************************
*/


tableProgrammeCoordoJSON : function(req, res) {
  let Structure = require('../../models/structure')(req.session.etab);
  Structure.aggregate([{
      $unwind: "$matieres"
    },
    {
      $match: {
        'matieres._id': ObjectId(req.body.idClasseMatiere)
      }
    },
    {
        $unwind: "$matieres.programme"
    },
    {
      $project: {
        idClasseMatiere: "$matieres._id",
        idProgramme: "$matieres.programme._id",
        debut: "$matieres.programme.debut",
        fin: "$matieres.programme.fin",
        titre: "$matieres.programme.titre",
        detail: "$matieres.programme.detail",
      }
    },
    {
      $sort: {
        debut: -1,
        fin: -1
      }
    }
  ]).exec(function(err, data) {
    if (err) return console.error(err);
    res.send(data);
  });
},

}
