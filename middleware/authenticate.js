const {User} = require('./../model/user');

// custom middleware without using app.use
var authenticate = (req,res, next) => {
  var token = req.header('x-auth');
  User.findByToken(token)
    .then((user) => {
      if (!user) {
        return Promise.reject({error: 'No matching user for the given token'}) // catch will handle this
      }
      req.user = user;
      req.token = token;
      next();
    })
    .catch((err) => {
      res.status(401).send(err);
    })
}

module.exports = {authenticate}
