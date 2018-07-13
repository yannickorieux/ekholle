let professeur = (function() {

  let self = {};
  let dataListe = require('./dataListe/dataListe.js');
  /*
  **************************
        PRIVATE
   **************************
   */

function menu(){

   //parametrage colleur - professeur
   let paramCollesClasses = require('./professeur/paramCollesClasses.js');

   $('#navColles').on('click', function() {
     $(".visible").css("display", "none");
     $("#showColles").css("display", "block");
   });

   $('#navParam').on('click', function() {
     // on commence par afficher la liste des heures de colle du professeur
     $(".visible").css("display", "none");
     paramCollesClasses.displayTable();
     $("#showParam").css("display", "block");
   });

 }

  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function(){
    document.getElementById("modalAddClasse").addEventListener('click', function() {
      $('#addClasseProfesseur').modal();
    });

    document.getElementById("modalAddColle").addEventListener('click', function() {
      $('#addColle').modal();
    });

    //on initialise les dataListes
    let el1 = document.querySelector('#dataListe1') //liste des colles/classe  du professeur : addColles
    dataListe.set(el1 , { 'form' : true});
    let el2 = document.querySelector('#dataListe2') //liste des élèves formAddColle
    dataListe.set(el2);
    let el3 = document.querySelector('#dataListe3')  //liste des classes partialsParamColles/formAddColleClasse
    dataListe.set(el3);
    let el4 = document.querySelector('#dataListe4') //liste des matières   partialsParamColles/formAddColleClasse
    dataListe.set(el4);
      $('input').clearer(); //permet de réinitialiser les input

    //parametrage colleur - professeur
    let paramCollesClasses = require('./professeur/paramCollesClasses.js');
    //gestion des colles
    let colles = require('./professeur/colles.js');
    colles.init();
    paramCollesClasses.init();
    menu();
    $('#datetimepicker1').datetimepicker();
  }

  return self;
})();


module.exports = professeur;
