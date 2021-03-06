let structure = (function() {

  let self = {};
  let dataListe = require('../misc/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */

   /*
     Validation du formulaire et enregistrement du niveau
   */
   $('#niveauForm').submit(function(e) {
     e.preventDefault();
     let idClasse = document.getElementById('niveauForm').getAttribute("data-idclasse");
     let niveau =  document.querySelector('#niveauForm input[name="niveau"]:checked').value;
     $.post("/admin/niveau/", {
       'idClasse': idClasse,
       'niveau': niveau,
     }, () => {
       refreshStructure();
     });
   });


  /*
  **************************
        Script pour afficher la sructure des classes
   **************************
   */
  function initDataTablesStructure() {
    let liste=[];
    let table = $('#tableStructure').DataTable({
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
          data: 'nom'
        },
        {
          data: 'niveau'
        },
        {
          data: 'totalEleves'
        },
        {
          data: 'taux'
        },
        {
          data: null,
          className: "center",
          defaultContent: '<a href="" class="editor_edit">Edit</a>'

        }
      ],
    });


    // Edit record
    $('#tableStructure').on('click', 'a.editor_edit', function(e) {
      e.preventDefault();
      let tr = $(this).closest('tr');
      let row = table.row(tr);
      let element = row.data();
      let idClasse = element.idClasse;
      let classe = element.nom;
      document.getElementById('niveauForm').setAttribute("data-idclasse", idClasse);
      $('#niveauClasse').modal();
    });
  };



  function refreshStructure() {
    $.get("/admin/tableStructureJSON/", (data) => {
      let table = $('#tableStructure').DataTable({
        retrieve: true
      })
      table.clear().draw();
      table.rows.add(data); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable

      $.get("/admin/tableClassesJSON/", (data) => {
        let el1 = document.querySelector('#dataListe1');
        dataListe.setDataListe(el1, data);
        let el4 = document.querySelector('#dataListe4')
        dataListe.setDataListe(el4, data);
        let el6 = document.querySelector('#dataListe6')
        dataListe.setDataListe(el6, data);
      });
    });
  };


  /*
     **************************
          Opérations diverses sur la base
      **************************
  */
  $("#nettoyer").click(function() {
    document.getElementById('confirmerMessage').setAttribute("data-param", "nettoyer");
    $('#message').empty();
    $('#message').append('Les élèves non affectés à une classe seront supprimés de la base');
  });

  $("#rafraichir").click(function() {
    document.getElementById('confirmerMessage').setAttribute("data-param", "rafraichir");
    $('#message').empty();
    $('#message').append('Recherche de nouvelles classes');
  });



  $("#actionConfirmee").click(function() {
    let action = document.getElementById('confirmerMessage').getAttribute("data-param");
    if(action==='nettoyer'){
      $.get("/admin/nettoyerBaseEleve/",  () => {
        refreshStructure()
      });
    };
    if(action==='rafraichir'){
      $.get("/users/rafraichirBaseStructure/",  () => {
        refreshStructure()
      });
    };
  });
  /*
  **************************
        PUBLIC
   **************************
   */



  self.init = function() {
    initDataTablesStructure();
    refreshStructure();
  }

  return self;
})();


module.exports = structure;
