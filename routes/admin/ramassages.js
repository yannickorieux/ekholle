
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment')

module.exports={
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
defAnnee : function(req, res) {
  let Admin = require('../../models/admin')(req.session.etab)
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
    if (err) return console.error(err);
    res.json();
  });
},



/*
**************************
     renvoie l'année et les périodes
 **************************
 */
getAnnee : function(req, res) {
  let Admin = require('../../models/admin')(req.session.etab)
  Admin.findOne({
    _id: req._id
  }).exec(function(err, data) {
    if (err) return console.error(err);
    console.log(data);
    res.json(data);
  });
},



/*
**************************
     sauvegarde ou modifie une période
 **************************
 */
sauvePeriode : function(req, res) {
  let Admin = require('../../models/admin')(req.session.etab)
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
},


/*
**************************
     Supprime une période
 **************************
 */
suppPeriode : function(req, res) {
  let Admin = require('../../models/admin')(req.session.etab)
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
},


/*
**************************
     Bilan
 **************************
 */
decompteHeuresJSON :  function(req, res) {
  let Admin = require('../../models/admin')(req.session.etab)
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
      let Structure = require('../../models/structure')(req.session.etab);
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
        if (err) return console.error(err);
        res.json(data);
      });
    });
},



}
