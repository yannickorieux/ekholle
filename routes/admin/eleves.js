const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


module.exports = {
  nettoyerBaseEleve: function(req, res) {
    let Eleve = require('../../models/eleve')(req.session.etab);
    Eleve.remove({
        'classe': null
      })
      .exec(function(err, results) {
        console.log(results);
        res.end();
      });
  },
}
