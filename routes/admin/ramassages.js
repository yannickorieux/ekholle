const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment')

module.exports = {
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
  defAnnee: function(req, res) {
    console.log(req.body.debutAnnee);
    let deb= moment(req.body.debutAnnee, 'DD/MM/YYYY').format()
    let fin= moment(req.body.finAnnee, 'DD/MM/YYYY').format()
    deb = moment(deb).add(4, 'hours').format()
    fin = moment(fin).add(4, 'hours').format()
    let Admin = require('../../models/admin')(req.session.etab)
    Admin.findOneAndUpdate({
      _id: req._id
    }, {
      $set: {
        'annee': {
          'debut': new Date(deb),
          'fin': new Date(fin)
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
  getAnnee: function(req, res) {
    let Admin = require('../../models/admin')(req.session.etab)
    Admin.findOne({
      _id: req._id
    }).exec(function(err, data) {
      if (err) return console.error(err);
      res.json(data);
    });
  },



  /*
  **************************
       sauvegarde ou modifie une période
   **************************
   */
  sauvePeriode: function(req, res) {
    console.log(req.body.debutPeriode);
    console.log(req.body.finPeriode);
    deb = moment(req.body.debutPeriode).add(4, 'hours').format()
    fin = moment(req.body.finPeriode).add(4, 'hours').format()
    let Admin = require('../../models/admin')(req.session.etab)
    if (req.body.id === '') {
      //on ajoute une periode
      Admin.update({
        _id: req._id
      }, {
        $addToSet: {
          'periodes': {
            debutPeriode: new Date(deb),
            finPeriode: new Date(fin),
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
          'periodes.$[el].debutPeriode': new Date(deb),
          'periodes.$[el].finPeriode': new Date(fin),
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
  suppPeriode: function(req, res) {
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
        if (req.body.idNext !== '') {
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
        } else {
          res.send(err);
        }
      });
  },


  /*
  **************************
       Bilan
   **************************
   */
  decompteHeuresJSON: function(req, res) {
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
        let professeur = req.session.etab + '_professeurs';
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
              niveau: 1,
              totalEleves: 1,
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
              },
              taux: {
                $switch: {
                  branches: [{
                      case: {
                        $and: [{
                          $gt: ["$totalEleves", 35]
                        }, {
                          $eq: ["$niveau", 1]
                        }]
                      },
                      then: 1,
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
                      then: 2,
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
                      then: 3,
                    },
                    {
                      case: {
                        $and: [{
                          $lt: ["$totalEleves", 20]
                        }, {
                          $eq: ["$niveau", 2]
                        }]
                      },
                      then: 4,
                    },
                    {
                      case: {
                        $and: [{
                          $lt: ["$totalEleves", 20]
                        }, {
                          $eq: ["$niveau", 1]
                        }]
                      },
                      then: 5,
                    },
                    {
                      case: {
                        $and: [{
                          $gt: ["$totalEleves", 35]
                        }, {
                          $eq: ["$niveau", 2]
                        }]
                      },
                      then: 6,
                    },
                  ],
                  default: "Niveau non renseigné"
                }
              },
            },
          },
          {
            $match: {
              dateSaisie: {
                $gte: debutPeriode,
                $lte: finPeriode  //modification septembre 2019
              }
            }
          },
          {
            $group: {
              _id: {
                professeur: '$professeur',
                taux: '$taux',
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
                  taux: '$_id.taux',
                  count: '$count',
                  heures: '$heures',
                }
              },
              count: {
                $sum: '$count'
              },
            }
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
              bilan: 1,
              count: 1,
            }
          },
        ]).exec(function(err, data) {
          if (err) return console.error(err);
          res.json(data);
        });
      });
  },



}
