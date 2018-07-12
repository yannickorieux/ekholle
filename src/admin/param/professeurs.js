let professeurs = (function() {

  let self = {};
  let dataListe = require('../../dataListe/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */


/*
   **************************
         Script pour afficher la table professeurs
    **************************
    */
   afficheProfesseurs = function(data) {

     let liste = data;
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
           data: 'grade'
         },
         {
           data: 'email'
         },
         {
           data: 'disciplines'
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
     table.clear().draw();
     table.rows.add(liste); // Add new data
     table.columns.adjust().draw(); // Redraw the DataTable

     // Edit record
     $('#tableProfesseurs').on('click', 'a.editor_edit', function(e) {
       e.preventDefault();
       console.log($(this).closest('tr'));
       $('#modifierProfesseur').modal();
     });
   };


  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function(){
    $.get("/admin/tableProfesseursJSON/", (data) => {
      let el=document.getElementById('dataListe3')
      dataListe.setDataListe(el,data);
      afficheProfesseurs(data);
    });
  }

  return self;
})();


module.exports = professeurs;
