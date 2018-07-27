var mongoose = require('mongoose');


let StructureSchema = new mongoose.Schema({
  nom: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  niveau: {
    type: Number
  },

  matieres: [{
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
      default: 20
    },
    option: [] , //liste des eleves (num INE ) ne suivant pas l'option
    colleurs: [{
      professeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Professeur",
        required: true
      },
      colles: [{
        eleve: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Eleve",
          required: true
        },
        note: {
          type: String,
        },
        sujet: {
          type: String,
        },
        date: {
          type: String,
        },
        duree: {
          type: Number,
        },
        obsEleve: {
          type: String,
        },
        obsCoordo: {
          type: String,
        },
      }]
    }]
  }]
});


module.exports = function(prefix) {

  return mongoose.model('Structure', StructureSchema, prefix + '_structures');
};
