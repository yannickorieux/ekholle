let admin = (function() {

  let self = {};

  /*
  **************************
        PRIVATE
   **************************
   */

  function menu() {

    $('#navBilan').on('click', function() {
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

  self.init = function() {

    // on met à jour la dataliste classes
    let dataListe = require('./misc/dataListe.js');

    //dataliste classe pour creation equipe classe
    let el1 = document.querySelector('#dataListe1')
    dataListe.set(el1, {
      'form': true
    });

      //dataliste classe pour liste eleves
    let el4 = document.querySelector('#dataListe4')
    dataListe.set(el4 ,{
      'form': true
    });

    //dataliste classe pour nouvel eleve
    let el6 = document.querySelector('#dataListe6')
    dataListe.set(el6);


    $.get("/admin/tableClassesJSON/", (data) => {
      dataListe.setDataListe(el1, data);
      dataListe.setDataListe(el4, data);
      dataListe.setDataListe(el6, data);
    });

    //liste matiere pour creation equipe classe
    let el2 = document.querySelector('#dataListe2')
    dataListe.set(el2);
    //liste professeur pour creation equipe classe
    let el3 = document.querySelector('#dataListe3')
    dataListe.set(el3);

    //liste des Periodes
    let el5 = document.querySelector('#dataListe5')
    dataListe.set(el5, {
      'form': true
    });

    
    $('input[type=text]').clearer(); //permet de réinitialiser les input




  // les imports
    let structure = require('./admin/structure.js');
    let professeurs = require('./admin/param/professeurs.js');
    let eleves = require('./admin/param/eleves.js');
    let matieres = require('./admin/param/matieres.js');
    let equipesClasses = require('./admin/param/equipesClasses.js');
    let decompteHeures = require('./admin/ramassages/decompteHeures.js');
    let periodes = require('./admin/ramassages/periodes.js');
    let imports = require('./admin/param/imports.js');


    structure.init();
    professeurs.init();
    eleves.init();
    matieres.init();
    equipesClasses.init();
    decompteHeures.init();
    periodes.init();
    imports.init()
    menu();
  }
  return self;
})();


module.exports = admin;
