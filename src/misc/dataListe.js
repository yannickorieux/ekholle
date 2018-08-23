let dataListe = (function() {
  let self = {};

  /*
  **************************
        PRIVATE
   **************************
   */
  function setHTML(id, html) {
    $('#' + id + 'liste').empty()
    $('#' + id + 'liste').append(html)
  }
  /*
  **************************
        PUBLIC
   **************************
   */



  self.set = function(element, options = {
    'form': false,
    'display': true
  }) {
    //initialiser le champ input lié à datalist
    let id = element.id;
    let idListe = id + "liste";
    let idSelect = id + "Select";
    let idhidden = id + "answer-hidden";
    let type = $(element).data("type");
    let placeholder = $(element).data("placeholder");
    let html = '';
    let idForm = '';
    if (options.display === false) {
      $(element).css("display", "none");
    }else {
      $(element).css("display", "block");
    }
    if (options.form === true) {
      idForm = id + "Form";
      html = "<form id=" + idForm + "></form>"
      $(element).empty();
      $(element).append(html);
      element = element.childNodes[0];
    }

    html = "<div class='form-group'>\
       <input type='text' list=" + idListe + " id=" + idSelect + "  autocomplete='off' required value='' class='form-control' placeholder='" + placeholder + "' name='" + type + "'><input type='hidden' required value='' name='answer' id=" + idhidden + " /> \
       <datalist id=" + idListe + " ></datalist></div>"

    $(element).empty();
    $(element).append(html);
    if (options.form === true) {
      $('#' + idSelect).wrap("<div class='input-group'></div>");
      $('#' + idSelect).after('<a href="#" class="input-group-append"><button class="btn btn-primary" type="submit">Valider</button></a>');
    };
  }



  self.readOnly = function(element, value) {
    //permet de passer le inputSelect à readonly ou non
    let id = element.id;
    let idSelect = id + "Select";
    $("#" + idSelect).prop("readonly", value);
  }

  self.display = function(element, value) {
    //permet de rendre visible ou non la dataliste value boolean
    if (value === false) {
      $(element).css("display", "none");
    }else {
      $(element).css("display", "block");
    }

  }



  /*
  **************************
        les différentes dataListe en fonction de l'attribut data
   **************************
   */

  self.setDataListe = function(element, data) {
    let id = element.id;
    let type = $(element).data("type")
    let html = '';
    if (data.length === 0) {
      // $("#error").html("<p>Vous n'avez pas encore de matières dans la base</p><p>Créer une nouvlle matière</p>");
      // $('#erreur').modal("show");

    } else {
      if (type === 'matiere') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].nom + "</option>";
        }
      } else if (type === 'eleve') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].nom + ' ' + data[i].prenom + "</option>";
        }
      } else if (type === 'professeur') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].nom + ' ' + data[i].prenom + "</option>";
        }
      } else if (type === 'classe') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].nom + "</option>";
        }
      } else if (type === 'classematiere') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].matiere.nom +'--' + data[i].professeur.nom +' ' + data[i].professeur.prenom + "</option>";
        }
      } else if (type === 'classematierecoordo') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i].idClasseMatiere + "'>" + data[i].classe + '-' + data[i].matiere + "</option>";
        }
      } else if (type === 'classematierecolleur') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i].idClasseMatiere + "'>" + data[i].classe + '-' + data[i].matiere + "</option>";
        }
      }
      else if (type === 'periodes') {
        for (let i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].description + " du : " + moment(data[i].debutPeriode).format('L') +  " au : " + moment(data[i].finPeriode).format('L') + "</option>";
        }
      }
    }
    setHTML(id, html);
  }





  self.selectId = function(idElement) {
    let id = idElement.id;
    let inputId = id + 'Select';
    let inputHiddenId = id + 'answer-hidden';
    let message = $(idElement).data("message")
    document.querySelector('#' + inputId).addEventListener('input', function(e) {
      let input = e.target,
        list = input.getAttribute('list'),
        options = document.querySelectorAll('#' + list + ' option'),
        hiddenInput = document.getElementById(inputHiddenId),
        label = input.value;
      hiddenInput.value = label;

      input.setCustomValidity(message);
      for (let i = 0; i < options.length; i++) {
        let option = options[i];

        if (option.innerText === label) {
          hiddenInput.value = option.getAttribute('data-value');
          input.setCustomValidity('');
          break;
        }
      }
    });
  };

  self.getId = function(idElement) {
    let id = idElement.id;
    let inputHiddenId = id + 'answer-hidden';
    return document.getElementById(inputHiddenId).value;
  };

  self.getName = function(idElement) {
    let id = idElement.id;
    let inputId = id + 'Select';
    return document.getElementById(inputId).value;
  }

  self.setName = function(element, value) {
    let id = element.id;
    let inputId = id + "Select";
    $("#" + inputId).val(value);
  }

/*
dtaliste spéciale pour gérer la notation de 0 à 20
 */

 self.selectNotes = function(idElement) {
   let id = idElement.id;
   let inputId = id + 'Select';
   let message = "note invalide"
   document.querySelector('#' + inputId).addEventListener('input', function(e) {
     let input = e.target,
       list = input.getAttribute('list'),
       options = document.querySelectorAll('#' + list + ' option'),
       label = input.value;

     input.setCustomValidity(message);
     for (let i = 0; i < options.length; i++) {
       let option = options[i];

       if (option.value == label) {
         input.setCustomValidity('');
         break;
       }
     }
   });
 };


   self.setNotes = function(element) {
     //créé une dataliste pour les notes de 0 à 20 + n.n. (non noté et abs)
     let id = element.id;
     let idListe = id + "liste";
     let idSelect = id + "Select";
     let type = $(element).data("type");
     let html = '';

     html = "<div class='form-group'><label>Note :</label><input type='text' list=" + idListe + " id=" + idSelect + "  autocomplete='off' required value='' class='form-control' name='" + type + "'><datalist id=" + idListe + " ></datalist></div>"
     $(element).empty();
     $(element).append(html);
     html='';
     html += "<option value='n.n'></option>";
     html += "<option value='abs.'></option>";
     for (let i = 0; i < 21; i++) {
       html += "<option value='" + i + "'></option>";
     }
     setHTML(id, html); //on insère la datalistelet id = idElement.id;
     let inputId = id + 'Select';
     return document.getElementById(inputId).value;
   }


   self.getNote =function(element){
     let id = element.id;
     let inputId = id + 'Select';
     return document.getElementById(inputId).value;
   }

   self.setLaNote = function(element, value) {
     let id = element.id;
     let inputId = id + "Select";
     $("#" + inputId).val(value);
   }

  return self;
})();

module.exports = dataListe;
