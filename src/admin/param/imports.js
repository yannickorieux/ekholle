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
    formdata.append('profil','eleve');
    $.ajax({
      url: "/users/csvData",
      cache: false,
      contentType: false,
      processData: false,
      data: formdata,
      type: 'post',
      success: function(data) {
        $('#showTableImportEleves').css("display", "block");
        refreshImport(data,'Eleves');

      }
    });
  });


    $('#uploadProfesseursForm').submit(function(e) {

      e.preventDefault();

      let formdata = new FormData();
      formdata.append('file', $('#csvdataProf').get(0).files[0]);
      formdata.append('profil','professeur');
      $.ajax({
        url: "/users/csvData",
        cache: false,
        contentType: false,
        processData: false,
        data: formdata,
        type: 'post',
        success: function(data) {
          $('#showTableImportProfesseurs').css("display", "block");
          refreshImport(data,'Professeurs');

        }
      });
    });


    $('#uploadMatieresForm').submit(function(e) {

      e.preventDefault();

      let formdata = new FormData();
      formdata.append('file', $('#csvdataMat').get(0).files[0]);
      formdata.append('profil','matiere');
      $.ajax({
        url: "/users/csvData",
        cache: false,
        contentType: false,
        processData: false,
        data: formdata,
        type: 'post',
        success: function(data) {
          $('#showTableImportMatieres').css("display", "block");
          refreshImport(data,'Matieres');

        }
      });
    });



  function initDataTablesImportEleves() {
    $.fn.dataTable.ext.errMode = 'none';
    let liste = [];
    let table = $('#tableImportEleves').DataTable({
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
            let row = {
              'ine': d.body[i][0],
              'nom': d.body[i][1],
              'prenom': d.body[i][2],
              'classe': d.body[i][3],
              'login': d.body[i][4],
              'password': d.body[i][5],

            }
            if (d.body[i][6] === 'Oui') {
              dataAdd.push(row);
            } else {
              dataMod.push(row);
            }
          }
          let data = {
            'dataAdd': JSON.stringify(dataAdd),
            'dataMod': JSON.stringify(dataMod),
            'importAnnuel': document.getElementById("importAnnuel").checked
          }
          $.ajax({
            url: "/users/importEleves",
            data: data,
            type: 'post',
            success: function(data) {
              $('#error').html(data);
              $('#erreur').modal();
              $.get("/users/rafraichirBaseStructure/",  () => {
              });  //on rafraichit la structure
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
          data: null,
          render: function(data, type, row) {
            if (data.present === true) return 'Non'
            else return 'Oui'
          },
        },
      ],
      });
  };




  function initDataTablesImportProfesseurs() {
    $.fn.dataTable.ext.errMode = 'none';
    let liste = [];
    let table = $('#tableImportProfesseurs').DataTable({
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
          for (let i = 0, ien = d.body.length; i < ien; i++) {
            let row = {

              'nom': d.body[i][0],
              'prenom': d.body[i][1].toLowerCase(),
              'grade': d.body[i][2],
              'email': d.body[i][3],
              'login': d.body[i][4],
              'password': d.body[i][5],
              'changePwd': false,
            }
            if (d.body[i][6] === 'Oui') {
              dataAdd.push(row);
            }
          }
          let data = {
            'dataAdd': JSON.stringify(dataAdd),
          }
          $.ajax({
            url: "/users/importProfesseurs",
            data: data,
            type: 'post',
            success: function(data) {
              $('#showTableImportProfesseurs').css("display", "none");
            }
          });
        }
      }],
      columns: [
        {
          data: 'nom'
        },
        {
          data: 'prenom'
        },
        {
          data: 'grade'
        },
        {
          data: 'email'
        },
        {
          data: 'login'
        },
        {
          data: 'password'
        },
        {
          data: null,
          render: function(data, type, row) {
            if (data.present === true) return 'Non'
            else return 'Oui'
          },
        },
      ],
      });
  };


  function initDataTablesImportMatieres() {
    $.fn.dataTable.ext.errMode = 'none';
    let liste = [];
    let table = $('#tableImportMatieres').DataTable({
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
            let row = {
              'nom': d.body[i][0],
              'generique': d.body[i][1],
            }
            if (d.body[i][2] === 'Oui') {
              dataAdd.push(row);
            } else {
              dataMod.push(row);
            }
          }
          let data = {
            'dataAdd': JSON.stringify(dataAdd),
            'dataMod': JSON.stringify(dataMod),
          }
          $.ajax({
            url: "/users/importMatieres",
            data: data,
            type: 'post',
            success: function(data) {
              $('#showTableImportMatieres').css("display", "none");
            }
          });
        }
      }],
      columns: [{
          data: 'nom'
        },
        {
          data: 'generique'
        },
        {
          data: null,
          render: function(data, type, row) {
            if (data.present === true) return 'Non'
            else return 'Oui'
          },
        },
      ],
      });
  };




  /*
     **************************
          Script pour afficher les tables eleves et professeurs
      **************************
      */


  function refreshImport(data, profil) {
    let table =$('#tableImport'+profil).DataTable({  retrieve: true})
    table.clear().draw();
    table.rows.add(data); // Add new data
    table.columns.adjust().draw(); // Redraw the DataTable
  };



  $('#tableImportEleves').on('error.dt', function(e, settings, techNote, message) {
     console.log( 'An error has been reported by DataTables: ', message);
     $('#error').html("Votre fichier de donées semble incorrect, vous ne pouvez pas poursuivre l'import ");
     $('#erreur').modal();
  })

  $('#tableImportProfesseurs').on('error.dt', function(e, settings, techNote, message) {
     console.log( 'An error has been reported by DataTables: ', message);
      $('#error').html("Votre fichier de donées semble incorrect, vous ne pouvez pas poursuivre l'import ");
  })

  $('#tableImportMatieres').on('error.dt', function(e, settings, techNote, message) {
     console.log( 'An error has been reported by DataTables: ', message);
      $('#error').html("Votre fichier de donées semble incorrect, vous ne pouvez pas poursuivre l'import ");
  })




  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    initDataTablesImportEleves()
    initDataTablesImportProfesseurs()
    initDataTablesImportMatieres()
  }
  return self;
})();


module.exports = imports;
