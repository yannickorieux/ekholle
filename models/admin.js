const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



let AdminSchema = new mongoose.Schema({
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
    default: false,
   },
   povoir :{
     type: String,
     required: true,
   },
   annee :{
     debut : {
       type: Date
     },
     fin : {
       type: Date
     }
   },
   periodes : [
     {
       numPeriode : {type :String} ,
       debutPeriode : {type :Date} ,
       finPeriode : {type :Date} ,
       description : {type :String} ,
     }
   ]
});

//authenticate input against database
AdminSchema.statics.authenticate = function(Admin,login, password, callback) {
  Admin.findOne({
      login : login
    })
    .exec(function(err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        let err = new Error('Admin non trouvé.');
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
AdminSchema.pre('save', function(next) {
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

AdminSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = function(prefix) {
    return mongoose.model('Admin', AdminSchema, prefix+'_admins' );
};
