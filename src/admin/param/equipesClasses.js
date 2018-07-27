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


  $('#dataListe1Form').submit(function(e) {
    e.preventDefault();
    let classe = dataListe.getName(el1)
    let id = dataListe.getId(el1)
    if (classe !== '') {
      $('#showTableEquipeClasse').css("display", "block");
      refreshTableEquipeClasse(classe);
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
        refreshTableEquipeClasse(classe);
      }
    });
  });


  /*
  **************************
        Script pour afficher une classe
   **************************
   */

   function initDataTablesEquipeClasse() {
     liste = [];
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
           data: 'matiere.nom'
         },
         {
             data: null,
             render: function(data, type, row) {
               // Combine the first and last names into a single table field
               return data.professeur.nom + ' ' + data.professeur.prenom;
             },
           },
         {
           data: 'duree'
         },
       ],
     });
   };

  refreshTableEquipeClasse = function(classe) {
    $.post("/admin/tableEquipeClasseJSON/", {
      'classe': classe
    }, (data) => {
      $('#tableEquipeClasse').DataTable().clear().draw();
      $('#tableEquipeClasse').DataTable().rows.add(data); // Add new data
      $('#tableEquipeClasse').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  };


  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    initDataTablesEquipeClasse();
  }

  return self;
})();


module.exports = equipesClasses;
