let professeur = (function() {

  let self = {};
  let idProfesseur = document.body.getAttribute("data-idprofesseur");
  let dataListe = require('./dataListe/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */

  function menu() {

    //parametrage colleur - professeur
    let paramCollesClasses = require('./professeur/paramCollesClasses.js');
    //affichage du decompte
    let decompteHeures = require('./professeur/decompteHeures.js');

    $('#navColles').on('click', function() {
      $(".visible").css("display", "none");
      $("#showColles").css("display", "block");
    });

    $('#navParam').on('click', function() {
      $(".visible").css("display", "none");
      paramCollesClasses.refreshTableMesCollesClasses();
      $("#showParam").css("display", "block");
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      let id=this.getAttribute("href");
      if(id==='#3ac'){
        decompteHeures.refreshTableDecompteHeures()
      }
    });


    $('#navCompte').on('click', function() {
      $(".visible").css("display", "none");
      $("#modifyPassword").css("display", "block");
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
      document.getElementById('dateSaisie').innerHTML=moment().format('L')
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

    let el7 = document.querySelector('#dataListe7') //liste des classes matières du coordonateur de discipline
    dataListe.set(el7, {
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
