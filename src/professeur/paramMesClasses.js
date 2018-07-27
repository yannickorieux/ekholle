/*
**************************
      Script onglet parametrage  les classes coordo
 **************************
 */

let paramMesClasses = (function() {
  let self = {};
  let idProfesseur = $('body').data("idprofesseur")
  let dataListe = require('../dataListe/dataListe.js');



  /*
  ********************************************************************
        PRIVE
  ************************************************************
*/
  function initDataTablesMesClasses() {
    liste = []
    let table = $('#tableMesClasses').DataTable({
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
          data: 'classe'
        },
        {
          data: 'matiere'
        },
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return data.nom + ' ' + data.prenom;
          },
        },
      ]
    });


  };


  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */
  refreshTableMesClasses = function() {
    $.post("/professeur/tableMesClassesJSON/", {
      'idProfesseur': idProfesseur,
    }, (data) => {
      $('#tableMesClasses').DataTable().clear().draw();
      $('#tableMesClasses').DataTable().rows.add(data); // Add new data
      $('#tableMesClasses').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  }


  /*
  ********************************************************************
        PUBLIC
  ************************************************************
        */




  self.init = () => {
    initDataTablesMesClasses();
    refreshTableMesClasses();
  }

  return self;
})();

module.exports = paramMesClasses;
