/*
**************************
      Script pour parametrer  les colles et classes du colleur
 **************************
 */

let paramCollesClasses = (function() {
  let self = {};
  let idProfesseur = $('body').data("idprofesseur")
  let dataListe = require('../misc/dataListe.js');


  /********************************************************************
        Choix de l'élève et de la colle à partir d'une dataListe
  ************************************************************
      */
  let el3 = document.getElementById('dataListe3') //liste des classes
  dataListe.selectId(el3);
  let el4 = document.getElementById('dataListe4') //liste des classesmatieres
  dataListe.selectId(el4);


  /*
  ********************************************************************
        PRIVE
  ************************************************************

  ********************************************************************
        Choix de la classe pour ensuite choisir la matière dans modal form
  ************************************************************
        */
  $('#dataListe3Form').submit(function(e) {
    e.preventDefault();
    let classe = dataListe.getName(el3);
    let idClasse = dataListe.getId(el3);
    $.post("/professeur/listeMatiereClasseJSON/", {
      'idClasse': idClasse,
    }, (data) => {
      console.log(data);
      let el4 = document.getElementById('dataListe4')
      dataListe.setDataListe(el4, data);
      dataListe.display(el4, true);
    });
  });





  /*
  ********************************************************************
        Validation du formulaire pour creer une matiere pour le colleur
  ************************************************************
        */
  $('#addClasseForm').submit(function(e) {
    e.preventDefault();
    let classe = dataListe.getName(el3);
    let idClasse = dataListe.getId(el3);
    let e4 = document.getElementById('dataListe4')
    let idClasseMatiere = dataListe.getId(e4)
    $.post("/professeur/addClasseMatiereColleur/", {
      'idClasse': idClasse,
      'idProfesseur': idProfesseur,
      'idClasseMatiere': idClasseMatiere,
    }, (message) => {
      if (message.error !== "ok") {
        $('#error').html(message.error);
        $('#erreur').modal();
      } else {
        $('#addClasseProfesseur').modal('hide');
        refreshTableMesCollesClasses();
      }
      dataListe.display(el4, false);
      document.getElementById('addClasseForm').reset();
    });
  });


  function getListeClasses() {
    //Mettre à jour la liste des classes

    $.get("/admin/tableClassesJSON/", (data) => {
      let el3 = document.getElementById('dataListe3')
      dataListe.setDataListe(el3, data);
    });
  }


  function initDataTablesMesCollesClasses() {
    let liste = [];
    let table = $('#tableMesCollesClasses').DataTable({
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
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return data.nom + ' ' + data.prenom;
          },
        },
        {
          data: 'duree'
        },
        {
          data: 'totalColles'
        },
        {
          data: null,
          className: "center",
          render: function(data, type, row) {
            if (data.totalColles>0){
              return ''
            }
            else{
            return '<a href="" class="editor_supp">Supp</a>'}
          },
        },
      ],
    });

    // Supp record
    $('#tableMesCollesClasses').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      idClasseMatiereColleur = element.idClasseMatiereColleur;
      idClasseMatiere = element.idClasseMatiere;
      suppClasseMatiereColleur(idClasseMatiere, idClasseMatiereColleur );
    });
  };



  /*
  ********************************************************************
    Suppression d'une matiere
  ************************************************************
    */
  function suppClasseMatiereColleur(idClasseMatiere, idClasseMatiereColleur) {
    console.log(idClasseMatiere, idClasseMatiereColleur);

    $.post("/professeur/suppClasseMatiereColleur/", {
        "idClasseMatiere": idClasseMatiere,
        "idClasseMatiereColleur": idClasseMatiereColleur
    }, (message) => {
      refreshTableMesCollesClasses();
    })
  }


  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */
   function refreshTableMesCollesClasses() {
    $.post("/professeur/tableMesCollesClassesJSON/", {
      'idProfesseur': idProfesseur,
    }, (data) => {
      let table = $('#tableMesCollesClasses').DataTable({  retrieve: true,})
      table.clear().draw();
      table.rows.add(data); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable
      let el1 = document.getElementById('dataListe1') //liste des colles du professeur
      dataListe.setDataListe(el1, data); //on met a jour la dataliste
      let el4 = document.getElementById('dataListe4') // on masque la liste des matieres/classes
      dataListe.display(el4, false); // on la masque
    });
  }


  /*
  ********************************************************************
        PUBLIC
  ************************************************************
        */






  self.init = () => {
    getListeClasses();
    initDataTablesMesCollesClasses();
    refreshTableMesCollesClasses ();
  }

  return self;
})();

module.exports = paramCollesClasses;
