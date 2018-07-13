let colles = (function() {
  let self = {};
  let idProfesseur = $('body').data("idprofesseur")
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
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  Validation du formulaire pour ajouter une colle **
  ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
  */
  addColleForm = function() {
    $('#addColleForm').submit(function(e) {
      e.preventDefault();
      let el1 = document.getElementById('dataListe1')
      let idColle = dataListe.getId(el1);
      let el2 = document.getElementById('dataListe2')
      let idEleve = dataListe.getId(el2);
      let date = document.getElementById('dateColle').value;
      let note = document.getElementById('note').value;
      let sujet = document.getElementById('sujet').value;;
      $.post("/professeur/addColleJSON/", {
        "date": date,
        "idEleve": idEleve,
        "idColle": idColle,
        "idProfesseur": idProfesseur,
        "note": note,
        "sujet": sujet,
      }, () => {
        let el1 = document.getElementById('dataListe1')
        let idColle = dataListe.getId(el1);
        let colle = dataListe.getName(el1);
        document.getElementById('addColleForm').reset()
        $('#addColle').modal('hide');
        self.displayColles(idColle);
      });
    });
  }


  /*
  ********************************************************************
        Choix d'une matiere pour le colleur et récupération de la liste des élèves
  ************************************************************
        */
  colleSelect = function() {
    $('#dataListe1Form').submit(function(e) {
      e.preventDefault();
      let el1 = document.getElementById('dataListe1') //liste des collesClasse du professeur
      let colle = dataListe.getName(el1);
      let idColle = dataListe.getId(el1);
      if(idColle !='' && typeof idColle !=='undefined'){
        $.post("/professeur/listeElevesJSON/", {
          'idColle': idColle,
        }, (data) => {
          let el2 = document.getElementById('dataListe2')
          dataListe.setDataListe(el2, data);
          if (colle != '') {
            $('#tabGestionColles').css("display", "block");
            self.displayColles(idColle);
          } else {
            $('#tabGestionColles').css("display", "none");
          }
        });
      }
    });
  }



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
  function afficheTableColles(data) {

    let liste = data;
    if (typeof liste === 'undefined') {
      liste = []
    };

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

      columns: [{
          data: 'nom'
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
          data: null,
          className: "center",
          defaultContent: '<a href="" class="editor_supp">Edit</a>'
        }
      ],
    });

    table.clear().draw();
    table.rows.add(liste); // Add new data
    table.columns.adjust().draw(); // Redraw the DataTable

    // Edit record
    $('#tableColles').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      console.log($(this).closest('tr'));
      // utiliser un data-action='modifier' ou data-action='supprimer'
      $('#addColle').modal();
    });

  };


  /*
  ********************************************************************
        PUBLIC
  ************************************************************
        */


  self.init = () => {
    getListeColles();
    addColleForm();
    colleSelect();
  };

  self.displayColles = function(idMatiere) {
    $.post("/professeur/tableCollesJSON/", {
      'idMatiere': idMatiere,
    }, (data) => {
      afficheTableColles(data);
    });
  };

  return self;

})();

module.exports = colles;
