var mongoose = require('mongoose');

let MatiereSchema = new mongoose.Schema({
    nom : {
      type: String,
      trim: true
    },
    generique : {
      type: String,
      trim: true
    }
});


module.exports = function(prefix) {
    return mongoose.model('Matiere', MatiereSchema, prefix+'_matieres');
};
