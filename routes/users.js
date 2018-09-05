const express = require('express');
const router = express.Router();

const queryString = require('query-string');
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const config = require('../secret');

const login = require('./users/login');
const password = require('./users/password');
const contact = require('./users/contact');
const misc = require('./admin/misc'); //generer login + pass
const professeurs = require('./admin/professeurs');
const eleves = require('./admin/eleves');

/* on renvoie la page de login */
router.get('/', function(req, res, next) {
  let page = '';
  if (typeof req.session.userId === 'undefined') {
    page = 'login'
  } else if (req.session.changePwd === false) {
    page = 'password'
  } else res.end();
  res.render('login.ejs', {
    title: 'e-khôlle',
    role: req.session.role,
    lycee: req.session.lycee,
    page: page
  });
});

/*
**************************
connexion
**************************
*/

router.post('/login', function(req, res, next) {
  let Login;
  if (req.body.login && req.body.logpassword) {
    if (req.body.profil === 'professeur') {
      let Professeur = require('../models/professeur')(req.session.etab);
      Login = Professeur;
    } else if (req.body.profil === 'admin') {
      let Admin = require('../models/admin')(req.session.etab);
      Login = Admin;
    } else if (req.body.profil === 'eleve') {
      let Eleve = require('../models/eleve')(req.session.etab);
      Login = Eleve;
    }
    Login.authenticate(Login, req.body.login, req.body.logpassword, function(error, user) {
      if (error || !user) {
        res.locals.messages = req.flash('msg', 'login ou mot de passe incorrect');
        res.redirect('/users');
      } else {
        req.session.userId = user._id;
        req.session.role = req.body.profil;
        if (typeof user.classe !== 'undefined') req.session.classe = user.classe; //pour l'eleve on recupere sa classe
        if (user.changePwd === false) {
          req.session.changePwd = false;
          res.redirect('/users');
        } else if (req.body.profil === 'professeur') {
          return res.redirect('/professeur');
        } else if (req.body.profil === 'admin') {
          return res.redirect('/admin');
        } else if (req.body.profil === 'eleve') {
          return res.redirect('/eleve');
        } else {
          return res.redirect('/');
        }
      }
    });
  } else {
    let err = new Error('All fields required.');
    res.locals.messages = req.flash('msg', 'Tous les champs sont requis');
    return next(err);
  }
});


/*
**************************
déconnexion
**************************
*/
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    let etab = req.session.etab;
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        // on peut de nouveau creer une session
        return res.redirect('/' + etab);
      }
    });
  }
});



// =====================================
// Mot de passe oublié 
// =====================================
router.get('/forgot', function(req, res) {
  res.render('forgot.ejs', {
    role: req.session.role,
    lycee: req.session.lycee,
    title: 'e-khôlle',
    form: 'forgot',
  });
});

// =====================================
// Mot de passe  reset envoi d'un token par mail
// =====================================


router.post('/forgot', password.sendMail );


// =====================================
// Au chargement de l'url on recupere l'etab, le token et le profil pour activer le form reset
// ===

router.get('/reset/', password.testToken);


// =====================================
// validation du  form reset pour enregistrer le mdp
// ===
router.post('/reset/', password.savePassword);


/*
**************************
modifier le mot de passe une fois connecté
**************************
*/
router.post('/modifyPassword', login.isLoggedIn, password.modifyPassword);


// =====================================
// Contact support ========
// =====================================


router.post('/contactSupport', contact.contactSupport);




/*
**************************
ajouter un professeur
**************************
*/
router.post('/creerProfesseur', login.isLoggedIn, professeurs.creerProfesseur);

router.post('/validerProfesseur', login.isLoggedIn, professeurs.validerProfesseur);

router.post('/modifierProfesseur', login.isLoggedIn, professeurs.modifierProfesseur);




/*
**************************
ajouter un eleve
**************************
*/
router.post('/creerEleve', login.isLoggedIn, eleves.creerEleve);

router.post('/validerEleve', login.isLoggedIn, eleves.validerEleve);




/*
**************************
import csv eleves
**************************
*/

