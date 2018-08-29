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




  function processCookieConsent() {


    $(cookieBanner).addClass('active');
    cookieMoreButton.addEventListener('click', onMoreButtonClick, false);
    //document.addEventListener('click', onDocumentClick, false);
    return;
  }



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
