/*
**************************
      En lien avec partialsAdmin/eleve.ejs
 **************************
 */


let eleves = (function() {

  let self = {};
  let dataListe = require('../../misc/dataListe.js');
  let loginPassword = require('../../loginPassword.js');

  let el4 = document.getElementById('dataListe4');
  dataListe.selectId(el4);

  let el6 = document.getElementById('dataListe6');
  dataListe.selectId(el6);
  /*
  **************************
        PRIVATE
   **************************
   */

   /*
   **************************
         dataliste choix classe
    **************************
    */


  $('#dataListe4Form').submit(function(e) {
    e.preventDefault();
    let el4 = document.getElementById('dataListe4');
    let classe = dataListe.getName(el4)
    let id = dataListe.getId(el4)
    if (classe !== '') {
      $('#showTableEleves').css("display", "block");
      refreshEleves(classe);
    } else {
      $('#showTableEleves').css("display", "none");
    }
  });



  /*
  **************************
        gestion du formulaire pour ajout d'un eleve
   **************************
   */
  $('#ajouterEleveForm').submit(function(e) {
    e.preventDefault();
    let el6 = document.getElementById('dataListe6');
    let classe = dataListe.getName(el6)
    let nom = document.querySelector('#ajouterEleveForm input[name="nom"]').value.toLowerCase();
    let prenom = document.querySelector('#ajouterEleveForm input[name="prenom"]').value.toLowerCase();
    let ine = document.querySelector('#ajouterEleveForm input[name="ine"]').value.toUpperCase();
    let login = loginPassword.createLogin(prenom, nom)
    $.post("/users/creerEleve", {
      "classe" : classe,
      "ine": ine,
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
      else{
        document.querySelector('#validerEleveForm input[name="login"]').value = login;
        document.querySelector('#validerEleveForm input[name="password"]').value = password;
        dataListe.readOnly(el6, true);
        document.querySelector('#ajouterEleveForm input[name="nom"]').readOnly=true;
        document.querySelector('#ajouterEleveForm input[name="prenom"]').readOnly=true;
        document.querySelector('#ajouterEleveForm input[name="ine"]').readOnly=true;
        $('#validerEleveForm').css("display", "block");
      }
    });
  });


  $('#validerEleveForm').submit(function(e) {
    e.preventDefault();
    let nom = document.querySelector('#ajouterEleveForm input[name="nom"]').value.toLowerCase();
    let prenom = document.querySelector('#ajouterEleveForm input[name="prenom"]').value.toLowerCase();
    let ine = document.querySelector('#ajouterEleveForm input[name="ine"]').value.toUpperCase();
    let login = document.querySelector('#validerEleveForm input[name="login"]').value;
    let password = document.querySelector('#validerEleveForm input[name="password"]').value;
    let el6 = document.getElementById('dataListe6');
    let classe = dataListe.getName(el6)
    $.post("/users/validerEleve", {
      "nom": nom,
      "prenom": prenom,
      "login": login,
      "password": password,
      "ine": ine,
      "classe": classe,
    }, () => {
      console.log('ok');
      $('#validerEleveForm')[0].reset();
      $('#ajouterEleveForm')[0].reset();
      dataListe.readOnly(el6, false);
      document.querySelector('#ajouterEleveForm input[name="nom"]').readOnly=false;
      document.querySelector('#ajouterEleveForm input[name="prenom"]').readOnly=false;
      document.querySelector('#ajouterEleveForm input[name="ine"]').readOnly=false;
      $('#validerEleveForm').css("display", "none");
      refreshEleves();
    });
  });



  function initDataTablesEleves() {
    let liste = [];
    let table = $('#tableEleves').DataTable({
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

      columns: [
        {
          data: 'ine'
        },
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return  data.nom + ' ' + data.prenom ;
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
        {data: null,
        },
      ],
      columnDefs: [{
        targets: [-1],
        render: function(a, b, data, d) {
          return "<button class='btn btn-primary genereCode' data-toggle='tooltip' title='Générer un nouveau code d activation.'><i class='fa fa-key' style='font-size:10px'></i></button>";
        }
      }],
      order: [
        [1, "asc"]
      ],
    });

    // Edit record
    $('#tableEleves').on('click', 'a.editor_edit', function(e) {
      e.preventDefault();
      console.log($(this).closest('tr'));
      //$('#modifierEleve').modal();
    });


    $('#tableEleves').on('click', '.genereCode', function(e) {
      let data = table.row($(this).parents('tr')).data();
      $.post("/users/genererNewCodeEleve", {
        "login": data.login,
        "classe": data.classe,
      }, () => {
        let el4 = document.getElementById('dataListe4');
        let classe = dataListe.getName(el4)
        refreshEleves(classe);
      });
    });

  };


  /*
     **************************
          Script pour afficher une classe
      **************************
      */
  function refreshEleves(classe) {
    $.post("/admin/tableElevesClasseJSON/", {
      'classe': classe
    }, (data) => {
      let table=$('#tableEleves').DataTable({retrieve: true,})
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
    initDataTablesEleves();
  }

  return self;
})();


module.exports = eleves;
