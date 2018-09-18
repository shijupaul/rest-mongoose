require('./config')
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/config');
const {Todos} = require('./model/todos');
const {User} = require('./model/user');
const {authenticate} = require('./middleware/authenticate');

const port = process.env.PORT;

var app = express();
app.use(bodyParser.json()); // use json parser for body

app.post('/todos', (req,res) => {
  var todosNew = new Todos({
    text: req.body.text
  });
  todosNew.save()
    .then((doc) => {res.send(doc)})
    .catch((err) => {res.status(400).send(err)})
});

app.get('/todos', (req,res) => {
  Todos.find()
    .then((todos) => {
      res.send({todos});
    })
    .catch((err) => {
      res.status(400).send(err);
    })
});

app.get('/todos/:id', (req,res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send({message: `Invalid ObjectId ${id}`})
  }
  Todos.findById(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send({message: `Object not found matching Id ${id}`})
      }
      res.send({todo})
    })
    .catch((err) => {
      res.status(400).send({message: `Object not found matching Id ${id}`})
    })
});

app.delete('/todos/:id', (req,res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send({message: `Invalid ObjectId ${id}`});
  }
  Todos.findByIdAndRemove(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send({message: `Object not found matching Id ${id}`});
      }
      res.send({todo});
    })
    .catch((err) => {
      res.status(400).send({message: `Object not found matching Id ${id}`})
    })

});

app.put('/todos/:id', (req,res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send({message: `Invalid ObjectId ${id}`});
  }
  var object = _.pick(req.body, ['text', 'completed']);
  if (_.isBoolean(object.completed) && object.completed) {
    object.completedAt = new Date().getTime();
  } else {
    object.completed = false;
    object.completedAt = null;
  }
  Todos.findByIdAndUpdate(id, {$set: object}, {new: true})
    .then( (todo) => {
      if (!todo) {
        return res.status(404).send({message: `Object not found matching Id ${id}`});
      }
      res.send({todo});
    })
    .catch( (err) => res.status(400).send({message: `Object not found matching Id ${id}`}));
});

app.post('/users', (req,res) => {
  var body = _.pick(req.body, ['email','password']);
  var user = new User(body);
  user.save()
    .then((user) => {
      return user.generateAuthToken() // returns the promise along with it's then
    })
    .then((token) => { // will get token --> promise and it's then will get executed
      //var body = _.pick(user, ['email', '_id']); // same user object in memory
      res.header('x-auth', token).send(user); // custom header starts with x-
    })
    .catch((err) => res.status(400).send(err))
})

// calling the custom middleware -- can have number of functions in the list
app.get('/users/me', authenticate ,(req,res) => {
  res.send(req.user);
});

app.post('/users/login', (req,res) => {
  var body = _.pick(req.body, ['email','password']);
  User.findByCredentials(body.email, body.password)
    .then((user) => {
      user.generateAuthToken()
      .then((token) => {
        res.header('x-auth', token).send(user);
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(400).send(err);
    })
})

app.delete('/users/me/token', authenticate, (req,res) => {
  req.user.removeToken(req.token)
    .then(() => {
      res.send()
    })
    .catch((err) => res.status(400).send())
})


app.listen(port, () => {
  console.log(`started server on port ${port}`);
})

module.exports = {app}
