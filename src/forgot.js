let forgot = (function() {
  let self = {};




  /*
  **************************
        PRIVATE
   **************************
   */

  let urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get('token');
  if (token !== null) {
    document.getElementById('resetForm').setAttribute("data-token", token);
  }



  $('#resetForm').submit(function(e) {
    e.preventDefault();
    let password = document.getElementById("resetForm").elements.namedItem("password").value;
    let passwordConf = document.getElementById("resetForm").elements.namedItem("passwordConf").value;
    let token = document.getElementById('resetForm').getAttribute("data-token")
    $.post("/users/reset/", {
      "password": password,
      "passwordConf": passwordConf,
      "token": token,
    }, () => {
      window.location.assign('/')
    });
  });

  /*
  **************************
        PUBLIC
   **************************
   */

  self.init = function() {
    let form = document.getElementById("form").innerHTML;
    if (form == 'forgot') {
      $(".visible").css("display", "none"); //tous les objets de classes visibles sont cachés
      $("#forgot").css("display", "block");
    } else {
      $(".visible").css("display", "none"); //tous les objets de classes visibles sont cachés
      $("#reset").css("display", "block");
    }
  };


  return self;
})();

module.exports = forgot;
