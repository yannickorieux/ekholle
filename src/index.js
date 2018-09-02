$(document).ready(() => {
  $('[data-toggle="popover"]').popover();

  let professeur = require('./professeur.js');
  let eleve = require('./eleve.js');
  let admin = require('./admin.js');
  let login = require('./login.js');
  let etablissement = require('./etablissement.js');




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
    //$.timeoutDialog({timeout: 1, countdown: 60, logout_redirect_url: '/users/logout', restart_on_yes: false});
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
  if ($('body').data("page") === 'home') {
    etablissement.init();
  }


});
