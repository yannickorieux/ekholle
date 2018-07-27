let colles = (function() {

  let self = {};
  let idProfesseur =  document.body.getAttribute("data-idprofesseur");
  let dataListe = require('../dataListe/dataListe.js');


  /*
  ********************************************************************
        PRIVE
  ************************************************************
********************************************************************
      Choix de l'élève et de la colle à partir d'une dataListe
************************************************************
    */


  let el1 = document.getElementById('dataListe1') //liste des collesClasse du professeur
  dataListe.selectId(el1)
  let el2 = document.getElementById('dataListe2') //liste des élèves
  dataListe.selectId(el2)


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
          $('#tabGestionColles').css("display", "block");
          refreshTableColle(idColle);
        } else {
          $('#tabGestionColles').css("display", "none");
        }
      });
    }
  });



  /*
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  Validation du formulaire pour ajouterModifier  une colle **
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  */

  $('#addColleForm').submit(function(e) {
    e.preventDefault();
    let el1 = document.getElementById('dataListe1')
    let idMatiereColle = dataListe.getId(el1);
    let el2 = document.getElementById('dataListe2')
    let idEleve = dataListe.getId(el2);
    let date = document.getElementById('dateColle').value;
    let el6 = document.getElementById('dataListe6')
    let note = dataListe.getNote(el6);
    let sujet = document.getElementById('sujet').value;
    let obsCoordo = document.getElementById('obsCoordo').value;
    let obsEleve = document.getElementById('obsEleve').value;
    let mode = document.getElementById('addColleForm').getAttribute("data-mode");
    let idColle = '';
    if (mode === 'modifier') {
      idColle = document.getElementById('addColleForm').getAttribute("data-idcolle")
    }
    $.post("/professeur/addOrModColle/", {
      "date": date,
      "idEleve": idEleve,
      "idMatiereColle": idMatiereColle,
      "idProfesseur": idProfesseur,
      "note": note,
      "sujet": sujet,
      "obsCoordo": obsCoordo,
      "obsEleve": obsEleve,
      "mode": mode, // mode : ajout ou modification d'une colle
      "idColle": idColle //utile en cas de modif
    }, () => {
      let el1 = document.getElementById('dataListe1');
      let idColle = dataListe.getId(el1);
      $('#addColleModal').modal('hide');
      //on rafraichit la table
      refreshTableColle(idMatiereColle);
    });
  });



  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */
  refreshTableColle = function(idMatiereColle) {
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
  suppColle = function(idMatiereColle, idColle) {
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
    liste = []
    $.fn.dataTable.moment('DD/MM/YYYY');
    let table = $('#tableColles').DataTable({
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

      columns: [
        {
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return data.nom + ' ' + data.prenom;
          },
        },
        {
          data: 'note'
        },
        {
          data: 'date'
        },
        {
          data: 'sujet'
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
    });


    // Edit record
    $('#tableColles').on('click', 'a.editor_modif', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      let idColle = element.idColle;
      let nom = element.nom;
      let note = element.note;
      let date = element.date;
      let sujet = element.sujet;
      let obsEleve = element.obsEleve;
      let obsCoordo = element.obsCoordo;
      // utiliser un data-action='modifier' ou data-action='supprimer'
      document.getElementById('addColleForm').setAttribute("data-mode", "modifier");
      document.getElementById('addColleForm').setAttribute("data-idcolle", idColle);
      let el2 = document.getElementById('dataListe2')
      dataListe.readOnly(el2, true);
      dataListe.setName(el2, nom);
      $(document.getElementById('dateColle')).val(date);
      $(document.getElementById('sujet')).val(sujet);
      $(document.getElementById('obsEleve')).val(obsEleve);
      $(document.getElementById('obsCoordo')).val(obsCoordo);
      let el6 = document.getElementById('dataListe6')
      dataListe.setLaNote(el6,note);

      $('#addColleModal').modal();
    });

    // Supp record
    $('#tableColles').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      suppColle(element.idMatiereColle,  element.idColle);
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
        PUBLIC
  ************************************************************
  */


  self.init = () => {
    //$('#addColleModal').on('shown.bs.modal', function() {
    //   $('.summernote').summernote({
    //     toolbar: [
    //       ['style', ['bold', 'italic', 'underline', 'strike']],
    //       ['para', ['ul', 'ol']],
    //     ],
    //     styleWithSpan: false,
    //   });
    // })
    getListeColles();
    initDataTables();
  };


  return self;

})();

module.exports = colles;
