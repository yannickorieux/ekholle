let colles = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let dataListe = require('../misc/dataListe.js');

  const addColleButton = document.getElementById("buttonAddColle");

  const editCoordoButton = document.getElementById("buttonEditCoo");
  const editEleveButton = document.getElementById("buttonEditEleve");
  const validCoordoButton = document.getElementById("buttonValidCoo");
  const validEleveButton = document.getElementById("buttonValidEleve");

  $.fn.datetimepicker.Constructor.Default = $.extend({}, $.fn.datetimepicker.Constructor.Default, {
    icons: {
      time: 'far fa-clock',
      date: 'far fa-calendar',
      up: 'far fa-arrow-up',
      down: 'far fa-arrow-down',
      previous: 'far fa-chevron-left',
      next: 'far fa-chevron-right',
      today: 'far fa-calendar-check-o',
      clear: 'far fa-trash',
      close: 'far fa-times'
    }
  });
  //picker pour addColle
  $('#datetimepicker1').datetimepicker({
    date: moment(),
    sideBySide: true,
    stepping: 30,
  });
  /*
  ********************************************************************
        PRIVE
  ************************************************************
********************************************************************
      validation des datalistes
************************************************************
    */



function editCoordoSummernote(){
  $('#obsCoordo').summernote({
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


 function editEleveSummernote(){
   $('#obsEleve').summernote({
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
      tabSize: 2 ,
   });
  };

  function validEleveSummernote(){
    let obsEleve = $('#obsEleve').summernote('code');
    $('#obsEleve').html(obsEleve);
     $('#obsEleve').summernote('destroy');
   };

  function validCoordoSummernote(){
    let obsCoordo = $('#obsCoordo').summernote('code');
    $('#obsCoordo').html(obsCoordo);
     $('#obsCoordo').summernote('destroy');
  };



editCoordoButton.addEventListener('click', editCoordoSummernote, false);
editEleveButton.addEventListener('click', editEleveSummernote, false);
validCoordoButton.addEventListener('click', validCoordoSummernote, false);
validEleveButton.addEventListener('click', validEleveSummernote, false);

  /*
  Gestion de l'event add colle
  */
  function showColleForm() {
    document.getElementById('addColleForm').setAttribute("data-mode", "ajouter");
    document.getElementById('addColleForm').setAttribute("data-idcolle", '');
    let el2 = document.getElementById('dataListe2')
    dataListe.readOnly(el2, false);
    document.getElementById('addColleForm').reset();
    //$(document.getElementById('obsEleve')).summernote('code', '');
    //$(document.getElementById('obsCoordo')).summernote('code', '');
    document.getElementById('dateSaisie').innerHTML = moment().format('L');
    $(document.getElementById('dateColle')).val(moment().format('DD/MM/YYYY HH'));
    $('#addColleModal').modal();
  }






  let el1 = document.getElementById('dataListe1') //validation de la liste des collesClasse du professeur
  dataListe.selectId(el1)
  let el2 = document.getElementById('dataListe2') //validation de la  liste des élèves
  dataListe.selectId(el2)
  let el6 = document.getElementById('dataListe6') //liste des notes
  dataListe.selectNotes(el6)

  /*
  ********************************************************************
        Choix d'une matiere pour le colleur et récupération de la liste des élèves
  ************************************************************
  */

  $('#dataListe1Form').submit(function(e) {
    e.preventDefault();
    let el1 = document.getElementById('dataListe1') //liste des collesClasse du professeur
    let colle = dataListe.getName(el1);
    let idColle = dataListe.getId(el1);
    if (idColle != '' && typeof idColle !== 'undefined') {
      $.post("/professeur/listeElevesJSON/", {
        'idColle': idColle,
        'idProfesseur': idProfesseur,
      }, (data) => {
        let el2 = document.getElementById('dataListe2')
        dataListe.setDataListe(el2, data);
        if (colle != '') {
          // Enabled with:
          $('#buttonAddColle').removeClass('disabled').prop('disabled', false);
          addColleButton.addEventListener('click', showColleForm, false);
          refreshTableColle(idColle);
        } else {
          // disabled with:
          $('#buttonAddColle').addClass('disabled').prop('disabled', true);
          addColleButton.removeEventListener('click', showColleForm, false);
        }
      });
    }
  });



  /*
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  Validation du formulaire pour ajouterModifier  une colle **
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  */

  // $('#addColleForm').submit(function(e) {
  //
  // });

  $('#addColleForm').on("submit", function(event){
      $(this).children('button[type=submit]').prop('disabled', true);
      return true;
  });

 $('#addColleForm').submit(function(e) {
   e.preventDefault();
   $('#addColleModal').modal('hide');
   let el1 = document.getElementById('dataListe1')
   let idMatiereColle = dataListe.getId(el1);
   let el2 = document.getElementById('dataListe2')
   let idEleve = dataListe.getId(el2);
   let date = moment(document.getElementById('dateColle').value, 'DD/MM/YYYY HH:mm');
   let dateSaisie = moment(document.getElementById('dateSaisie').innerHTML, 'DD/MM/YYYY').startOf('day');
   let el6 = document.getElementById('dataListe6')
   let note = dataListe.getNote(el6);
   let noNote = '';
   if (isNaN(parseInt(note))) {
     noNote = note;
     note = null;
   } else {
     note = parseInt(note);
   }
   let sujet = document.getElementById('sujet').value;
   let obsCoordo = document.getElementById('obsCoordo').innerHTML;
   let obsEleve = document.getElementById('obsEleve').innerHTML;
   let mode = document.getElementById('addColleForm').getAttribute("data-mode");
   let idColle = '';
   if (mode === 'modifier') {
     idColle = document.getElementById('addColleForm').getAttribute("data-idcolle")
   }
   $.post("/professeur/addOrModColle/", {
     "date": moment(date).format(),
     "dateSaisie": moment(dateSaisie).format(),
     "idEleve": idEleve,
     "idMatiereColle": idMatiereColle,
     "idProfesseur": idProfesseur,
     "note": note,
     "noNote": noNote,
     "sujet": sujet,
     "obsCoordo": obsCoordo,
     "obsEleve": obsEleve,
     "mode": mode, // mode : ajout ou modification d'une colle
     "idColle": idColle //utile en cas de modif
   }, () => {
     let el1 = document.getElementById('dataListe1');
     let idColle = dataListe.getId(el1);
     //on rafraichit la table
     refreshTableColle(idMatiereColle);
   });
 });



  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */
  function refreshTableColle(idMatiereColle) {
    $.post("/professeur/tableCollesJSON/", {
      'idMatiereColle': idMatiereColle,
      'idProfesseur': idProfesseur,
    }, (data) => {
      $('#tableColles').DataTable().clear().draw();
      $('#tableColles').DataTable().rows.add(data); // Add new data
      $('#tableColles').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  }



  /*
  ********************************************************************
    Suppression d'une colle
  ************************************************************
    */
  function suppColle(idMatiereColle, idColle) {
    $.post("/professeur/suppColle/", {
      "idColle": idColle,
      "idProfesseur": idProfesseur,
      "idMatiereColle": idMatiereColle
    }, () => {
      refreshTableColle(idMatiereColle);
    })
  }



  /*
  ********************************************************************
    Obtention de la liste des colles/matieres et mise à jour de la dataliste pour le professeur
  ************************************************************
    */
  function getListeColles() {
    $.post("/professeur/tableMesCollesClassesJSON/", {
      'idProfesseur': idProfesseur,
    }, (data) => {
      let el1 = document.getElementById('dataListe1')
      dataListe.setDataListe(el1, data);
    });
  }



  /*
  **************************
      fonction permettant d'afficher la liste des colles pour une matière/classe donnée
   **************************
   */

  function format(d) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
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


  function initDataTables() {
    let liste = []
    $.fn.dataTable.moment('DD/MM/YYYY HH:mm');
    let table = $('#tableColles').DataTable({
      responsive: true,
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
          orderable: false,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return data.nom + ' ' + data.prenom;
          },
        },
        {
          data: null,
          orderable: false,
          render: function(data, type, row) {
            if (data.note === null) {
              return data.noNote;
            }
            return data.note;
          },
        },
        {
          data: null,
          render: function(data, type, row) {
            return moment(data.date).format("DD/MM/YYYY HH:mm");
          },
        },
        {
          data: 'sujet',
          orderable: false,
        },
        {
          data: null,
          render: function(data, type, row) {
            return moment(data.dateSaisie).format("DD/MM/YYYY");
          }
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
      ],
    }, );


    // Edit record
    $('#tableColles').on('click', 'a.editor_modif', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      let idColle = element.idColle;
      let nom = element.nom + ' ' + element.prenom;
      let note = element.note;
      if (element.note === null) {
        note = element.noNote;
      }
      let date = element.date;
      let dateSaisie = element.dateSaisie;
      let sujet = element.sujet;
      let obsEleve = element.obsEleve;
      let obsCoordo = element.obsCoordo;
      // utiliser un data-action='modifier' ou data-action='supprimer'
      document.getElementById('addColleForm').setAttribute("data-mode", "modifier");
      document.getElementById('addColleForm').setAttribute("data-idcolle", idColle);
      let el2 = document.getElementById('dataListe2')
      dataListe.readOnly(el2, true);
      dataListe.setName(el2, nom);
      $(document.getElementById('dateColle')).val(moment(date).format('DD/MM/YYYY HH:mm'));
      document.getElementById('dateSaisie').innerHTML = moment().format('L');
      $(document.getElementById('sujet')).val(sujet);
      $(document.getElementById('obsEleve')).html(obsEleve);
      $(document.getElementById('obsCoordo')).html(obsCoordo);
      let el6 = document.getElementById('dataListe6')
      dataListe.setLaNote(el6, note);

      $('#addColleModal').modal();
    });

    // Supp record
    $('#tableColles').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      suppColle(element.idMatiereColle, element.idColle);
    });

    $('#tableColles tbody').on('click', 'td.details-control', function() {
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(format(row.data())).show();
        tr.addClass('shown');
      }
    });
  };


  /*
  ********************************************************************
    Gestion des events change tab
  ************************************************************
    */
  $('[href="#1b"]').on('hidden.bs.tab', function(e) {
    let el1 = document.getElementById('dataListe1') //liste des collesClasse du professeur
    $('#dataListe1Form')[0].reset();
    $('#tableColles').DataTable().clear().draw();
    $('#buttonAddColle').addClass('disabled').prop('disabled', true);
    addColleButton.removeEventListener('click', showColleForm, false);
  });

  /*
  ********************************************************************
        PUBLIC
  ************************************************************
  */


  self.init = () => {
    getListeColles();
    initDataTables();
  };


  return self;

})();

module.exports = colles;
