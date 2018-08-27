var mongoose = require('mongoose');

let EtablissementSchema = new mongoose.Schema({
  num: {
    type: String,
    trim: true
  },
  nom: {
    type: String,
    trim: true
  },
  prefix: {
    type: String,
    trim: true
  }
});


var Etablissement = mongoose.model('Etablissement', EtablissementSchema);
module.exports = Etablissement;
