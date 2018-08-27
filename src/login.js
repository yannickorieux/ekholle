let login = (function() {
  let self = {};


  /*
  **************************
        PRIVATE
   **************************
   */




  /*
  **************************
      gestion des cookies
   **************************
   */

  const cookieBanner = document.getElementById('cookie-banner');
  const cookieInformAndAsk = document.getElementById('cookie-inform-and-ask');
  const cookieMoreButton = document.getElementById('cookie-more-button');
  const loginButton = document.getElementById('login-button');
  const CancelButton = document.getElementById('cancel-button');
  const ConfirmButton = document.getElementById('confirm-button');


//   function startGoogleAnalytics() {
//
//   (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
//   (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
//   m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
//   })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
//
//   ga('create', 'UA-XXXXX-Y', 'auto');
//   ga('send', 'pageview');
// }


  function processCookieConsent() {
    // 1. On récupère l'éventuel cookie indiquant le choix passé de l'utilisateur
    //const consentCookie = Cookies.getJSON('hasConsent');
    // 2. On récupère la valeur "doNotTrack" du navigateur
    //const doNotTrack = navigator.doNotTrack || navigator.msDoNotTrack;

    // // 3. Si le cookie existe et qu'il vaut explicitement "false" ou que le "doNotTrack" est défini à "OUI"
    // //    l'utilisateur s'oppose à l'utilisation des cookies. On exécute une fonction spécifique pour ce cas.
    // if (doNotTrack === 'yes' || doNotTrack === '1' || consentCookie === false) {
    //   reject();
    //   return;
    // }
    //
    // // 4. Si le cookie existe et qu'il vaut explicitement "true", on démarre juste Google Analytics
    // if (consentCookie === true) {
    //   startGoogleAnalytics();
    //   return;
    // }
    //
    // // 5. Si le cookie n'existe pas et que le "doNotTrack" est défini à "NON", on crée le cookie "hasConsent" avec pour
    // //    valeur "true" pour une durée de 13 mois (la durée maximum autorisée) puis on démarre Google Analytics
    // if (doNotTrack === 'no' || doNotTrack === '0') {
    //   Cookies.set('hasConsent', true, {
    //     expires: 395
    //   });
    //   startGoogleAnalytics();
    //   return;
    // }
    // 6. Si le cookie n'existe pas et que le "doNotTrack" n'est pas défini, alors on affiche le bandeau et on crée les listeners

    $(cookieBanner).addClass('active');
    cookieMoreButton.addEventListener('click', onMoreButtonClick, false);
    //document.addEventListener('click', onDocumentClick, false);
    return;
  }


  // function onDocumentClick(event) {
  //   console.log('test');
  //   const target = event.target;
  //   // Si l'utilisateur a cliqué sur le bandeau ou le bouton dans ce dernier alors on ne fait rien.
  //   if (target.id === 'cookie-banner' ||
  //     target.parentNode.id === 'cookie-banner' ||
  //     target.parentNode.parentNode.id === 'cookie-banner' ||
  //     target.id === 'cookie-more-button') {
  //     return;
  //   }
  //
  //   event.preventDefault();
  //
  //   // // On crée le cookie signifiant le consentement de l'utilisateur et on démarre Google Analytics
  //   // Cookies.set('hasConsent', true, {
  //   //   expires: 365
  //   // });
  //   // startGoogleAnalytics();
  //
  //   // On cache le bandeau
  //   // cookieBanner.className = cookieBanner.className.replace('active', '').trim();
  //   //
  //   // // On supprime le listener sur la page et celui sur le bouton du bandeau
  //   // document.removeEventListener('click', onDocumentClick, false);
  //   // cookieMoreButton.removeEventListener('click', onMoreButtonClick, false);
  //
  // }
  //


  function onMoreButtonClick(event) {
    event.preventDefault();

    // On affiche la boîte de dialogue permettant à l'utilisateur de faire son choix
    cookieInformAndAsk.classList.add('active');

    // On cache le bandeau
    cookieBanner.className = cookieBanner.className.replace('active', '').trim();

    // On crée les listeners sur les boutons de la boîte de dialogue
    CancelButton.addEventListener('click', onCancelButtonClick, false);
    ConfirmButton.addEventListener('click', onConfirmButtonClick, false);

    // On supprime le listener sur la page et celui sur le bouton du bandeau
    //document.removeEventListener('click', onDocumentClick, false);
    cookieMoreButton.removeEventListener('click', onMoreButtonClick, false);
  }


   function onConfirmButtonClick(event) {
    event.preventDefault();
  //
  //   // On crée le cookie signifiant le consentement de l'utilisateur et on démarre Google Analytics
  //   Cookies.set('hasConsent', true, {
  //     expires: 365
  //   });
  //   startGoogleAnalytics();
  //
  //   // On cache la boîte de dialogue
  cookieInformAndAsk.className = cookieBanner.className.replace('active', '').trim();
  //
  //   // On supprime les listeners sur les boutons de la boîte de dialogue
   CancelButton.removeEventListener('click', onCancelButtonClick, false);
   ConfirmButton.removeEventListener('click', onConfirmButtonClick, false);
   }
  //
  //
  function onCancelButtonClick(event) {
     event.preventDefault();
  //
  //   // On lance la procédure de refus de l'utilisation des cookies
  //   reject();
  //
  //   // On cache la boîte de dialogue
  cookieInformAndAsk.className = cookieBanner.className.replace('active', '').trim();

  //   // On supprime les listeners sur les boutons de la boîte de dialogue
  CancelButton.removeEventListener('click', onCancelButtonClick, false);
  ConfirmButton.removeEventListener('click', onConfirmButtonClick, false);
   }





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



  self.init = function() {
   $(".visible").css("display", "block");
     processCookieConsent();
  };


  return self;
})();

module.exports = login;
