let addProgramme = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let dataListe = require('../misc/dataListe.js');


  let el8 = document.getElementById('dataListe8') //liste des classes matieres
  dataListe.selectId(el8)


  const editProgButton = document.getElementById("buttonEditProg");
  const validProgButton = document.getElementById("buttonValidProg");


  /*
  ********************************************************************
        PRIVE
  ************************************************************
*/


 function editProgSummernote(){
   $('#detailProg').summernote({
     height: 100,
     dialogsInBody: true,
     dialogsFade: true,
     toolbar: [
       ['style', ['bold', 'italic', 'underline', 'strike']],
       ['para', ['ul', 'ol']],
       ['color', ['color']],
       ['para', ['ul', 'ol', 'paragraph']],
       ['insert', ['link', 'hr']],
       ['misc', ['undo', 'redo', 'print', 'help', 'fullscreen']]
     ],
     focus: true,
   });
  };

  function validProgSummernote(){
    let programme = $('#detailProg').summernote('code');
    $('#detailProg').html(programme);
     $('#detailProg').summernote('destroy');
   };



editProgButton.addEventListener('click', editProgSummernote, false);
validProgButton.addEventListener('click', validProgSummernote, false);







  function showProgrammeForm() {
      document.getElementById('addProgrammeForm').setAttribute("data-mode", "ajouter");
      document.getElementById('addProgrammeForm').setAttribute("data-idprogramme", '');
      document.getElementById('addProgrammeForm').reset();
      $('#addProgrammeModal').modal();
    };

     const addProgrammeButton=document.getElementById("buttonAddProgramme");



  /*
    Choix d 'une période '
  */

  $('#datetimepickerProg1').datetimepicker({
    format: 'L',
  });
  $('#datetimepickerProg2').datetimepicker({
    format: 'L',
    useCurrent: false
  });



  $("#datetimepickerProg1").on("change.datetimepicker", function(e) {
    $('#datetimepickerProg2').datetimepicker('minDate', e.date);
  });
  $("#datetimepickerProg2").on("change.datetimepicker", function(e) {
    $('#datetimepickerProg1').datetimepicker('maxDate', e.date);
  });




  /*
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  Validation du formulaire pour ajouterModifier  un programme de colle **
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  */

  $('#addProgrammeForm').submit(function(e) {
    e.preventDefault();
    let el8 = document.getElementById('dataListe8')
    let idClasseMatiere = dataListe.getId(el8);
    let debut = moment($('#datetimepickerProg1').find("input").val(), 'DD/MM/YYYY').format();
    let fin = moment($('#datetimepickerProg2').find("input").val(), 'DD/MM/YYYY').format();
    let titre = document.getElementById('titre').value;
    let detail = document.getElementById('detailProg').innerHTML;
    let mode = document.getElementById('addProgrammeForm').getAttribute("data-mode");
    let idProgramme = '';
    if (mode === 'modifier') {
      idProgramme = document.getElementById('addProgrammeForm').getAttribute("data-idprogramme")
    }
    $.post("/professeur/addOrModProgramme/", {
      "idClasseMatiere": idClasseMatiere,
      "debut": debut,
      "fin": fin,
      "titre": titre,
      "detail": detail,
      "mode": mode, // mode : ajout ou modification d'une entree'
      "idProgramme": idProgramme //utile en cas de modif
    }, () => {
      $('#addProgrammeModal').modal('hide');
      refreshTableProgrammeCoordo(idClasseMatiere);
    });
  });



  /*
  ********************************************************************
    Suppression d'un programme de colle
  ************************************************************
    */
  function suppProgramme(idClasseMatiere, idProgramme) {
    $.post("/professeur/suppProgramme/", {
      "idProgramme": idProgramme,
      "idClasseMatiere": idClasseMatiere
    }, () => {
      refreshTableProgrammeCoordo(idClasseMatiere);
    })
  }

  /*
  ********************************************************************
        Choix de la matiere / classe du coordo
  ************************************************************
  */

  $('#dataListe8Form').submit(function(e) {
    e.preventDefault();
    let el8 = document.getElementById('dataListe8') //liste des matieresClasse du coordo
    let classeMatiere = dataListe.getName(el8);
    let idClasseMatiere = dataListe.getId(el8);
    if (idClasseMatiere != '') {
      $('#buttonAddProgramme').removeClass('disabled').prop('disabled', false);
      addProgrammeButton.addEventListener('click', showProgrammeForm,false);
      refreshTableProgrammeCoordo(idClasseMatiere);
    } else {
      $('#buttonAddProgramme').addClass('disabled').prop('disabled', true);
      addProgrammeButton.removeEventListener('click', showProgrammeForm,false);
    }
  });





  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */
  function refreshTableProgrammeCoordo(idClasseMatiere) {
    $.post("/professeur/tableProgrammeCoordoJSON/", {
      'idClasseMatiere': idClasseMatiere,
    }, (data) => {
      let table = $('#tableProgrammeCoordo').DataTable({
          retrieve: true,
        })
      table.clear().draw();
      table.rows.add(data); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable
    });
  }


  function detailProgramme(d) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
      '<tr>' +
      '<td>Détail:</td>' +
      '<td>' + d.detail + '</td>' +
      '</tr>' +
      '</table>';
  };


  function initDataTablesProgrammeCoordo() {
    let liste = []
    $.fn.dataTable.moment('DD/MM/YYYY');
    let table = $('#tableProgrammeCoordo').DataTable({
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
        {
          data: null,
          className: "center",
          defaultContent: '<a href="" class="editor_modif">Edit</a>/<a href="" class="editor_supp">Supp</a>'
        }
      ]
    });

    $('#tableProgrammeCoordo tbody').on('click', 'td.details-control', function() {
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(detailProgramme(row.data())).show();
        tr.addClass('shown');
      }
    });


    // Edit record
    $('#tableProgrammeCoordo').on('click', 'a.editor_modif', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      let debut = element.debut;
      let fin = element.fin ;
      let titre = element.titre;
      let detail = element.detail ;
      let idProgramme = element.idProgramme ;
      // utiliser un data-action='modifier' ou data-action='supprimer'
      document.getElementById('addProgrammeForm').setAttribute("data-mode", "modifier");
      document.getElementById('addProgrammeForm').setAttribute("data-idprogramme", idProgramme);
      $(document.getElementById('debutProg')).val(moment(element.debut).format('DD/MM/YYYY'));
      $(document.getElementById('finProg')).val(moment(element.fin).format('DD/MM/YYYY'));
      $(document.getElementById('titre')).val(titre);
      $(document.getElementById('detailProg')).html(detail);
      $('#addProgrammeModal').modal();
    });

    // Supp record
    $('#tableProgrammeCoordo').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      suppProgramme(element.idClasseMatiere, element.idProgramme);
    });
  };



  /*
  ********************************************************************
    Gestion des events change tab
  ************************************************************
    */
  $('[href="#subtab2b3"]').on('hidden.bs.tab', function (e) {
    let el8 = document.getElementById('dataListe8') //liste des classes Matieres du coordo
    $('#dataListe8Form')[0].reset();
    $('#tableProgrammeCoordo').DataTable().clear().draw();
    $('#buttonAddProgramme').addClass('disabled').prop('disabled', true);
    addProgrammeButton.removeEventListener('click', showProgrammeForm,false);
  });


  /*
  ********************************************************************
        PUBLIC
  ************************************************************
  */


  self.init = () => {
    initDataTablesProgrammeCoordo();
  };


  return self;

})();

module.exports = addProgramme;
