let admin = (function() {

  let self = {};

  /*
  **************************
        PRIVATE
   **************************
   */

 menu = function(){

   $('#navBilan').on('click', function() {
     let bilan = require('./admin/bilan.js');
     bilan.init();
     $(".visible").css("display", "none");
     $("#showBilan").css("display", "block");
   });

   $('#navParam').on('click', function() {
     $(".visible").css("display", "none");
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

  self.init = function(){
    // on met à jour la dataliste classes
    let dataListe = require('./dataListe/dataListe.js');

    let el1 = document.querySelector('#dataListe1')
    dataListe.set(el1 , { 'form' : true});
    let el4 = document.querySelector('#dataListe4')
    dataListe.set(el4);

    $.get("/admin/tableClassesJSON/", (data) => {
      dataListe.setDataListe(el1,data);
      dataListe.setDataListe(el4,data);
    });

     //liste matiere
    let el2 = document.querySelector('#dataListe2')
    dataListe.set(el2);
    //liste professeur
    let el3 = document.querySelector('#dataListe3')
    dataListe.set(el3);

    $('input').clearer(); //permet de réinitialiser les input


    let structure=  require('./admin/structure.js');
    let professeurs=  require('./admin/param/professeurs.js');
    let eleves=  require('./admin/param/eleves.js');
    let matieres=  require('./admin/param/matieres.js');
    let equipesClasses=  require('./admin/param/equipesClasses.js');

    structure.init();
    professeurs.init();
    eleves.init();
    matieres.init();
    equipesClasses.init();
    menu();
  }
  return self;
})();


module.exports = admin;
