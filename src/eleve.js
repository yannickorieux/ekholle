let eleve = (function() {

  let self = {};
  let idEleve = document.body.getAttribute("data-ideleve");
  let classe = document.body.getAttribute("data-classe");

  /*
  **************************
        PRIVATE
   **************************
   */

  function menu() {

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
    menu();
    console.log(idEleve);
    let synthese = require('./eleve/synthese.js');
    synthese.init();
    let programme = require('./eleve/programme.js');
    programme.init();
  }

  return self;
})();


module.exports = eleve;