testEtCreationLogin = function(profil, csvData, dataExists) {
  let testLogin = [];
  dataExists.forEach((value) => {
    if (typeof value.login !== 'undefined') {
      testLogin.push(value.login)
    }
  });
  csvData.forEach((value) => {
    //ecriture de la condition en fonction du profil
    let index;
    if (profil === 'eleve') {
      index = dataExists.findIndex(item => item.ine === value.ine);
    } else {
      index = dataExists.findIndex(item => item.nom.toLowerCase() === value.nom.toLowerCase() && item.nom.toLowerCase() === value.prenom.toLowerCase());
    }
    if (index !== -1) {
      value.present = true;
      value.password = dataExists[index].password;
      value.login = dataExists[index].login;
    } else {
      value.present = false;
      let login = misc.genereLogin(value.prenom.toLowerCase(), value.nom.toLowerCase())
      let re = new RegExp('^' + login);
      //on verifie dans la table login les doublons
      let n = 0;
      let num = [];
      testLogin.forEach((l) => {
        if (l.match(re) !== null) {
          n += 1;
          if (!isNaN(l.split(re)[1])) num.push(l.split(re)[1]);
        }
      });
      if (n > 0) login += String(Math.max.apply(Math, num) + 1);
      value.login = login;
      value.password = misc.generePassword();
      testLogin.push(login);
    }
  });
}



//fonction permettant de vérifier si le login professeur eleve ou matiere à importer est present dans la base
testPresenceBase = function(req, res, profil, csvData, callback) {
  if (profil === 'eleve') {
    let Eleve = require('../models/eleve')(req.session.etab);
    Eleve.aggregate([{
      $project: {
        nom: 1,
        prenom: 1,
        login: 1,
        ine: 1,
        password: 1,
      }
    }]).exec(function(err, eleves) {
      if (err) return console.error(err);
      testEtCreationLogin(profil, csvData, eleves);
      callback(csvData);
    });
  } else if (profil === 'professeur') {
    let Professeur = require('../models/professeur')(req.session.etab);
    Professeur.aggregate([{
      $project: {
        nom: 1,
        prenom: 1,
        login: 1,
        password: 1,
      }
    }]).exec(function(err, professeurs) {
      if (err) return console.error(err);
      testEtCreationLogin(profil, csvData, professeurs);
      callback(csvData);
    });
  } else if (profil === 'matiere') {
    let Matiere = require('../models/matiere')(req.session.etab);
    Matiere.aggregate([{
      $project: {
        nom: 1,
        generique: 1,
      }
    }]).exec(function(err, matieres) {
      if (err) return console.error(err);
      csvData.forEach((value) => {
        //ecriture de la condition en fonction du profil
        let index = matieres.findIndex(item => item.nom === value.nom);
        if (index !== -1) {
          value.present = true;
        } else {
          value.present = false;
        }
      });
      callback(csvData);
    });
  } else {
    //erreur sur le profil
    console.log(profil)
  }

};




let upload = multer({
  dest: 'tmp/csv/'
});



router.post('/csvData', login.isLoggedIn, upload.single('file'), function(req, res, next) {
  let profil = req.body.profil;
  let csvData = [],
    fileHeader;
  // open uploaded file
  csv.fromPath(req.file.path, {
      headers: true
    })
    .on("data", function(data) {
      let rowData = {};
      Object.keys(data).forEach(current_key => {
        rowData[current_key.toLowerCase()] = data[current_key]
      });

      csvData.push(rowData);
    })
    .on("end", function() {
      fs.unlinkSync(req.file.path); // remove temp file
      testPresenceBase(req, res, profil, csvData, (data) => {
        res.send(data)
      });

    });
});




