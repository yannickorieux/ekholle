var mongoose = require('mongoose');


let ColleSchema = new mongoose.Schema({
  eleve: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Eleve",
    required: true
  },
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ColleurMatiere",
    required: true
  },
  classe : {
    type: String,
    required: true
  },
  professeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professeur",
    required: true
  },
  note: {
    type: Number,
  },
  sujet: {
    type: String,
  },
  date: {
    type: String,
  },
  duree: {
    type: Number,
  }
},{ collection: 'colles' });


module.exports = function(prefix) {
    return mongoose.model('Colle', ColleSchema, prefix+'_colles');
};
