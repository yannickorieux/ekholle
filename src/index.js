$(document).ready(() => {


  let professeur = require('./professeur.js');
  let eleve = require('./eleve.js');
  let admin = require('./admin.js');
  let login = require('./login.js');


  //gestion password forgot
  let forgot = require('./forgot.js');

  //gestion password
  let loginPassword = require('./loginPassword.js');
  loginPassword.init();



  if ($('body').data("page") === 'forgot') {
    forgot.init();
  }

  if ($('body').data("page") === 'professeur') {
    professeur.init();
  }
  if ($('body').data("page") === 'eleve') {
    eleve.init();
  }
  if ($('body').data("page") === 'admin') {
    admin.init();
  }
  if ($('body').data("page") === 'login') {
    login.init();
  }

});
