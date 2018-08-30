let professeur = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let profilProfesseur = document.body.getAttribute("data-profil");
  let dataListe = require('./misc/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */

  function menu() {

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
      dataListe.display(el4, false);
      $('#addClasseProfesseur').modal();
    });



    /*
    Gestion des events pour le coordo
    */

    if (profilProfesseur === 'coordonnateur') {
      // permet au coordo de déclencher l'ajout d'un colleur
      document.getElementById("buttonAddColleur").addEventListener('click', function() {
      document.getElementById('addColleurForm').reset();
      $('#addColleurClasse').modal();
      });

      // permet de déclencher l'ajout d'un programme
      document.getElementById("buttonAddProgramme").addEventListener('click', function() {
        document.getElementById('addProgrammeForm').setAttribute("data-mode", "ajouter");
        document.getElementById('addProgrammeForm').setAttribute("data-idprogramme", '');
        document.getElementById('addProgrammeForm').reset();
        $(document.getElementById('detailProg')).summernote('code', '');
        $('#addProgrammeModal').modal();
      });

    }

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

    if (profilProfesseur === 'coordonnateur') {
      let el5 = document.querySelector('#dataListe5') //liste des classes matières du coordonateur de discipline
      dataListe.set(el5, {
        'form': true
      });
    }

    let el6 = document.querySelector('#dataListe6') //liste des notes
    dataListe.setNotes(el6);


    if (profilProfesseur === 'coordonnateur') {
      let el7 = document.querySelector('#dataListe7') //liste des classes matières du coordonateur de discipline
      dataListe.set(el7, {
        'form': true
      });

      let el8 = document.querySelector('#dataListe8') //liste des classes matières du coordonateur de discipline
      dataListe.set(el8, {
        'form': true
      });
    }
    //liste des Periodes
    let el9 = document.querySelector('#dataListe9')
    dataListe.set(el9, {
      'form': true
    });


    // dataliste pour ajouter des colleurs à un coordo
    if (profilProfesseur === 'coordonnateur') {
      let el10 = document.querySelector('#dataListe10') //liste des professeurs
      dataListe.set(el10);
      let el11 = document.querySelector('#dataListe11') //liste des matières  du coordo de discipline
      dataListe.set(el11);
    }


    $('input').clearer(); //permet de réinitialiser les input


    //parametrage colleur - professeur
    let paramCollesClasses = require('./professeur/paramCollesClasses.js');
    paramCollesClasses.init();

    //gestion des colles
    let colles = require('./professeur/colles.js');
    colles.init();

    let programme = require('./professeur/programme.js');
    programme.init();

    let decompteHeures = require('./professeur/decompteHeures.js');
    decompteHeures.init();


    if (profilProfesseur === 'coordonnateur') {
      //remplir la dataliste du coordo
      getListeClassesCoordo()
      //parametrage mesClasse
      let paramMesClasses = require('./professeur/paramMesClasses.js');
      // parametrage classes coordo
      paramMesClasses.init();
      //colles synthese coordo
      let synthese = require('./professeur/synthese.js');
      synthese.init();
      //colles resultats coordo
      let resultats = require('./professeur/resultats.js');
      resultats.init();

      let addProgramme = require('./professeur/addProgramme.js');
      addProgramme.init();
    }

    menu();
    //picker pour addColle
    $('#datetimepicker1').datetimepicker({
      sideBySide: true,
      stepping : 30,
    });
  }

  return self;
})();


module.exports = professeur;
