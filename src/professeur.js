let professeur = (function() {

  let self = {};
  let dataListe = require('./dataListe/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */

  function menu() {

    //parametrage colleur - professeur
    let paramCollesClasses = require('./professeur/paramCollesClasses.js');

    $('#navColles').on('click', function() {
      $(".visible").css("display", "none");
      $("#showColles").css("display", "block");
    });

    $('#navParam').on('click', function() {
      $(".visible").css("display", "none");
      paramCollesClasses.refreshTableMesCollesClasses();
      $("#showParam").css("display", "block");
    });

    $('#navCompte').on('click', function() {
      $(".visible").css("display", "none");
      $("#modifyPassword").css("display", "block");
    });

  }

  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
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
      $('#addColleModal').modal();
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


    $('input').clearer(); //permet de réinitialiser les input
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
    //paramCollesClasses.init();
    menu();
    $('#datetimepicker1').datetimepicker({
      format: 'L'
    });
  }

  return self;
})();


module.exports = professeur;
