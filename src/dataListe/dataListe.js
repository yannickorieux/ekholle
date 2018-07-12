let dataListe = (function() {
  let self = {};

  /*
  **************************
        PRIVATE
   **************************
   */
  setHTML = function(id, html) {
    $('#' + id + 'liste').empty()
    $('#' + id + 'liste').append(html)
  }
  /*
  **************************
        PUBLIC
   **************************
   */

  self.set = function(element) {
    let id = element.id;
    let idListe = id + "liste";
    let idSelect = id + "Select";
    let idhidden = id + "answer-hidden";
    let type = $(element).data("type")
    let placeholder = $(element).data("placeholder")
    html = []
    html.push(
      "<div class='form-group has-feedback has-clear'><div> \
       <input type='text' list=" + idListe + " id=" + idSelect + "  autocomplete='off' required value='' class='form-control' placeholder='" + placeholder + "' name=" + type + " > <input type='hidden' required value='' name='answer' id=" + idhidden + " > \
       </div><datalist id=" + idListe + " ></datalist></div>"
    )

    $(element).empty();
    $(element).append(html);
  }
  /*
  **************************
        datalist matieres
   **************************
   */

  self.setDataListe = function(element, data) {
    let id = element.id;
    let type = $(element).data("type")
    console.log(type);
    html = '';
    if (data.length === 0) {
      // $("#error").html("<p>Vous n'avez pas encore de matières dans la base</p><p>Créer une nouvlle matière</p>");
      // $('#erreur').modal("show");

    } else {
      if (type === 'matiere') {
        for (i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].nom + "</option>";
        }
      } else if (type === 'eleve') {
        for (i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].prenom + '-' + data[i].nom + "</option>";
        }
      } else if (type === 'professeur') {
        for (i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].prenom + '-' + data[i].nom + "</option>";
        }
      } else if (type === 'classe') {
        for (i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].nom + "</option>";
        }
      } else if (type === 'classematiere') {
        for (i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].matiere + "</option>";
        }
      } else if (type === 'classematierecolleur') {
        for (i = 0; i < data.length; i++) {
          html += "<option data-value='" + data[i]._id + "'>" + data[i].classe + '--' + data[i].matiere + "</option>";
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

  return self;
})();

module.exports = dataListe;
