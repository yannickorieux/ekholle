$(document).ready(() => {
  $('[data-toggle="popover"]').popover();

  const professeur = require('./professeur.js');
  const eleve = require('./eleve.js');
  const admin = require('./admin.js');
  const login = require('./login.js');
  const etablissement = require('./etablissement.js');
  const inputclearer = require('./misc/input-clearer.js');

  //gestion password forgot
  const forgot = require('./forgot.js');

  //gestion password
  let loginPassword = require('./loginPassword.js');
  loginPassword.init();





  if ($('body').data("page") === 'forgot') {
    forgot.init();
  }

  if ($('body').data("page") === 'professeur') {
    let x = setTimeout(function() {
      alert('Vous avez été déconnecté du service e-kholle');
      window.location.assign("/users/logout");
    }, 1800000);
    professeur.init();
  }
  if ($('body').data("page") === 'eleve') {
    let x = setTimeout(function() {
      alert('Vous avez été déconnecté du service e-kholle');
      window.location.assign("/users/logout");
    }, 600000);
    eleve.init();
  }
  if ($('body').data("page") === 'admin') {
    let x = setTimeout(function() {
      alert('Vous avez été déconnecté du service e-kholle');
      window.location.assign("/users/logout");
    }, 1800000);
    admin.init();
  }
  if ($('body').data("page") === 'login') {
    login.init();
  }
  if ($('body').data("page") === 'home') {
    etablissement.init();
  }


});
