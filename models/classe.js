var mongoose = require('mongoose');


let ClasseSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatiereClasse",
    required: true
  }]
});


module.exports = function(prefix) {

    return mongoose.model('Classe', ClasseSchema, prefix+'_classes');
};
