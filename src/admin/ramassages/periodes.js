let periodes = (function() {

  let self = {};
  let dataListe = require('../../dataListe/dataListe.js');

  /*
  **************************
        PRIVATE
   **************************
   */



  document.getElementById("buttonAddPeriode").addEventListener('click', function() {
    $('#addPeriodeModal').modal();
  });




  function initDataTablesPeriodes() {
    liste = [];
    $.fn.dataTable.moment('DD/MM/YYYY');
    let table = $('#tablePeriodes').DataTable({
      data: liste,
      paging: false,
      ordering: false,
      info: false,
      searching: false,
      language: {
        zeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
        emptyTable: "Aucune donnée disponible dans le tableau",
      },
      columns: [{
          data: 'description',
        },
        {
          data: 'debutPeriode',
          render: function(data, type, row) {
            return moment(data).format("DD/MM/YYYY");
          }
        },
        {
          data: 'finPeriode',
          render: function(data, type, row) {
            return moment(data).format("DD/MM/YYYY");
          }
        },
        {
          data: null,
          className: "center",
          defaultContent: '<a href="" class="editor_edit">Edit</a>/<a href="" class="editor_supp">Supp</a>'

        }
      ],
      order: [
        [1, "asc"]
      ],

    });

    // Edit record
    $('#tablePeriodes').on('click', 'a.editor_edit', function(e) {
      e.preventDefault();
      let tr = $(this).closest('tr');
      let row = table.row(tr);
      let element = row.data();
      let description = element.description;
      let debutPeriode = element.debutPeriode;
      let finPeriode = element.finPeriode;
      let id = element._id;
      let idPrevious = '';
      let idNext = '';
      if (tr[0].previousSibling !== null) {
        let trPrevious = $(tr[0].previousSibling);
        let rowPrevious = table.row(trPrevious);
        let elementPrevious = rowPrevious.data();
        idPrevious = elementPrevious._id;
      }
      if (tr[0].nextSibling !== null) {
        let trNext = $(tr[0].nextSibling);
        let rowNext = table.row(trNext);
        let elementNext = rowNext.data();
        idNext = elementNext._id
      }
      $(document.getElementById('debutPeriode')).val(moment(debutPeriode).format('DD/MM/YYYY'));
      $(document.getElementById('finPeriode')).val(moment(finPeriode).format('DD/MM/YYYY'));
      $(document.getElementById('descriptionPeriode')).val(description);
      document.getElementById('addPeriodeForm').setAttribute("data-id", id);
      document.getElementById('addPeriodeForm').setAttribute("data-idprevious", idPrevious);
      document.getElementById('addPeriodeForm').setAttribute("data-idnext", idNext);
      $('#datetimepicker3').datetimepicker('minDate', moment(debutPeriode).format('L'));
      $('#datetimepicker3').datetimepicker('maxDate', moment(finPeriode).format('L'));
      $('#addPeriodeModal').modal();

    });

    // Supp record
    $('#tablePeriodes').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      let idPeriode = element._id;
      let idNext = '';
      let dateFinPrevious = moment($('#datetimepicker1').find("input").val(), 'DD/MM/YYYY').format(); //on prend le debut de l'année si une seule periode de définie
      if (tr[0].previousSibling !== null) {
        let trPrevious = $(tr[0].previousSibling);
        let rowPrevious = table.row(trPrevious);
        let elementPrevious = rowPrevious.data();
        dateFinPrevious = elementPrevious.finPeriode; //on prend la date de fin de periode précédente
      }
      if (tr[0].nextSibling !== null) {
        let trNext = $(tr[0].nextSibling);
        let rowNext = table.row(trNext);
        let elementNext = rowNext.data();
        idNext = elementNext._id
      }
      console.log(dateFinPrevious);
      suppPeriode(idPeriode, idNext, dateFinPrevious);
    });

  };

  /*
    Mise à jour dataTables
  */
  refreshTablePeriodes = function(data) {
    let table = $('#tablePeriodes').DataTable();
    table.clear().draw();
    table.rows.add(data); // Add new data
    table.columns.adjust().draw(); // Redraw the DataTable
  };


  /*
    Définition de l'année scolaire
  */

  $('#datetimepicker1').datetimepicker({
    format: 'L',
  });
  $('#datetimepicker2').datetimepicker({
    format: 'L',
    useCurrent: false
  });



  $("#datetimepicker1").on("change.datetimepicker", function(e) {
    $('#datetimepicker2').datetimepicker('minDate', e.date);
  });
  $("#datetimepicker2").on("change.datetimepicker", function(e) {
    $('#datetimepicker1').datetimepicker('maxDate', e.date);
  });


  //pour ajouter une periode
  $('#datetimepicker3').datetimepicker({
    format: 'L',
    useCurrent: false
  });


  /*
    Validation du formulaire et enregistrement de la période annuelle
  */
  $('#defAnneeForm').submit(function(e) {
    e.preventDefault();
    let debutAnnee = $('#datetimepicker1').find("input").val();
    let finAnnee = $('#datetimepicker2').find("input").val();
    $.post("/admin/defAnnee/", {
      'debutAnnee': debutAnnee,
      'finAnnee': finAnnee,
    }, () => {
      lirePeriodes();
    });
  });

  /*
    LEcture des données pour mettre à jour les périodes
  */

  lirePeriodes = function() {
    $.get("/admin/getAnnee/", (data) => {
      if (typeof data.annee.debut === 'undefined' && typeof data.annee.fin === 'undefined') {
        //annee non definie
      } else {
        let debutAnnee = $('#datetimepicker1').find("input").val(moment(data.annee.debut).format('DD/MM/YYYY'));
        let finAnnee = $('#datetimepicker2').find("input").val(moment(data.annee.fin).format('DD/MM/YYYY'));
        document.getElementById("defPeriodesRamassages").style.display = "block";
        let periodes = data.periodes;
        let dateInitAddPeriode;
        let n = 0;
        if (typeof periodes !== 'undefined' && periodes.length !== 0) {
          n = data.periodes.length;
          dateInitAddPeriode = data.periodes[n - 1].finPeriode;
        } else {
          dateInitAddPeriode = data.annee.debut;
        }
        refreshTablePeriodes(periodes);
        $(document.getElementById('debutPeriode')).val(moment(dateInitAddPeriode).format('DD/MM/YYYY'));
        $('#datetimepicker3').datetimepicker('maxDate', moment(data.annee.fin).format('L'));
        $('#datetimepicker3').datetimepicker('minDate', moment(dateInitAddPeriode).format('L'));
        //on met à jour la dataliste des periodes
        let el5 = document.getElementById('dataListe5')
        dataListe.setDataListe(el5, periodes);
      }
    });

  };

  /*
    formulaire pour ajouter une période
  */
  $('#addPeriodeForm').submit(function(e) {
    e.preventDefault();
    let debutPeriode = moment(document.getElementById('debutPeriode').value, 'DD/MM/YYYY').format();
    let finPeriode = moment(document.getElementById('finPeriode').value, 'DD/MM/YYYY').format();
    let description = document.getElementById('descriptionPeriode').value;
    let id = document.getElementById('addPeriodeForm').getAttribute("data-id");
    idPrevious='';
    idNext='';
    if (id !== '') {
      idPrevious = document.getElementById('addPeriodeForm').getAttribute("data-idprevious");
      idNext = document.getElementById('addPeriodeForm').getAttribute("data-idnext");
    }

    $.post("/admin/sauvePeriode/", {
      'debutPeriode': debutPeriode,
      'finPeriode': finPeriode,
      'description': description,
      'id': id,
      'idPrevious': idPrevious,
      'idNext': idNext,
    }, (err) => {
      document.getElementById('addPeriodeForm').reset();
      $('#addPeriodeModal').modal('hide');
      lirePeriodes();
    });
  });


  suppPeriode = function(idPeriode, idNext , dateFinPrevious) {
    $.post("/admin/suppPeriode/" , {
      'idPeriode': idPeriode,
      'idNext': idNext,
      'dateFinPrevious': dateFinPrevious
    }, (err) => {
       console.log('test')
       lirePeriodes();
    });
}

/*
**************************
      PUBLIC
 **************************
 */

self.init = function() {
  initDataTablesPeriodes();
  lirePeriodes();
}



return self;
})();


module.exports = periodes;
