let programme = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let dataListe = require('../misc/dataListe.js');


  /*
  ********************************************************************
        PRIVE
  ************************************************************

  /*
  ********************************************************************
    Mise à jour de la table
  ************************************************************
  */
  function refreshTableProgrammeColleur() {
    $.post("/professeur/tableProgrammeColleurJSON/", {
      'idProfesseur': idProfesseur,
    }, (data) => {
      $('#tableProgrammeColleur').DataTable().clear().draw();
      $('#tableProgrammeColleur').DataTable().rows.add(data); // Add new data
      $('#tableProgrammeColleur').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  }


  function detailProgrammeColleur(d) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
      '<tr>' +
      '<td>Détail:</td>' +
      '<td>' + d.detail + '</td>' +
      '</tr>' +
      '</table>';
  };


  function initDataTablesProgrammeColleur() {
    let liste = []
    $.fn.dataTable.moment('DD/MM/YYYY');
    let table = $('#tableProgrammeColleur').DataTable({
      responsive: true,
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

      columns: [
        {
          data : 'classe'
        },
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return data.nom + ' ' + data.prenom;
          },
        },
        {
          data: null,
          render: function(data, type, row) {
            return moment(data.debut).format("DD/MM/YYYY");
          },
        },
        {
          data: null,
          render: function(data, type, row) {
            return moment(data.fin).format("DD/MM/YYYY");
          },
        },
        {
          data: "titre",
        },
        {
          "className": 'details-control',
          "orderable": false,
          "data": null,
          "defaultContent": ''
        },
      ]
    });

    $('#tableProgrammeColleur tbody').on('click', 'td.details-control', function() {
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(detailProgrammeColleur(row.data())).show();
        tr.addClass('shown');
      }
    });

  };


  /*
  ********************************************************************
    Afficher le programme colleur a l'ouverture de l'onglet
  ************************************************************
    */
  $('[href="#subtab1b2"]').on('show.bs.tab', function (e) {
    refreshTableProgrammeColleur();
  });

  /*
  ********************************************************************
        PUBLIC
  ************************************************************
  */


  self.init = () => {
    initDataTablesProgrammeColleur()
  };


  return self;

})();

module.exports = programme;
