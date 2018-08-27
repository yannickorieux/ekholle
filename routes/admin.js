const express = require('express');
const router = express.Router();
const login = require('./login');
const moment = require('moment')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


const classes = require('./admin/classes');
const professeurs = require('./admin/professeurs');
const eleves = require('./admin/eleves');
const ramassages = require('./admin/ramassages');


router.get('/', login.isLoggedIn, function(req, res, next) {
  if (req.session.role === 'admin') {
    res.render('admin.ejs', {
      title: 'e-khôlle - administration',
      user: req.prenom + '-' + req.nom,
      role: req.session.role,
      lycee: req.session.lycee,
    });
  } else {
    res.redirect('/' + req.session.role);
  }
});



/*
**************************
    GESTION CLASSES
 **************************
 */
/*
**************************
      Script pour afficher la sructure des classes
 **************************
 */
router.get('/tableStructureJSON/', login.isLoggedIn, classes.tableStructureJSON);

/*
**************************
      Script pour modifier le niveau des classes
 **************************
 */

 router.post('/niveau/', login.isLoggedIn, classes.niveau);

/*
**************************
      Script pour afficher la table des matieres
 **************************
 */
router.get('/tableMatieresJSON/', login.isLoggedIn, classes.tableMatieresJSON);



/*
**************************
       table des classes
 **************************
 */
router.get('/tableClassesJSON/', login.isLoggedIn, classes.tableClassesJSON);

/*
**************************
       liste des équipes classes matiere-coordo
 **************************
 */
router.post('/tableEquipeClasseJSON/', login.isLoggedIn, classes.tableEquipeClasseJSON);

/*
**************************
       gestion des periodes
 **************************
 */
router.post('/changeExtraPeriode/', login.isLoggedIn, classes.changeExtraPeriode);

router.post('/defExtraPeriode/', login.isLoggedIn, classes.defExtraPeriode);


/*
**************************
       liste des élèves
 **************************
 */
router.post('/tableElevesClasseJSON/', login.isLoggedIn, classes.tableElevesClasseJSON);

/*
**************************
       ajout OU modification d'une  matiere sur une classe
 **************************
 */
router.post('/addOrModClasseMatiere/', login.isLoggedIn, classes.addOrModClasseMatiere);
/*
**************************
      suppression d'une  matiere sur une classe
 **************************
 */
router.post('/suppClasseMatiere/', login.isLoggedIn, classes.suppClasseMatiere);

/*
**************************
      FIN GESTION CLASSES
 **************************
 */


/*
**************************
      GESTION PROFESSEURS
 **************************
 */

router.get('/tableProfesseursJSON/', login.isLoggedIn, professeurs.tableProfesseursJSON);

/*
**************************
      FIN GESTION PROFESSEURS
 **************************
 */

 /*
 **************************
      TAB IMPORTS
  **************************
  */

  router.get('/nettoyerBaseEleve/', login.isLoggedIn, eleves.nettoyerBaseEleve);


  /*
  **************************
       FIN TAB IMPORTS
   **************************
   */
/*
**************************
      GESTION RAMASSAGES
 **************************
 */
/*
**************************
     definition année
 **************************
 */
router.post('/defAnnee/', login.isLoggedIn, ramassages.defAnnee);

/*
**************************
     renvoie l'année et les périodes
 **************************
 */
router.get('/getAnnee/', login.isLoggedIn, ramassages.getAnnee);

/*
**************************
     sauvegarde ou modifie une période
 **************************
 */
router.post('/sauvePeriode/', login.isLoggedIn, ramassages.sauvePeriode);


/*
**************************
     Supprime une période
 **************************
 */
router.post('/suppPeriode/', login.isLoggedIn, ramassages.suppPeriode);
/*
**************************
     Bilan
 **************************
 */
router.post("/decompteHeuresJSON/", login.isLoggedIn, ramassages.decompteHeuresJSON);




module.exports = router;
