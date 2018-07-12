var mongoose = require('mongoose');


let ColleurMatiereSchema = new mongoose.Schema({
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatiereClasse",
    required: true
  },
  professeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professeur",
    required: true
  },
});



module.exports = function(prefix) {
    return mongoose.model('ColleurMatiere', ColleurMatiereSchema, prefix + '_colleurmatieres');
};
