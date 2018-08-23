let synthese = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let dataListe = require('../misc/dataListe.js');

  let el5 = document.getElementById('dataListe5') //liste des élèves
  dataListe.selectId(el5)


  /*
  ********************************************************************
        PRIVE
  ************************************************************


  /*
  ********************************************************************
        Choix de la matiere / classe du coordo
  ************************************************************
  */

  $('#dataListe5Form').submit(function(e) {
    e.preventDefault();
    let el5 = document.getElementById('dataListe5') //liste des matieresClasse du coordo
    let classeMatiere = dataListe.getName(el5);
    let idClasseMatiere = dataListe.getId(el5);
    if (idClasseMatiere != '') {
      $('#tabCollesCoordo').css("display", "block");
      refreshTableCoordo(idClasseMatiere);
    } else {
      $('#tabCollesCoordo').css("display", "none");
    }
  });



  /*
  **************************
      fonction permettant d'afficher la liste des colles pour une matière/classe donnée
   **************************
   */

  function formatCoordo(d) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
      '<tr>' +
      '<td>Sujet:</td>' +
      '<td>' + d.sujet + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td>obs. coordo:</td>' +
      '<td>' + d.obsCoordo + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td>obs. élève:</td>' +
      '<td>' + d.obsEleve + '</td>' +
      '</tr>' +
      '</table>';
  };


  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */
  function refreshTableCoordo(idClasseMatiere) {
    $.post("/professeur/tableCollesCoordoJSON/", {
      'idClasseMatiere': idClasseMatiere,
    }, (data) => {
      $('#tableCollesCoordo').DataTable().clear().draw();
      $('#tableCollesCoordo').DataTable().rows.add(data); // Add new data
      $('#tableCollesCoordo').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  }


  function initDataTablesCoordo() {
    let liste = []
    $.fn.dataTable.moment('DD/MM/YYYY');
    let table = $('#tableCollesCoordo').DataTable({
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
      order: [],
      columns: [{
        data: null,
        orderable : false,
        render: function(data, type, row) {
          // Combine the first and last names into a single table field
          return data.nomE + ' ' + data.prenomE;
        },
      },
      {
        data: null,
        orderable : false,
        render: function(data, type, row) {
          // Combine the first and last names into a single table field
          return data.nomP + ' ' + data.prenomP;
        },
      },
      {
        data: null,
        orderable : false,
        render: function(data, type, row) {
          if(data.note===null){
            return data.noNote;
          }
          return data.note;
        },
      },
        {
          data: "date",
           render: function(data, type, row){
               if(type === "sort" || type === "type"){
                   return data;
               }
               return moment(data).format("DD/MM/YYYY");
           }
        },
        {
          "className": 'details-control',
          "orderable": false,
          "data": null,
          "defaultContent": ''
        },
      ]
    });

    $('#tableCollesCoordo tbody').on('click', 'td.details-control', function() {
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(formatCoordo(row.data())).show();
        tr.addClass('shown');
      }
    });
  };

  /*
  ********************************************************************
        PUBLIC
  ************************************************************
  */


  self.init = () => {
    initDataTablesCoordo();
  };


  return self;

})();

module.exports = synthese;
