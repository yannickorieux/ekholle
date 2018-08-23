const express = require('express');
const router = express.Router();
const login = require('./login');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const colleur = require('./professeur/colleur');
const coordonnateur = require('./professeur/coordonnateur');

/*
**************************
page index professeur
**************************
*/
router.get('/', login.isLoggedIn, function(req, res, next) {
  console.log(req.session.role);
  if (req.session.role === 'professeur') {
    res.render('professeur.ejs', {
      title: 'e-khôlle - professeur',
      user: req.prenom + '-' + req.nom,
      role: req.session.role,
      id: req._id,
      etab: req.session.etab,
    });
  } else {
    res.redirect('/' + req.session.role);
  }

});



/*
**************************
TAB  COLLEUR
**************************
*/

/*
**************************
association matiere/classe avec le professeur coordo de discipline pour datalist
**************************
*/

router.post('/listeMatiereClasseJSON/', login.isLoggedIn, colleur.listeMatiereClasseJSON);

/*
**************************
ajoute une colle à un professeur en l'associant à une matiere/classe
**************************
*/
router.post('/addClasseMatiereColleur/', login.isLoggedIn, colleur.addClasseMatiereColleur);

/*
**************************
      suppression d'une  matiere sur une classe
 **************************
 */
router.post('/suppClasseMatiereColleur/', login.isLoggedIn, colleur.suppClasseMatiereColleur);

/*
**************************
table pour afficher les matieres/classes du colleur
**************************
*/
router.post('/tableMesCollesClassesJSON/', login.isLoggedIn, colleur.tableMesCollesClassesJSON);

/*
**************************
liste des élèves à coller pour la matière choisie ar le colleur
**************************
*/

router.post('/listeElevesJSON/', login.isLoggedIn, colleur.listeElevesJSON);


/*
**************************
Ajout ou modification d'une colle dans la base
**************************
*/
router.post('/addOrModColle/', login.isLoggedIn, colleur.addOrModColle);

/*
**************************
Suppression d'une colle dans la base
**************************
*/


router.post('/suppColle/', login.isLoggedIn, colleur.suppColle);


/*
**************************
table pour afficher la liste des colles dans une matière du colleur
**************************
*/


router.post('/tableCollesJSON/', login.isLoggedIn, colleur.tableCollesJSON);



/*
**************************
table pour afficher les programes de colle du colleur
**************************
*/

router.post('/tableProgrammeColleurJSON/', login.isLoggedIn, colleur.tableProgrammeColleurJSON);

/*
**************************
 COORDO de discipline
**************************
*/

/*
**************************
table pour afficher la liste des colleurs du coordo
**************************
*/

router.post('/tableMesClassesJSON/', login.isLoggedIn, coordonnateur.tableMesClassesJSON);


/*
**************************
liste des classes du coordonateur
**************************
*/
router.post("/tableClassesCoordoJSON/", login.isLoggedIn, coordonnateur.tableClassesCoordoJSON);


/*
**************************
table pour afficher la liste des colles dans une matière donnee pour le coordo
**************************
*/
router.post('/tableCollesCoordoJSON/', login.isLoggedIn, coordonnateur.tableCollesCoordoJSON);

/*
**************************
table pour afficher les résultats et moyenne pour les classes du coordo
**************************
*/
router.post('/tableResultatsCoordoJSON/', login.isLoggedIn, coordonnateur.tableResultatsCoordoJSON);

/*
**************************
Ajout ou modification du programme de colle
**************************
*/


router.post('/addOrModProgramme/', login.isLoggedIn, coordonnateur.addOrModProgramme);

/*
**************************
table pour afficher le programme du coordo
**************************
*/


router.post('/tableProgrammeCoordoJSON/', login.isLoggedIn, coordonnateur.tableProgrammeCoordoJSON);





/*
**************************
TAB bilan colleur
**************************
*/

/*
**************************
     renvoie l'année et les périodes
 **************************
 */
router.get('/getAnnee/', login.isLoggedIn, colleur.getAnnee);


/*
**************************
table pour afficher le bilan des heures réalisées par le colleur
**************************
*/


router.post("/tableDecompteHeuresJSON/", login.isLoggedIn, colleur.tableDecompteHeuresJSON);

module.exports = router;
