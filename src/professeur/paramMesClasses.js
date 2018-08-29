/*
**************************
      Script onglet parametrage  les classes coordo
 **************************
 */

let paramMesClasses = (function() {
  let self = {};
  let idProfesseur = $('body').data("idprofesseur")
  let dataListe = require('../misc/dataListe.js');



  /*
  ********************************************************************
        PRIVE
  ************************************************************
*/

  let el10 = document.getElementById('dataListe10')
  let el11 = document.getElementById('dataListe11')
  dataListe.selectId(el11);
  /*
     **************************
          daliste professeurs
      **************************
      */
  $.get("/admin/tableProfesseursJSON/", (data) => {
    //on met à jour les datalistes correspondantes
    dataListe.setDataListe(el10, data);
    dataListe.selectId(el10);
  });



  /*
    ********************************************************************
          Choix de la classe pour ensuite choisir la matière dans modal form
    ************************************************************
          */




  $('#addColleurForm').submit(function(e) {
    e.preventDefault();
    let el10 = document.getElementById('dataListe10')
    let el11 = document.getElementById('dataListe11')
    let professeur = dataListe.getName(el10);
    let idProfesseur = dataListe.getId(el10);
    let idClasseMatiere = dataListe.getId(el11);
    $.post("/professeur/addColleur/", {
      'idProfesseur': idProfesseur,
      'idClasseMatiere': idClasseMatiere,
    }, (message) => {
      if (message.error !== "ok") {
        $('#error').html(message.error);
        $('#erreur').modal();
      } else {
        $('#addColleurClasse').modal('hide');
        refreshTableMesClasses();
      }
      $('#addColleurForm')[0].reset();
      $("#addColleurForm input[type=hidden]").val('');
    });
  });


  function initDataTablesMesClasses() {
    let liste = []
    let table = $('#tableMesClasses').DataTable({
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
          data: null,
          render: function(data, type, row) {
            // Combine the first and last names into a single table field
            return data.nom + ' ' + data.prenom;
          },
        },
        {
          data: 'totalColles'
        },
        {
          data: null,
          render: function(data, type, row) {
            if (data.totalColles > 0) {
              return 'X'
            } else {
              return '<a href="" class="editor_supp">Supp</a>'
            }
          },
        },
      ],
      columnDefs: [{
        className: 'text-center',
        targets: [3, 4]
      }, ],
    });

    // Supp record
    $('#tableMesClasses').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      let element = row.data();
      let idClasseMatiereColleur = element.idColleur;
      let idClasseMatiere = element.idClasseMatiere;
      suppClasseMatiereColleur(idClasseMatiere, idClasseMatiereColleur);
    });
  };



  /*
  ********************************************************************
    Suppression d'une matiere colleur
  ************************************************************
    */
  function suppClasseMatiereColleur(idClasseMatiere, idClasseMatiereColleur) {
    $.post("/professeur/suppClasseMatiereColleur/", {
      "idClasseMatiere": idClasseMatiere,
      "idClasseMatiereColleur": idClasseMatiereColleur
    }, (message) => {
      refreshTableMesClasses();
    })
  }


  /*
  ********************************************************************
    Mise à jour de la table des colles
  ************************************************************
    */
  function refreshTableMesClasses() {
    $.post("/professeur/tableMesClassesJSON/", {
      'idProfesseur': idProfesseur,
    }, (data) => {
      $('#tableMesClasses').DataTable().clear().draw();
      $('#tableMesClasses').DataTable().rows.add(data); // Add new data
      $('#tableMesClasses').DataTable().columns.adjust().draw(); // Redraw the DataTable
    });
  }




  function getListeClassesMatieresCoordo() {
    $.post("/professeur/listeClassesMatieresCoordoJSON/", {
      'idProfesseur': idProfesseur
    }, (data) => {
      console.log(data);
      let el11 = document.getElementById('dataListe11')
      dataListe.setDataListe(el11, data); //on peuple les classes
    });
  }

  /*
  ********************************************************************
        PUBLIC
  ************************************************************
        */




  self.init = () => {
    getListeClassesMatieresCoordo()
    initDataTablesMesClasses();
    refreshTableMesClasses();
  }

  return self;
})();

module.exports = paramMesClasses;
