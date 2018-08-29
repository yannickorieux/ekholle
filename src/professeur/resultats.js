let resultats = (function() {

  let self = {};
  let dataListe = require('../misc/dataListe.js');

  let el7 = document.getElementById('dataListe7') //liste des classes/matieres
  dataListe.selectId(el7)




/*
********************************************************************
      PRIVE
************************************************************
*/

/*
  Choix d 'une période '
*/

$('#datetimepickerRes1').datetimepicker({
  format: 'L',
});
$('#datetimepickerRes2').datetimepicker({
  format: 'L',
  useCurrent: false
});



$("#datetimepickerRes1").on("change.datetimepicker", function(e) {
  $('#datetimepickerRes2').datetimepicker('minDate', e.date);
});
$("#datetimepickerRes2").on("change.datetimepicker", function(e) {
  $('#datetimepickerRes1').datetimepicker('maxDate', e.date);
});


/*
********************************************************************
      Choix de la matiere / classe du coordo
************************************************************
*/

$('#dataListe7Form').submit(function(e) {
  e.preventDefault();
  let el7 = document.getElementById('dataListe7') //liste des matieresClasse du coordo
  let classeMatiere = dataListe.getName(el7);
  let idClasseMatiere = dataListe.getId(el7);
  if (idClasseMatiere != '') {
    $('#tabResultatsCoordo').css("display", "block");
  } else {
    $('#tabResultatsCoordo').css("display", "none");
  }
});

/*
  Validation du formulaire pour résultat sur une période
*/
$('#periodeResultatsForm').submit(function(e) {
  e.preventDefault();
  let debutPeriode = moment($('#datetimepickerRes1').find("input").val(),'DD/MM/YYYY').format();
  let finPeriode = moment($('#datetimepickerRes2').find("input").val(),'DD/MM/YYYY').format();
  let el7 = document.getElementById('dataListe7') //liste des matieresClasse du coordo
  let idClasseMatiere = dataListe.getId(el7);
  refreshTablesResultatsCoordo(idClasseMatiere,debutPeriode,finPeriode);
});

/*
********************************************************************
  Mise à jour de la table des colles
************************************************************
  */
function refreshTablesResultatsCoordo(idClasseMatiere,debutPeriode,finPeriode) {
  $.post("/professeur/tableResultatsCoordoJSON/", {
    'idClasseMatiere': idClasseMatiere,
    'debutPeriode' : debutPeriode,
    'finPeriode' : finPeriode,
  }, (data) => {
    let table = $('#tableResultatsCoordo').DataTable();
    table.clear().draw();
    table.rows.add(data); // Add new data
    table.columns.adjust().draw(); // Redraw the DataTable
  });
}



function initDataTablesResultatsCoordo() {
  let liste = []
  $.fn.dataTable.moment('DD/MM/YYYY');
  let table = $('#tableResultatsCoordo').DataTable({
    retrieve: true,
    data: liste,
    dom: 'Bfrtip',
    buttons: [
      'csv', 'excel', 'pdf'
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

    columns: [{
      data: null,
      render: function(data, type, row) {
        // Combine the first and last names into a single table field
        return data.nomE + ' ' + data.prenomE;
      },
    },
      {
        data: null,
        render: function(data, type, row) {
          let notes=''
          data.notes.forEach(function(value) {
            notes += value+';'
          });
          return notes;
        },
      },
      {
        data: 'moyenne',
        // render: function(data, type, row) {
        //   let moyenne=data.moyenne
        //   if (moyenne){moyenne=moyenne.toFixed(2)}
        //   return moyenne ;
        // },
      },
      {
        data: "rank",
        defaultContent: ''
      },
    ],
    drawCallback: function () {
         let api = this.api();
         let arr = api.columns(2).data()[0];  //get array of column 3 (extn)
         let sorted = arr.slice().sort(function(a,b){return b-a});
         let ranks = arr.slice().map(function(v){ return sorted.indexOf(v)+1 });
         // interate through each row
         api.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
           let data = this.data();
           let moyenne=data.moyenne
           data.rank= ranks[arr.indexOf(data.moyenne)];  //set the rank column = the array index of the extn in the ranked array
         } );
       api.rows().invalidate();
     }

  });
};
/*
********************************************************************
      PUBLIC
************************************************************
*/


self.init = () => {
 initDataTablesResultatsCoordo();
};


return self;

})();

module.exports = resultats;
