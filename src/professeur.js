let professeur = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let dataListe = require('./misc/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */

  function menu() {

    //affichage du decompte
    let decompteHeures = require('./professeur/decompteHeures.js');

    $('#navColles').on('click', function() {
      $(".visible").css("display", "none");
      $("#showColles").css("display", "block");
    });

    $('#navParam').on('click', function() {
      $(".visible").css("display", "none");
      $("#showParam").css("display", "block");
    });


    $('#navCompte').on('click', function() {
      $(".visible").css("display", "none");
      $("#modifyPassword").css("display", "block");
    });

    $('#navHelp').on('click', function() {
      $(".visible").css("display", "none");
      $("#showHelp").css("display", "block");
    });


  }

  /*
  ********************************************************************
    Obtention de la liste de mes classes en tant que coordo
  ************************************************************
    */
  function getListeClassesCoordo() {
    $.post("/professeur/tableClassesCoordoJSON/", {
      'idProfesseur': idProfesseur,
    }, (data) => {
      let el5 = document.getElementById('dataListe5')
      dataListe.setDataListe(el5, data);
      let el7 = document.getElementById('dataListe7')
      dataListe.setDataListe(el7, data);
      let el8 = document.getElementById('dataListe8')
      dataListe.setDataListe(el8, data);
    });
  }


//   $('.summernote').summernote({
//   minHeight: 150,
//   placeholder: ' ...',
//   focus: false,
//   airMode: false,
//   fontNames: ['Roboto', 'Calibri', 'Times New Roman', 'Arial'],
//   fontNamesIgnoreCheck: ['Roboto', 'Calibri'],
//   dialogsInBody: true,
//   dialogsFade: true,
//   disableDragAndDrop: false,
//   toolbar: [
//     // [groupName, [list of button]]
//     ['para', ['style', 'ul', 'ol', 'paragraph']],
//     ['fontsize', ['fontsize']],
//     ['insert', ['link', 'hr']],
//     ['misc', ['undo', 'redo', 'print', 'help', 'fullscreen']]
//   ],
//   popover: {
//     air: [
//       ['color', ['color']],
//       ['font', ['bold', 'underline', 'clear']]
//     ]
//   },
//   print: {
//     //'stylesheetUrl': 'url_of_stylesheet_for_printing'
//   }
// });

  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    $('.summernote').summernote({
      height: 100,
       dialogsInBody: true,
      toolbar: [
        ['style', ['bold', 'italic', 'underline', 'strike']],
        ['para', ['ul', 'ol']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert', ['link', 'hr']],
        ['misc', ['undo', 'redo', 'print', 'help', 'fullscreen']]
      ],
      styleWithSpan: false,
    });


    // addEventListener pour les boutons déclenchant les modals
    //
    document.getElementById("buttonAddClasse").addEventListener('click', function() {
      document.getElementById('addClasseForm').reset();
      let el4 = document.querySelector('#dataListe4') //liste des matières   partialsParamColles/formAddColleClasse
      dataListe.display(el4,false);
      $('#addClasseProfesseur').modal();
    });

    document.getElementById("buttonAddColle").addEventListener('click', function() {
      document.getElementById('addColleForm').setAttribute("data-mode", "ajouter");
      document.getElementById('addColleForm').setAttribute("data-idcolle", '');
      let el2 = document.getElementById('dataListe2')
      dataListe.readOnly(el2, false);
      document.getElementById('addColleForm').reset();
      $(document.getElementById('obsEleve')).summernote('code','');
      $(document.getElementById('obsCoordo')).summernote('code', '');
      document.getElementById('dateSaisie').innerHTML=moment().format('L')
      $('#addColleModal').modal();
    });

    document.getElementById("buttonAddProgramme").addEventListener('click', function() {
      document.getElementById('addProgrammeForm').setAttribute("data-mode", "ajouter");
      document.getElementById('addProgrammeForm').setAttribute("data-idprogramme", '');
      document.getElementById('addProgrammeForm').reset();
      $(document.getElementById('detailProg')).summernote('code','');
      $('#addProgrammeModal').modal();
    });

    //on initialise les dataListes
    let el1 = document.querySelector('#dataListe1') //liste des colles/classe  du professeur : addColles
    dataListe.set(el1, {
      'form': true
    });

    let el2 = document.querySelector('#dataListe2') //liste des élèves formAddColle
    dataListe.set(el2);

    let el3 = document.querySelector('#dataListe3') //liste des classes partialsParamColles/formAddColleClasse
    dataListe.set(el3, {
      'form': true
    });
    let el4 = document.querySelector('#dataListe4') //liste des matières   partialsParamColles/formAddColleClasse
    dataListe.set(el4, {
      'display': false
    });

    let el5 = document.querySelector('#dataListe5') //liste des classes matières du coordonateur de discipline
    dataListe.set(el5, {
      'form': true
    });

    let el6 = document.querySelector('#dataListe6') //liste des notes
    dataListe.setNotes(el6);

    let el7 = document.querySelector('#dataListe7') //liste des classes matières du coordonateur de discipline
    dataListe.set(el7, {
      'form': true
    });

    let el8 = document.querySelector('#dataListe8') //liste des classes matières du coordonateur de discipline
    dataListe.set(el8, {
      'form': true
    });

    //liste des Periodes
    let el9 = document.querySelector('#dataListe9')
    dataListe.set(el9, {
      'form': true
    });

    $('input').clearer(); //permet de réinitialiser les input

    //remplir la dataliste du coordo
    getListeClassesCoordo()
    //parametrage colleur - professeur
    let paramCollesClasses = require('./professeur/paramCollesClasses.js');
    paramCollesClasses.init();
    //parametrage mesClasse
    let paramMesClasses = require('./professeur/paramMesClasses.js');
    paramMesClasses.init();
    //gestion des colles
    let colles = require('./professeur/colles.js');
    colles.init();
    let synthese = require('./professeur/synthese.js');
    synthese.init();
    let resultats = require('./professeur/resultats.js');
    resultats.init();
    let programme = require('./professeur/programme.js');
    programme.init();
    let decompteHeures = require('./professeur/decompteHeures.js');
    decompteHeures.init();

    menu();
    //picker pour addColle
    $('#datetimepicker1').datetimepicker({
      format: 'L'
    });
  }

  return self;
})();


module.exports = professeur;
