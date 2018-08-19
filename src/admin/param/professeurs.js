let professeurs = (function() {

  let self = {};
  let dataListe = require('../../dataListe/dataListe.js');
  let loginPassword = require('../../loginPassword.js');
  /*
  **************************
        PRIVATE
   **************************
   */


  /*
  **************************
        gestion du formulaire pour ajout d'un professeur
   **************************
   */
  $('#ajouterProfesseurForm').submit(function(e) {
    e.preventDefault();
    let nom = document.querySelector('#ajouterProfesseurForm input[name="nom"]').value.toLowerCase();
    let prenom = document.querySelector('#ajouterProfesseurForm input[name="prenom"]').value.toLowerCase();
    let grade = document.querySelector('#ajouterProfesseurForm input[name="grade"]').value.toLowerCase();
    let login = loginPassword.createLogin(prenom, nom)
    $.post("/users/creerProfesseur", {
      "nom": nom,
      "prenom": prenom,
      "login": login
    }, (data) => {
      let login = data.login;
      let password = data.password;
      if (data.message !== '') {
        $('#error').html(data.message);
        $('#erreur').modal();
      }
      document.querySelector('#validerProfesseurForm input[name="login"]').value = login;
      document.querySelector('#validerProfesseurForm input[name="password"]').value = password;
      $('#validerProfesseurForm').css("display", "block");
    });
  });


  $('#validerProfesseurForm').submit(function(e) {
    e.preventDefault();
    let nom = document.querySelector('#ajouterProfesseurForm input[name="nom"]').value.toLowerCase();
    let prenom = document.querySelector('#ajouterProfesseurForm input[name="prenom"]').value.toLowerCase();
    let grade = document.querySelector('#ajouterProfesseurForm input[name="grade"]').value.toLowerCase();
    let login = document.querySelector('#validerProfesseurForm input[name="login"]').value;
    let password = document.querySelector('#validerProfesseurForm input[name="password"]').value;
    $.post("/users/validerProfesseur", {
      "nom": nom,
      "prenom": prenom,
      "login": login,
      "password": password,
      "grade": grade,
    }, () => {
      console.log('ok');
      $('#validerProfesseurForm')[0].reset();
      $('#ajouterProfesseurForm')[0].reset();
      refreshProfesseurs();
    });
  });
  /*
  **************************
        affichage de la table
   **************************
   */

   function formatColles(d) {
     // `d` is the original data object for the row
     let table = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
     for(i=0;i<d.colles.length;i++){
       table+=
         '<tr>' +
         '<td>colles:</td>' +
         '<td>' + d.colles[i].classe + '-' + d.colles[i].matiere + '</td>' +
         '</tr>' ;
     }

       table+='</table>';
       return table;
   };

   
  function initDataTablesProfesseurs() {
    liste = [];
    let table = $('#tableProfesseurs').DataTable({
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
          data: null,
          render: function(data, type, row) {
            if (data.changePwd === true) {
              return '....';
            } else {
              return data.password;
            }
          }
        },
        {
          data: 'grade'
        },
        {
          data: 'email'
        },
        {
          "className": 'details-control',
          "orderable": false,
          "data": null,
          "defaultContent": ''
        },
        {
          data: null,
          className: "center",
          defaultContent: '<a href="" class="editor_edit">Edit</a>'
        }
      ],
      order: [
        [0, "asc"]
      ],
    });

    // Edit record
    $('#tableProfesseurs').on('click', 'a.editor_edit', function(e) {
      e.preventDefault();
      console.log($(this).closest('tr'));
      $('#modifierProfesseur').modal();
    });

    $('#tableProfesseurs tbody').on('click', 'td.details-control', function() {
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(formatColles(row.data())).show();
        tr.addClass('shown');
      }
    });

  };

  /*
     **************************
           Script pour afficher la table professeurs
      **************************
      */
  refreshProfesseurs = function() {
    $.get("/admin/tableProfesseursJSON/", (data) => {

      //on met à jour les datalistes correspondantes
      let el3 = document.getElementById('dataListe3')
      dataListe.setDataListe(el3, data);

      $('#tableProfesseurs').DataTable().clear().draw();
      $('#tableProfesseurs').DataTable().rows.add(data); // Add new data
      $('#tableProfesseurs').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  };


  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    initDataTablesProfesseurs();
    refreshProfesseurs();
  }

  return self;
})();


module.exports = professeurs;
