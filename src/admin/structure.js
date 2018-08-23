let structure = (function() {

  let self = {};

  /*
  **************************
        PRIVATE
   **************************
   */
   /*
   **************************
         Script pour afficher la sructure des classes
    **************************
    */
   self.afficheStructure = function(){
     $.get("/admin/tableStructureJSON/", (data) => {
       let liste = data;
       if (typeof liste === 'undefined') {
         let liste = []
       };

       let table = $('#tableStructure').DataTable({
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
             data: 'nom'
           },
           {
             data: 'classe[0].niveau'
           },
           {
             data: 'total'
           },
           {
               data: null,
               render: function(data, type, row) {
                 // Combine the first and last names into a single table field
                 return '';
               },
           },
         ],
       });

       table.clear().draw();
       table.rows.add(liste); // Add new data
       table.columns.adjust().draw(); // Redraw the DataTable
     });
   };
  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function(){
    self.afficheStructure();
  }

  return self;
})();


module.exports = structure;
