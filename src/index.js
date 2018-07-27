$(document).ready(() => {


  let professeur = require('./professeur.js');
  let admin = require('./admin.js');

  //gestion password
  let loginPassword = require('./loginPassword.js');
  loginPassword.init();

  if ($('body').data("page") === 'professeur') {
    professeur.init();
  }
  if ($('body').data("page") === 'admin') {
    admin.init();
  }

});