/*
**************************
      En lien avec partialsAdmin/eleve.ejs
 **************************
 */


let eleves = (function() {

  let self = {};
  let dataListe = require('../../dataListe/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */
  let el = document.getElementById('dataListe4')
  dataListe.selectId(el)

  $('#dataListe4Select').on('change', function() {
    let classe = dataListe.getName(el)
    let id = dataListe.getId(el)
    if (classe !== '') {
      $('#showTableEleves').css("display", "block");
      refreshEleves(classe);
    } else {
      $('#showTableEleves').css("display", "none");
    }
  });




  function initDataTablesEleves() {
    liste = [];
    let table = $('#tableEleves').DataTable({
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
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return data.prenom + ' ' + data.nom;
          },
        },
        {
          data: 'login'
        },
        {
          data: 'password'
        },
      ],
    });

    // Edit record
    $('#tableEleves').on('click', 'a.editor_edit', function(e) {
      e.preventDefault();
      console.log($(this).closest('tr'));
      //$('#modifierEleve').modal();
    });

  };


  /*
     **************************
          Script pour afficher une classe
      **************************
      */
  refreshEleves = function(classe) {
    $.post("/admin/tableElevesClasseJSON/", {
      'classe': classe
    }, (data) => {

      $('#tableEleves').DataTable().clear().draw();
      $('#tableEleves').DataTable().rows.add(data); // Add new data
      $('#tableEleves').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  };


  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    initDataTablesEleves();
  }

  return self;
})();


module.exports = eleves;