const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


module.exports={

  tableProfesseursJSON:  function(req, res) {
    let Professeur = require('../../models/professeur')(req.session.etab);
    Professeur.aggregate([{
        $project: {
          nom: 1,
          prenom: 1,
          grade: 1,
          login: 1,
          password: 1,
          changePwd: 1,
          email: 1,
          colles: []
        }
      }, ])
      .exec(function(err, data) {
        let listeProfesseurs = data;
        if (err) return console.error(err);
        let Structure = require('../../models/structure')(req.session.etab);
        let matieres = req.session.etab + '_matieres'
        Structure.aggregate([{
              $unwind: "$matieres"
            },
            {
              $unwind: "$matieres.colleurs"
            },
            {
              $lookup: {
                from: matieres,
                localField: "matieres.matiere",
                foreignField: "_id",
                as: "matiere"
              }
            },
            {
              $unwind: "$matiere"
            },
            {
              $project: {
                classe: "$nom",
                matiere: "$matiere.nom",
                colleur: "$matieres.colleurs._id",
              }
            },
          ])
          .exec(function(err, data) {
            if (err) return console.error(err);
            listeProfesseurs.forEach(function(elem) {
              let obj = data.filter(e => e.colleur == String(elem._id));
              if (typeof obj != 'undefined') {
                obj.forEach(function(o) {
                  elem.colles.push({
                    'classe': o.classe,
                    'matiere': o.matiere,
                  });
                });
              }
            });
            res.json(listeProfesseurs);
          });
      });
  },

}
