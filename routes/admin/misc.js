
module.exports = {
  /*
  **************************
   création login
  **************************
  */

   genereLogin : function(prenom, nom) {
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
  },


  /*
  **************************
   création pwd
  **************************
  */
  generePassword : function(){
    let c = 'abcdefghijknopqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ12345679';
    let r = ''
    for (i = 0; i < 8; i++) {
      r += c.charAt(Math.floor(Math.random() * c.length));
    }
    return r
  },


}
