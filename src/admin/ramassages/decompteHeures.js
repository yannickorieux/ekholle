let decompteHeures = (function() {

  let self = {};
  let dataListe = require('../../misc/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************



   ********************************************************************
         Choix de la periode
   ************************************************************
         */

  let el5 = document.getElementById('dataListe5')
  dataListe.selectId(el5)
  $('#dataListe5Form').submit(function(e) {
    e.preventDefault();
    let idPeriode = dataListe.getId(el5);
    if (idPeriode != '') {
      $('#showTableDecompte').css("display", "block");
      $.post("/admin/decompteHeuresJSON/", {'idPeriode' : idPeriode},(data) => {
        refreshTableBilan(data);
        });
    } else {
      $('#showTableDecompte').css("display", "none");
    }
  });


  /*
  **************************
      fonction permettant d'afficher la liste des colles pour une matière/classe donnée
   **************************
   */

  // function formatDetailBilan(d) {
  //   // `d` is the original data object for the row
  //   // `d` is the original data object for the row
  //   let table = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
  //   for (let i = 0; i < d.bilan.length; i++) {
  //     table +=
  //       '<tr>' +
  //       '<td>' + d.bilan[i].classe + ' ( ' + d.bilan[i].duree + ' ) ' + '</td>' +
  //       '<td>' + d.bilan[i].count + '</td>' +
  //       '<td>' + Math.floor(d.bilan[i].heures / 60) + 'h' + d.bilan[i].heures % 60 + 'mn' + '</td>' +
  //       '</tr>';
  //   }
  //
  //   table += '</table>';
  //   return table;
  // };

  /*
  **************************
        Script pour afficher le bilan des heures effectuées sur une période
   **************************
   */
  function initDataTablesBilan() {
    let liste = [];
    let table = $('#tableDecompte').DataTable({
      dom: 'Bfrtip',
      buttons: [
        'csv', 'excel', 'pdf'
      ],
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
            return data.nom + ' ' + data.prenom;
          },
        },
        {
          data: 'grade'
        },
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            let ind=data.bilan.findIndex(i =>i.taux === 1);
            if(ind!==-1) return parseInt(data.bilan[ind].heures*100/60)/100;
          },
        },
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            let ind=data.bilan.findIndex(i =>i.taux === 2);
            if(ind!==-1) return parseInt(data.bilan[ind].heures*100/60)/100;
          },
        },
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            let ind=data.bilan.findIndex(i => i.taux === 3);
            if(ind!==-1) return parseInt(data.bilan[ind].heures*100/60)/100;
          },
        },
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            let ind=data.bilan.findIndex(i =>i.taux === 4);
            if(ind!==-1) return parseInt(data.bilan[ind].heures*100/60)/100;
          },
        },
        // {
        //   data: 'count'
        // },
        // {
        //   data: null,
        //   render: function(data, type, row) {
        //     // Combine the first and last names into a single table field
        //     return Math.floor(data.heures / 60) + 'h' + data.heures % 60 + 'mn';
        //   },
        // },
        // {
        //   "className": 'details-control',
        //   "orderable": false,
        //   "data": null,
        //   "defaultContent": ''
        // },
        // {
        //   data: null,
        //   render: function(data, type, row) {
        //     // Combine the first and last names into a single table field
        //     let detail = '';
        //     for (let i = 0; i < data.bilan.length; i++) {
        //       detail += data.bilan[i].classe + ' ( ' + data.bilan[i].duree + ' ) : ' + data.bilan[i].count + ' : ' + Math.floor(data.bilan[i].heures / 60) + 'h' + data.bilan[i].heures % 60 + 'mn' + ';'
        //     }
        //     return detail;
        //   },
        // },
      ],

      order: [
        [0, "asc"]
      ],
    });

    // $('#tableDecompte tbody').on('click', 'td.details-control', function() {
    //   var tr = $(this).closest('tr');
    //   var row = table.row(tr);
    //   if (row.child.isShown()) {
    //     // This row is already open - close it
    //     row.child.hide();
    //     tr.removeClass('shown');
    //   } else {
    //     // Open this row
    //     row.child(formatDetailBilan(row.data())).show();
    //     tr.addClass('shown');
    //   }
    // });
    // table.columns(5).visible(false);
  };


  /*
  ********************************************************************
    Mise à jour de la table bilan
  ************************************************************
    */
  function refreshTableBilan(data) {
      let table = $('#tableDecompte').DataTable({retrieve : true})
      table.clear().draw();
      table.rows.add(data); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable
  }

  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    initDataTablesBilan();
  }


  return self;
})();


module.exports = decompteHeures;
