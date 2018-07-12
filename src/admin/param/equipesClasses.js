let equipesClasses = (function() {

  let self = {};
  let dataListe = require('../../dataListe/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */

  let el1=document.getElementById('dataListe1')
  dataListe.selectId(el1)
  let el2=document.getElementById('dataListe2')
  dataListe.selectId(el2)
  let el3=document.getElementById('dataListe3')
  dataListe.selectId(el3)




  document.getElementById("modalAddMatiere").addEventListener('click', function() {
    $('#addMatiereClasse').modal();
  });


  $('#dataListe1Select').on('change', function() {
    let classe = dataListe.getName(el1)
    let id = dataListe.getId(el1)
    if (classe !== '') {
      $('#showTableEquipeClasse').css("display", "block");
      afficheClasse(classe);
    } else {
      $('#showTableEquipeClasse').css("display", "none");
    }
  });


  $('#addMatiereForm').submit(function(e) {
    e.preventDefault();
    let classe =  dataListe.getName(el1);
    let idClasse = dataListe.getId(el1);
    let idMatiere = dataListe.getId(el2);
    let idProfesseur = dataListe.getId(el3);
    let duree = document.getElementById('duree').value;
    $.post("/admin/addMatiereClasseJSON/", {
      'idClasse': idClasse,
      'idMatiere': idMatiere,
      'idProfesseur': idProfesseur,
      'duree': duree,
    }, (message) => {

      if (message.error !== "ok") {
        $('#error').html(message.error);
        $('#erreur').modal();
      } else {
        document.getElementById('addMatiereForm').reset();
        $('#addMatiereClasse').modal('hide');
        afficheClasse(classe);
      }
    });
  });


  /*
  **************************
        Script pour afficher une classe
   **************************
   */
  afficheClasse = function(classe) {
    $.post("/admin/tableEquipeClasseJSON/", {
      'classe': classe
    }, (data) => {
      let liste = data;
      if (typeof liste === 'undefined') {
        liste = []
      };

      let table = $('#tableEquipeClasse').DataTable({
        retrieve: true,
        data: liste,
        // dom : '<"top"Bif>rt<"bottom"lp><"clear">',
        language: {
          processing: "Traitement en cours...",
          search: "Rechercher&nbsp;:",
          lengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
          info: "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
          infoEmpty: "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
          infoFiltered: "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
          infoPostFix: "",
          loadingRecords: "Chargement en cours...",
          zeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
          emptyTable: "Aucune donnée disponible dans le tableau",
          paginate: {
            first: "Premier",
            previous: "Pr&eacute;c&eacute;dent",
            next: "Suivant",
            last: "Dernier"
          },
          aria: {
            sortAscending: ": activer pour trier la colonne par ordre croissant",
            sortDescending: ": activer pour trier la colonne par ordre décroissant"
          }
        },

        columns: [{
            data: 'matiere'
          },
          {
            data: 'professeur'
          },
          {
            data: 'duree'
          },
        ],
      });

      table.clear().draw();
      table.rows.add(liste); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable
    });
  };


  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {

  }

  return self;
})();


module.exports = equipesClasses;
