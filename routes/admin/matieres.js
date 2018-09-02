const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;



function ajoutMatiere(req, res){
  let Matiere = require('../../models/matiere')(req.session.etab)
  let matiere = new Matiere({
    'generique': req.body.generique,
    'nom': req.body.nom,
  });
  matiere.save(function(err) {
    if (err) console.log(error);
  });
  return res.end();
};

function modifMatiere(req, res){
  let Matiere = require('../../models/matiere')(req.session.etab)
  Matiere.findOneAndUpdate({
    _id: req.body.idMatiere
  }, {
    $set: {
      'nom': req.body.nom,
      'generique' : req.body.generique,

    }
  }).exec(function(err, structure) {
    console.log(structure);
    if (err) return console.error(err);
    res.end();
  });
};

module.exports = {



  addOrModMatiere: function(req, res) {
    if (req.body.mode === 'ajouter') {
      ajoutMatiere(req, res);
    } else {
      modifMatiere(req, res);
    }
  },


  /*
  **************************
        Script pour afficher la table des matieres
   **************************
   */
  tableMatieresJSON: function(req, res) {
    let Matiere = require('../../models/matiere')(req.session.etab)
    Matiere.find(function(err, matieres) {
      if (err) return console.error(err);
      res.json(matieres);
    });
  },
}
