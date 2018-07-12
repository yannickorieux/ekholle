var mongoose = require('mongoose');


let MatiereClasseSchema = new mongoose.Schema({
  classe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classe",
    required: true
  },
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Matiere",
    required: true
  },
  professeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professeur",
    required: true
  },
  duree: {
    type: Number,
    default : 20
  },
  option :[] //liste des eleves (num INE ) ne suivant pas l'option
});



module.exports = function(prefix) {
    return mongoose.model('MatiereClasse', MatiereClasseSchema , prefix + '_matiereclasses');
};
