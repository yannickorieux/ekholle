let professeurs = (function() {

  let self = {};
  let dataListe = require('../../misc/dataListe.js');
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
    let grade = document.querySelector('#ajouterProfesseurForm input[name="grade"]').value;
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
        modifier un professeur
   **************************
   */


  $('#modifierProfesseurForm').submit(function(e) {
    e.preventDefault();
        let idProfesseur = document.getElementById('modifierProfesseurForm').getAttribute("data-idprofesseur");
        let grade = document.querySelector('#modifierProfesseurForm input[name="grade"]').value;
        let email = document.querySelector('#modifierProfesseurForm input[name="email"]').value;
        $.post("/users/modifierProfesseur", {
          "grade": grade,
          "email": email,
          "idProfesseur" : idProfesseur,
        }, () => {
          $('#modifierProfesseurForm')[0].reset();
          $('#modifierProfesseur').modal('hide');
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
     for(let i=0;i<d.colles.length;i++){
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
    let liste = [];
    let table = $('#tableProfesseurs').DataTable({
      data: liste,
      dom: 'Bfrtip',
      lengthMenu: [
            [ 10, 25, 50, -1 ],
            [ '10 rows', '25 rows', '50 rows', 'Show all' ]
        ],
      buttons: [
        'csv', 'excel', 'pdf' , 'pageLength'
      ],
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
            return data.nom + ' ' + data.prenom;
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
          defaultContent: "<button class='btn btn-primary editor_edit' data-toggle='tooltip' title='Editer les données professeurs.'><i class='fa fa-pen' style='font-size:10px'></i></button> / <button class='btn btn-primary genereCode' data-toggle='tooltip' title='Générer un nouveau code d activation.'><i class='fa fa-key' style='font-size:10px'></i></button>"
        }
      ],
      order: [
        [0, "asc"]
      ],
    });

    // Edit record
    $('#tableProfesseurs').on('click', '.editor_edit', function(e) {
      e.preventDefault();
      let tr = $(this).closest('tr');
      let row = table.row(tr);
      let element = row.data();
      let nom = element.nom;
      let prenom = element.prenom;
      let grade = element.grade;
      let email = element.email;
      $('#modifierProfesseurForm input[name="nom"]').val(nom);
      $('#modifierProfesseurForm input[name="prenom"]').val(prenom);
      $('#modifierProfesseurForm input[name="grade"]').val(grade);
      $('#modifierProfesseurForm input[name="email"]').val(email);
      document.getElementById('modifierProfesseurForm').setAttribute("data-idprofesseur", element._id);
      $('#modifierProfesseur').modal();
    });

    $('#tableProfesseurs').on('click', '.genereCode', function(e) {
      let data = table.row($(this).parents('tr')).data();
      $.post("/users/genererNewCodeProfesseur", {
        "login": data.login,
      }, () => {
        refreshProfesseurs();
      });
    });





    $('#tableProfesseurs tbody').on('click', 'td.details-control', function() {
      let tr = $(this).closest('tr');
      let row = table.row(tr);
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
  function refreshProfesseurs() {
    $.get("/admin/tableProfesseursJSON/", (data) => {
      //on met à jour les datalistes correspondantes
      let el3 = document.getElementById('dataListe3')
      dataListe.setDataListe(el3, data);
      let table=$('#tableProfesseurs').DataTable({retrieve: true,})
      table.clear().draw();
      table.rows.add(data); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable
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
