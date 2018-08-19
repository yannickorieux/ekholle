let imports = (function() {

  let self = {};

  /*
  **************************
        PRIVATE
   **************************
   */

  $('#uploadElevesForm').submit(function(e) {

    e.preventDefault();

    let formdata = new FormData();
    formdata.append('file', $('#csvdata').get(0).files[0]);
    $.ajax({
      url: "/users/csvEleves",
      cache: false,
      contentType: false,
      processData: false,
      data: formdata,
      type: 'post',
      success: function(data) {

        $('#showTableImportEleves').css("display", "block");
        refreshImportEleves(data);

      }
    });

  });



  function initDataTablesImportEleves() {
    liste = [];
    let table = $('#tableImportEleves').DataTable({
      retrieve: true,
      data: liste,
      dom: '<"top"Bif>rt<"bottom"lp><"clear">',
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
      buttons: [{
        text: "Valider l'import",
        action: function(e, dt, node, config) {
          let d = dt.buttons.exportData(
            $.extend({
              decodeEntities: false
            }, config.exportOptions) // XSS protection
          );

          let dataAdd = [];
          let dataMod = [];
          for (let i = 0, ien = d.body.length; i < ien; i++) {
            console.log( d.body[i]);
            let row = {
              'ine': d.body[i][0],
              'nom': d.body[i][1],
              'prenom': d.body[i][2],
              'classe': d.body[i][3],
              'login': d.body[i][4],
              'password': d.body[i][5],

            }
            if (d.body[i][6] === false) {
              dataAdd.push(row);
            } else {
              dataMod.push(row);
            }
          }
          let data = {
            'dataAdd': JSON.stringify(dataAdd),
            'dataMod': JSON.stringify(dataMod)
          }
          $.ajax({
            url: "/users/importEleves",
            data: data,
            type: 'post',
            success: function(data) {
              console.log('succes');
              $('#showTableImportEleves').css("display", "none");
            }
          });
        }
      }],
      columns: [{
          data: 'ine'
        },
        {
          data: 'nom'
        },
        {
          data: 'prenom'
        },
        {
          data: 'classe'
        },
        {
          data: 'login'
        },
        {
          data: 'password'
        },
        {
          data: 'present'
        },
      ],
    });

  };


  /*
     **************************
          Script pour afficher une classe
      **************************
      */
  refreshImportEleves = function(data) {
    $('#tableImportEleves').DataTable().clear().draw();
    $('#tableImportEleves').DataTable().rows.add(data); // Add new data
    $('#tableImportEleves').DataTable().columns.adjust().draw(); // Redraw the DataTable
  };







  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    initDataTablesImportEleves()
  }

  return self;

})();


module.exports = imports;
