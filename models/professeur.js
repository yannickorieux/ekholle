const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



let ProfesseurSchema = new mongoose.Schema({
  login: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  changePwd: {
    type: Boolean,
     default: false
   },
   matieres: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: "ColleurMatiere",
     required: true
   }],
   grade : {
     type: String,
     default: ''
   },
   email : {
     type: String,
     default: ''
   },
   disciplines : [
     {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Matiere",
     }
   ]

});

//authenticate input against database
ProfesseurSchema.statics.authenticate = function(Professeur,login, password, callback) {
  Professeur.findOne({
      login : login
    })
    .exec(function(err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        let err = new Error('Professeur non trouvé.');
        err.status = 401;
        return callback(err);
      }
      if (user.changePwd===false){
        if (password === user.password) {
          return callback(null, user);
        } else {
          return callback();
        }
      }
      else{
        bcrypt.compare(password, user.password, function(err, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      }

    });
}

//hashing a password before saving it to the database
ProfesseurSchema.pre('save', function(next) {
  let user = this;
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

ProfesseurSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


module.exports = function(prefix) {

  let Professeur=mongoose.model('Professeur', ProfesseurSchema, prefix + '_professeurs');
    return Professeur ;
};
