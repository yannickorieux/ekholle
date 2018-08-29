let decompteHeures = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let dataListe = require('../misc/dataListe.js');

  /*
  ********************************************************************
        PRIVE
  ************************************************************
*/

let el9 = document.getElementById('dataListe9');
dataListe.selectId(el9);

$('#dataListe9Form').submit(function(e) {
  e.preventDefault();
  let idPeriode = dataListe.getId(el9);
  if (idPeriode != '') {
    $('#showTableDecompte').css("display", "block");
    refreshTableDecompteHeures(idPeriode)
  } else {
    $('#showTableDecompte').css("display", "none");
  }
});


function lirePeriodes() {
  $.get("/professeur/getAnnee/", (data) => {
    if (typeof data.annee === 'undefined' ||(typeof data.annee.debut === 'undefined' && typeof data.annee.fin === 'undefined') ) {
      return;
    } else {
      let periodes = data.periodes;
      let dateInitAddPeriode;
      let n = 0;
      if (typeof periodes !== 'undefined' && periodes.length !== 0) {
        n = data.periodes.length;
        dateInitAddPeriode = data.periodes[n - 1].finPeriode;
      } else {
        dateInitAddPeriode = data.annee.debut;
      }
      //on met à jour la dataliste des periodes
      let el9 = document.getElementById('dataListe9')
      dataListe.setDataListe(el9, periodes);
    }
  });
};



  function initDataDecompteHeures() {
    let liste = []
    $.fn.dataTable.moment('DD/MM/YYYY');
    let table = $('#tableDecompte').DataTable({
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
            return data.classe + '-' + data.matiere + ' ( ' + data.duree + ' mn )';
          },
        },
        {
          data: 'count'
        },
        {
            data: null,
            render: function(data, type, row) {
              // Combine the first and last names into a single table field
              return Math.floor(data.heures / 60) + ' h ' + data.heures % 60 + ' mn';
            },
          },

      ],
    });

  };


  function refreshTableDecompteHeures(idPeriode) {
      $.post("/professeur/tableDecompteHeuresJSON/",{'idProfesseur' : idProfesseur, 'idPeriode' : idPeriode} , (data) => {
        $('#tableDecompte').DataTable().clear().draw();
        $('#tableDecompte').DataTable().rows.add(data); // Add new data
        $('#tableDecompte').DataTable().columns.adjust().draw(); // Redraw the DataTable
      });
    }


  /*
  ********************************************************************
        PUBLIC
  ************************************************************
  */
  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */


  self.init = () => {
    initDataDecompteHeures();
    lirePeriodes();
  };


  return self;

})();

module.exports = decompteHeures;
