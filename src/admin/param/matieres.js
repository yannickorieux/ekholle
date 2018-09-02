let matieres = (function() {

  let self = {};
  let dataListe = require('../../misc/dataListe.js');

  /*
  **************************
        PRIVATE
   **************************
   */

   function showAddMatiereForm(){
     $('#addOrModMatiere').modal('show');
   }

   const buttonAddMatiere = document.getElementById("buttonAddMatiere");
   buttonAddMatiere.addEventListener('click', showAddMatiereForm, false);

  /*
  ********************************************************************
  validation ajout ou modification matiere
  ************************************************************
    */
  $('#addOrModMatiereForm').submit(function(e) {
    e.preventDefault();
    let nom = $('#addOrModMatiereForm input[name="nom"]').val();
    let generique = $('#addOrModMatiereForm input[name="generique"]').val();
    let mode = document.getElementById('addOrModMatiereForm').getAttribute("data-mode");
    let idMatiere = '';
    if (mode === 'modifier') {
      idMatiere = document.getElementById('addOrModMatiereForm').getAttribute("data-idmatiere");
    }
    $.post("/admin/addOrModMatiere/", {
      'mode' : mode,
      'idMatiere': idMatiere,
      'nom': nom,
      'generique': generique,
    }, () => {
      document.getElementById('addOrModMatiereForm').reset();
      $('#addOrModMatiere').modal('hide');
      refreshMatieres();
    });
  });


  function refreshMatieres() {
    $.get("/admin/tableMatieresJSON/", (data) => {
      let el = document.getElementById('dataListe2')
      dataListe.setDataListe(el, data);
      let table = $('#tableMatieres').DataTable({
        retrieve: true,
      });

      table.clear().draw();
      table.rows.add(data); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable
    });
  }


  function initDataTablesMatieres() {
    let liste = [];
    let table = $('#tableMatieres').DataTable({
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
          data: 'generique'
        },
        {
          data: null,
          className: "center",
          defaultContent: '<a href="" class="editor_edit">Edit</a>'
        }
      ],
    });

    // Edit record
    $('#tableMatieres').on('click', 'a.editor_edit', function(e) {
      e.preventDefault();
      let tr = $(this).closest('tr');
      let row = table.row(tr);
      let element = row.data();
      let nom = element.nom;
      let generique = element.generique;
      $('#addOrModMatiereForm input[name="nom"]').val(nom);
      $('#addOrModMatiereForm input[name="generique"]').val(generique);
      document.getElementById('addOrModMatiereForm').setAttribute("data-idmatiere", element._id);
      document.getElementById('addOrModMatiereForm').setAttribute("data-mode", "modifier");
      $('#addOrModMatiere').modal();
    });

  };

  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {

    initDataTablesMatieres();
    refreshMatieres();
  }

  return self;
})();


module.exports = matieres;

/*
**************************
      Script pour afficher les matieres
 **************************
 */
