/*
**************************
      Script pour parametrer  les colles et classes du colleur
 **************************
 */

let paramCollesClasses = (function() {
  let self = {};
  let idProfesseur = $('body').data("idprofesseur")
  let dataListe = require('../dataListe/dataListe.js');


  /********************************************************************
        Choix de l'élève et de la colle à partir d'une dataListe
  ************************************************************
      */
      let el3=document.getElementById('dataListe3') //liste des classes
      dataListe.selectId(el3);
      let el4=document.getElementById('dataListe4') //liste des classesmatieres
      dataListe.selectId(el4);


  /*
  ********************************************************************
        PRIVE
  ************************************************************

  ********************************************************************
        Choix de la classe pour ensuite choisir la matière dans modal form
  ************************************************************
        */
  $('#dataListe3Select').on('change', function() {
    let classe = dataListe.getName(el3)
    let idClasse = dataListe.getId(el3)
    if (classe != '') {
      $('.choixMatiere').css("display", "block");
    } else {
      $('.choixMatiere').css("display", "none");
    }
    $.post("/professeur/listeMatiereClasseJSON/", {
      'idClasse': idClasse,
    }, (data) => {
      let el=document.getElementById('dataListe4')
      dataListe.setDataListe(el,data);
    });
  });





  /*
  ********************************************************************
        Validation du formulaire pour creer une matiere pour le colleur
  ************************************************************
        */
  $('#addClasseForm').submit(function(e) {
    e.preventDefault();
    let el=document.getElementById('dataListe4')
    let idClasseMatiere = dataListe.getId(el)
    $.post("/professeur/addMatiereProfesseurJSON/", {
      'idProfesseur': idProfesseur,
      'idClasseMatiere': idClasseMatiere,
    }, (message) => {
      if (message.error !== "ok") {
        $('#error').html(message.error);
        $('#erreur').modal();
      } else {
        $('#addClasseProfesseur').modal('hide');
        self.displayTable();
      }
      document.getElementById('addClasseForm').reset();
    });
  });


  function getListeClasses() {
    //Mettre à jour la liste des classes

    $.get("/admin/tableClassesJSON/", (data) => {
      let el3=document.getElementById('dataListe3')
      dataListe.setDataListe(el3,data);
    });
  }


  function afficheMesCollesClasses(data) {
    let liste = data;
    if (typeof liste === 'undefined') {
      liste = []
    };
    let table = $('#tableMesCollesClasses').DataTable({

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
          data: 'classe'
        },
        {
          data: 'matiere'
        },
        {
          data: 'professeur'
        },
        {
          data: 'duree'
        },
      ],
    });

    table.clear().draw();
    table.rows.add(liste); // Add new data
    table.columns.adjust().draw(); // Redraw the DataTable
  };


  /*
  ********************************************************************
        PUBLIC
  ************************************************************
        */



  self.displayTable = function() {
    $.post("/professeur/tableMesCollesClassesJSON/", {
      'idProfesseur': idProfesseur,
    }, (data) => {
      afficheMesCollesClasses(data);
      let el4=document.getElementById('dataListe4') //liste des classes professeurs
      dataListe.setDataListe(el4, data);
    });
  };


  self.init = () => {
    getListeClasses();
  }

  return self;
})();

module.exports = paramCollesClasses;
