let etablissement = (function() {
  let self = {};
  let dataListe = require('./misc/dataListe.js');



  /*
  **************************
        PRIVATE
   **************************
   */






  /*
  **************************
        PUBLIC
   **************************
   */




  self.init = function() {

    let el1 = document.querySelector('#dataListe1') //liste des établissements
    dataListe.set(el1, {
      'form': true
    });

    $('#dataListe1Form').submit(function(e) {
         e.preventDefault();
         let etablissement = dataListe.getName(el1);
         let prefix = dataListe.getId(el1);
         console.log(etablissement);
         $.post("/choixEtab/", {
             'etablissement': etablissement,
             'prefix': prefix,
           },()=>{
             window.location.assign('/users/logout/')
           });
       });

    dataListe.selectId(el1)

    $.get("/listeEtablissementsJSON/", (data) => {
      dataListe.setDataListe(el1, data);
    });

    $('input').clearer(); //permet de réinitialiser les input

  };

  return self;
})();

module.exports = etablissement;
