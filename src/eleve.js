let eleve = (function() {

  let self = {};
  let idEleve = document.body.getAttribute("data-ideleve");
  let classe = document.body.getAttribute("data-classe");

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
    let synthese = require('./eleve/synthese.js');
    synthese.init();
    let programme = require('./eleve/programme.js');
    programme.init();
  }

  return self;
})();


module.exports = eleve;
