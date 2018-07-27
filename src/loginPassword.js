let loginPassword = (function() {
  let self = {};



  /*
  **************************
        PRIVATE
   **************************
   */

  $('#modifyPasswordForm').submit(function(e) {
    e.preventDefault();
    let password = document.querySelector('#modifyPasswordForm input[name="password"]').value;
    let passwordConf = document.querySelector('#modifyPasswordForm input[name="passwordConf"]').value;
    let regexp = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/;
    if (password.match(regexp) == null) {
      $('#error').html('le mot de passe doit contenir au minimum 8 caratères dont une majuscule, une minuscule et un chiffre.');
      $('#erreur').modal();
    } else if (password !== passwordConf) {
      $('#error').html('les mots de passe doivent être identiques');
      $('#erreur').modal();
    } else {
      $.post("/users/modifyPassword", {
        'password': password,
        'passwordConf': passwordConf,
      }, (message) => {
        if (message == null || message == '') {
          $('#error').html('Votre mot de passe a été modifié');
          $('#erreur').modal();
        }
      });
    }
  });



  //
  // function foo(){
  //
  // }
  // alert(foo(chaine))
  /*
  **************************
        PUBLIC
   **************************
   */

  self.createLogin = function(prenom, nom) {
    let tab1 = "ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ";
    let tab2 = "aaaaaaaaaaaaooooooooooooeeeeeeeecciiiiiiiiuuuuuuuuynn";
    rep2 = tab1.split('');
    rep = tab2.split('');
    myarray = new Array();
    var i = -1;
    while (rep2[++i]) {
      myarray[rep2[i]] = rep[i];
    }
    myarray['Œ'] = 'OE';
    myarray['œ'] = 'oe';
    myarray[' '] = '-';
    let p = prenom.replace(/./g, function($0) {
      return (myarray[$0]) ? myarray[$0] : $0
    });
    let n = nom.replace(/./g, function($0) {
      return (myarray[$0]) ? myarray[$0] : $0
    });
    return p + '.' + n
  };



  self.init = function() {

  };


  return self;
})();

module.exports = loginPassword;
