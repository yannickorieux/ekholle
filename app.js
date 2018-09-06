const  createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session      = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser')
//Ajout mongo
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const config = require('./secret');

mongoose.Promise = global.Promise;
//connect to MongoDB
const promise = mongoose.connect('mongodb://'+config.loginDb+':'+config.pwdDb+'@localhost/dbEKholle');
const db = mongoose.connection;
//mongoose.set('debug',true);
//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('base mongodb connectee')// we're connected!
});


const app = express();



const sessionMiddleware = session({
  secret: 'jeDetesteLeJardinage',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 3600000},
  store: new MongoStore({
    mongooseConnection: db
  })
});




app.use(sessionMiddleware);

let sessionFlash = function(req, res, next) {
  res.locals.messages = req.flash();
  next();
}

app.use(flash());
app.use(sessionFlash); //utile pour redirect




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const professeurRouter = require('./routes/professeur');
const eleveRouter = require('./routes/eleve');

//let listeEtab=['bergson','test']
let Etablissement=require('./models/etablissement');

let liste =[]
Etablissement.find({}, function(err, result) {
    if (err) throw err;
    liste=result;
  });


let getEtab = function(req, res, next) {
  let etab=req.url.split('/').pop();
  if(etab !=='' && etab !=='choixEtab' ){ //on detecte une chaine de caractere et on verifie qu'elle correspond à un etab
    index = liste.findIndex(item => item.prefix === etab); //on regarde si etab est dans la liste
    if (typeof req.session.etab!=='undefined'){
      //attention si session deja enregistree
      if(etab===req.session.etab){
        return res.redirect('/');
      }
      else if(index!==-1){
        //on change d'etablissement car celui-ci est present dans la base
        req.session.etab=etab;
        req.session.lycee=liste[index].nom;
        return res.redirect('/users/logout');
      }
      else{
        // etablissement non reconnu
        return next();
      }
    }
    else{
      //session non enregistree
      if(index!==-1){
        //l'etab est dans la base je peux l'inscrire dans la session
        req.session.etab=etab;
        req.session.lycee=liste[index].nom;
        return res.redirect('/');
      }
      else{
        // url non reconnu
        res.locals.message ="Veuillez vous connecter avec l'url de votre établissement";
        res.locals.error="Veuillez vous connecter avec l'url de votre établissement";
        return res.redirect('/');
      }
    }
  } // chaine vide et pas de cookie enregistre on reste sur la page d'index
  else return next();
}



app.use(bodyParser.json({limit: '50mb'}) );
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit:50000
}));

app.use(express.static(__dirname, { dotfiles: 'allow' } ));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
app.use(express.static(__dirname + '/node_modules/summernote/dist'));
app.use(getEtab);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/professeur', professeurRouter);
app.use('/eleve', eleveRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