router.post('/importEleves', login.isLoggedIn, function(req, res, next) {
  let Eleve = require('../models/eleve')(req.session.etab);
  let Structure = require('../models/structure')(req.session.etab);
  let message = '';
  if (req.body.importAnnuel === 'true' || req.body.importAnnuel === true) {
    //on nettoie la structure
    Structure.update({}, {
        $unset: {
          matieres: 1,
          periode: 1,
          extraPeriode: 1
        },
        $set: {
          totalEleves: 0
        }
      }, {
        multi: true
      })
      .exec(function(err, results) {

        //on supprime les classes pour chaque eleve
        Eleve.update({}, {
            $unset: {
              classe: 1,
            }
          }, {
            multi: true
          })
          .exec(function(err, results) {
            let data = JSON.parse(req.body.dataMod);
            async.eachSeries(data, function updateObject(obj, done) {
              // Model.update(condition, doc, callback)
              Eleve.update({
                ine: obj.ine
              }, {
                $set: {
                  classe: obj.classe
                }
              }, done);
            }, function allDone(err) {
              //puis on ajoute les nouveaux
              let data = JSON.parse(req.body.dataAdd);
              if (data.length !== 0) {
                Eleve.collection.insertMany(data, function(err, docs) {
                  if (err) {
                    message = err;
                  } else {
                    message = 'les élèves sont importés dans la base';
                  }
                  res.send(message);
                });
              } else {
                message = 'pas d eleves à ajouter';
                res.send(message);
              };
            })
          });
      });
  } else {
    // mise à jour standard on ajoute les nouveaux (modifie les autres)
    let data = JSON.parse(req.body.dataAdd);
    if (data.length !== 0) {
      Eleve.collection.insertMany(data, function(err, docs) {
        if (err) {
          message = err;
        } else {
          message = 'les élèves sont importés dans la base';
        }
        res.send(message);
      });
    }
    else{
      message = 'pas d eleves à ajouter';
      res.send(message);
    };
  }
});


router.post('/importProfesseurs', login.isLoggedIn, function(req, res, next) {
  let Professeur = require('../models/professeur')(req.session.etab);
  let data = JSON.parse(req.body.dataAdd);
  if (data.length > 0) {
    Professeur.collection.insertMany(data, function(err, docs) {
      if (err) {
        return console.error(err);
      } else {
        console.log("Multiple documents inserted to Collection");
      }
      res.end();
    });
    res.end();
  }

});



router.post('/importMatieres', login.isLoggedIn, function(req, res, next) {
  let Matiere = require('../models/matiere')(req.session.etab);
  let data = JSON.parse(req.body.dataAdd);
  if (data.length > 0) {
    Matiere.collection.insertMany(data, function(err, docs) {
      if (err) {
        return console.error(err);
      } else {
        console.log("Multiple documents inserted to Collection");
      }
      res.end();
    });
    res.end();
  }

});



/*
**************************
       rafraichir les classes après import
 **************************
 */


router.get('/rafraichirBaseStructure/', login.isLoggedIn, function(req, res) {
  let Eleve = require('../models/eleve')(req.session.etab);
  let Structure = require('../models/structure')(req.session.etab);
  Eleve.aggregate([{
        $group: {
          _id: '$classe', //$region is the column name in collection
          count: {
            $sum: 1
          },
        }
      },
      {
        $project: {
          nom: "$_id",
          totalEleves: '$count'
        }
      }
    ])
    .exec(function(err, classes) {
      console.log(classes);
      if (err) return console.error(err);
      Structure.distinct('nom')
        .exec(function(err, classesExist) {
          if (err) return console.error(err);
          newClasses = [];
          classes.forEach((value) => {
            if (classesExist.indexOf(value.nom) === -1 && value.nom !=='null') { //null les eleves sans classes font partie de la classe null
              newClasses.push({
                'nom': value.nom
              })
            }
          });
          console.log(newClasses);
          Structure.collection.insertMany(newClasses, function(err, docs) {
            if (err) {
              console.error(err);
            } else {
              console.log("Multiple documents inserted to Collection");
            }
            // on enregistre ensuite le nombre d'élèves par classe dans la Structure
            async.eachSeries(classes, function updateObject(obj, done) {
                // Model.update(condition, doc, callback)
                Structure.update({
                  nom: obj.nom
                }, {
                  $set: {
                    totalEleves: obj.totalEleves
                  }
                }, done);
              },
              function allDone(err) {
                res.end();
              });
          });
        });
      res.end();
    });
});

module.exports = router;
