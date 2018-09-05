let equipesClasses = (function() {

  let self = {};
  let dataListe = require('../../misc/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */



  // addEventListener pour les boutons déclenchement des modals

  function showAddClasseMatiereForm() {
    document.getElementById('addMatiereForm').setAttribute("data-mode", "ajouter");
    document.getElementById('addMatiereForm').setAttribute("data-idclassematiere", '');
    //liste matiere on enleve l'attribut readonly
    let el2 = document.querySelector('#dataListe2')
    dataListe.readOnly(el2, false);
    //liste professeur
    let el3 = document.querySelector('#dataListe3')
    dataListe.readOnly(el3, false);
    //div formExtraPeriode doit être masquée
    $('#formExtraPeriode').css("display", "none");
    document.getElementById('addMatiereForm').reset();
    $('#addMatiereClasse').modal();
  };


  const buttonAddClasseMatiere = document.getElementById("buttonAddClasseMatiere");
  buttonAddClasseMatiere.addEventListener('click', showAddClasseMatiereForm, false);

  let el1 = document.getElementById('dataListe1')
  dataListe.selectId(el1)
  let el2 = document.getElementById('dataListe2')
  dataListe.selectId(el2)
  let el3 = document.getElementById('dataListe3')
  dataListe.selectId(el3)



  $('#dataListe1Form').submit(function(e) {
    e.preventDefault();
    let el1 = document.getElementById('dataListe1')
    let classe = dataListe.getName(el1)
    let id = dataListe.getId(el1)
    if (classe !== '') {
      // Enabled with:
      $('#buttonAddClasseMatiere').removeClass('disabled').prop('disabled', false);
      buttonAddClasseMatiere.addEventListener('click',showAddClasseMatiereForm,false);
      refreshTableEquipeClasse(classe);
      document.getElementById("showExtra").style.display = "block";
    } else {
      $('#buttonAddClasseMatiere').removeClass('disabled').prop('disabled', true);
      buttonAddClasseMatiere.removeEventListener('click',showAddClasseMatiereForm,false);
      document.getElementById("showExtra").style.display = "none";
    }
  });



  /*
  ********************************************************************
  validation ajout ou modification matiere
  ************************************************************
    */
  $('#addMatiereForm').submit(function(e) {
    e.preventDefault();
    let el1 = document.getElementById('dataListe1')
    let el2 = document.getElementById('dataListe2')
    let el3 = document.getElementById('dataListe3')
    let classe = dataListe.getName(el1);
    let idClasse = dataListe.getId(el1);
    let idMatiere = dataListe.getId(el2);
    let idProfesseur = dataListe.getId(el3);
    let duree = document.getElementById('duree').value;
    let dureeExc = duree; //la duree exc est par defaut égale à la duree de la colle
    let mode = document.getElementById('addMatiereForm').getAttribute("data-mode");
    let idClasseMatiere = '';
    if (mode === 'modifier') {
      idClasseMatiere = document.getElementById('addMatiereForm').getAttribute("data-idclassematiere")
      dureeExc = document.getElementById('dureeExc').value; //on prend en compte la duree exc
    }
    $.post("/admin/addOrModClasseMatiere/", {
      'idClasse': idClasse,
      'idMatiere': idMatiere,
      'idProfesseur': idProfesseur,
      'duree': duree,
      'dureeExc': dureeExc,
      "mode": mode, // mode : ajout ou modification d'une colle
      "idClasseMatiere": idClasseMatiere //utile en cas de modif
    }, (message) => {

      if (message.error !== "ok") {
        $('#error').html(message.error);
        $('#erreur').modal();
      } else {
        document.getElementById('addMatiereForm').reset();
        $('#addMatiereClasse').modal('hide');
        refreshTableEquipeClasse(classe);
      }
    });
  });

  /*
  ********************************************************************
    Suppression d'une matiere
  ************************************************************
    */
  function suppClasseMatiere(idClasseMatiere) {
    let el1 = document.getElementById('dataListe1')
    let classe = dataListe.getName(el1);
    $.post("/admin/suppClasseMatiere/", {
      "idClasseMatiere": idClasseMatiere
    }, (message) => {
      refreshTableEquipeClasse(classe);
    })
  }


  /*
  **************************
        Script pour afficher une classe
   **************************
   */
  function formatColleurs(d) {
    // `d` is the original data object for the row
    let table = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    for (let i = 0; i < d.nomColleur.length; i++) {
      table +=
        '<tr>' +
        '<td>colleur :</td>' +
        '<td>' + d.nomColleur[i] + ' ' + d.prenomColleur[i] + '</td>' +
        '</tr>';
    }

    table += '</table>';
    return table;
  };

  function initDataTablesEquipeClasse() {
    let liste = [];
    let table = $('#tableEquipeClasse').DataTable({
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
          data: 'dureeExc'
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
          render: function(data, type, row) {
            if (data.nomColleur.length > 0) {
              return '<a href="" class="editor_modif">Edit</a>'
            }
            return '<a href="" class="editor_modif">Edit</a>/<a href="" class="editor_supp">Supp</a>'
          },
        },
      ],
    });


    // Edit record
    $('#tableEquipeClasse').on('click', 'a.editor_modif', function(e) {
      e.preventDefault();
      let tr = $(this).closest('tr');
      let row = table.row(tr);
      let element = row.data();
      let idClasseMatiere = element.idClasseMatiere;
      let duree = element.duree;
      let dureeExc = element.dureeExc;
      let nom = element.nom;
      let prenom = element.prenom;
      let matiere = element.matiere;
      let extraPeriode = element.extraPeriode;
      console.log('edit',  extraPeriode);
      // utiliser un data-action='modifier' ou data-action='supprimer'
      document.getElementById('addMatiereForm').setAttribute("data-mode", "modifier");
      document.getElementById('addMatiereForm').setAttribute("data-idclassematiere", idClasseMatiere);
      let el2 = document.querySelector('#dataListe2')
      dataListe.readOnly(el2, true);
      dataListe.setName(el2, matiere);
      //liste professeur
      let el3 = document.querySelector('#dataListe3')
      dataListe.readOnly(el3, true);
      dataListe.setName(el3, nom + ' ' + prenom);
      $(document.getElementById('duree')).val(duree);
      $(document.getElementById('dureeExc')).val(dureeExc);
      console.log(extraPeriode);
      if (extraPeriode === true) {
        $('#formExtraPeriode').css("display", "block");
      } else {
        $('#formExtraPeriode').css("display", "none");
      }
      $('#addMatiereClasse').modal();
    });

    // Supp record
    $('#tableEquipeClasse').on('click', 'a.editor_supp', function(e) {
      e.preventDefault();
      let tr = $(this).closest('tr');
      let row = table.row(tr);
      let element = row.data();
      let idClasseMatiere = element.idClasseMatiere;
      suppClasseMatiere(idClasseMatiere);
    });

    $('#tableEquipeClasse tbody').on('click', 'td.details-control', function() {
      let tr = $(this).closest('tr');
      let row = table.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(formatColleurs(row.data())).show();
        tr.addClass('shown');
      }
    });

    //coluonne extra période non visible pat defaut
    table.columns(3).visible(false);
  };


  /*
  **************************
      mise à jour de la table
   **************************
   */

  function refreshTableEquipeClasse(classe) {
    $.post("/admin/tableEquipeClasseJSON/", {
      'classe': classe
    }, (data) => {
      let table = $('#tableEquipeClasse').DataTable();
      let button = document.getElementById('buttonAddSuppPeriode');
      if (data.length !== 0) {
        if (data[0].extraPeriode === false || typeof data[0].extraPeriode === 'undefined') {
          table.columns(3).visible(false);
          button.setAttribute("data-action", "ajouter");
          button.innerHTML = 'Ajouter une période';
          document.getElementById("defExtraPeriode").style.display = "none";

        } else {
          table.columns(3).visible(true);
          button.setAttribute("data-action", "supprimer");
          button.innerHTML = 'Supprimer la période';
          $('#datetimepicker7').find("input").val(moment(data[0].debutPeriode).format('DD/MM/YYYY'));
          $('#datetimepicker8').find("input").val(moment(data[0].finPeriode).format('DD/MM/YYYY'));
          document.getElementById("defExtraPeriode").style.display = "block";
        }
      }

      table.clear().draw();
      table.rows.add(data); // Add new data
      table.columns.adjust().draw(); // Redraw the DataTable
    });
  };

  /*
  **************************
      Bouton pour ajouter ou supprimer extraPeriode
   **************************
   */
  $('#buttonAddSuppPeriode').click(function() {
    let table = $('#tableEquipeClasse').DataTable();
    let action = this.getAttribute("data-action");
    let extraPeriode;
    if (action === 'ajouter') {
      table.columns(3).visible(true);
      extraPeriode = true;
      document.getElementById("defExtraPeriode").style.display = "block";
      console.log('app');
      document.getElementById("formExtraPeriode").style.display = "block";
      this.setAttribute("data-action", "supprimer");
      this.innerHTML = 'Supprimer la période';
    } else {
      table.columns(3).visible(false);
      extraPeriode = false;
      document.getElementById("defExtraPeriode").style.display = "none";
      console.log('disp');
      document.getElementById("formExtraPeriode").style.display = "none";
      this.setAttribute("data-action", "ajouter");
      this.innerHTML = 'Ajouter une période';
    }
    let el1 = document.getElementById('dataListe1');
    let idClasse = dataListe.getId(el1);
    $.post("/admin/changeExtraPeriode/", {
      'idClasse': idClasse,
      'extraPeriode': extraPeriode,
    }, () => {
      //on remet a jour la table pour prendre en compte le nouveau statut extraPeriode
      let el1 = document.getElementById('dataListe1')
      let classe = dataListe.getName(el1);
      refreshTableEquipeClasse(classe)
    });
  });



  $('#datetimepicker7').datetimepicker({
    format: 'L',
  });
  $('#datetimepicker8').datetimepicker({
    format: 'L',
    useCurrent: false
  });
  $("#datetimepicker7").on("change.datetimepicker", function(e) {
    $('#datetimepicker8').datetimepicker('minDate', e.date);
  });
  $("#datetimepicker8").on("change.datetimepicker", function(e) {
    $('#datetimepicker7').datetimepicker('maxDate', e.date);
  });


// validation des dates
  $('#defExtraPeriodeForm').submit(function(e) {
    e.preventDefault();
    let debutPeriode = $('#datetimepicker7').find("input").val();
    let finPeriode = $('#datetimepicker8').find("input").val();
    let el1 = document.getElementById('dataListe1');
    let idClasse = dataListe.getId(el1);
    $.post("/admin/defExtraPeriode/", {
      'idClasse': idClasse,
      'debutPeriode': debutPeriode,
      'finPeriode': finPeriode,
    }, () => {});
  });


  /*
  ********************************************************************
    Gestion des events change tab
  ************************************************************
    */
  $('[href="#1a2sa"]').on('hidden.bs.tab', function (e) {
    let el1 = document.getElementById('dataListe1') //liste des Classes
    $('#dataListe1Form')[0].reset();
    $('#tableEquipeClasse').DataTable().clear().draw();
    $('#buttonAddClasseMatiere').removeClass('disabled').prop('disabled', true);
    buttonAddClasseMatiere.removeEventListener('click',showAddClasseMatiereForm,false);
    document.getElementById("showExtra").style.display = "none";
  });



  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    initDataTablesEquipeClasse();
  }

  return self;
})();


module.exports = equipesClasses;
