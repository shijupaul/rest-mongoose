const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs')


var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: (props) => `${props.value} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minlenght: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Override toJSON instance method to restrict the properties we expose
userSchema.methods.toJSON = function() {
  return _.pick(this, ['email', '_id']);
}

// Instance method
userSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123');
  user.tokens.push({access, token});
  return user.save() // returning a promise that has then attached to it
    .then(() => {
      return token;
    }); // returns promise
}

// Instance methods
userSchema.methods.removeToken = function(token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  })
}

// Static method
userSchema.statics.findByToken = function(token) {
  var decoded;
  try {
    decoded = jwt.verify(token,'abc123');
    console.log(`Token creation time:${new Date(decoded.iat).toDateString()}, Now:${new Date().toDateString()}`);
  } catch(e) {
    // return new Promise((resolve,reject) => { // return new promise that rejects
    //   reject({error: 'given token is invalid'});
    // })
    return Promise.reject({error: 'given token is invalid'}) // shorter form for the above
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token, //accessing array elements, quotes are needed when we have period in the value
    'tokens.access': decoded.access // accessing array element
  });
}

// Static method
userSchema.statics.findByCredentials = function(email, password) {
  return User.findOne({email})
    .then((user) => {
      if (!user) {
        return Promise.reject({message: `Failed to find matching user with email ${email}`})
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          console.log('outcome:', res)
          if (res) {
            return resolve(user);
          }
          reject({message: `Failed while comparing hashes for email ${email}`});

        })
      });
    })
}

// mongoose middleware -- here before saving
userSchema.pre('save', function(next) {
  var user = this //
  if (user.isModified('password')) { // rehash only if the password is modified
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
          console.log(`Hash for password '${user.password}' is '${hash}'`);
          user.password = hash;
          next();
      })
    })
  } else {
    next();
  }
})

var User = mongoose.model('User', userSchema);

module.exports = {User};
