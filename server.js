require('./config')
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/config');
const {Todos} = require('./model/todos');
const {User} = require('./model/user');

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


app.listen(port, () => {
  console.log(`started server on port ${port}`);
})

module.exports = {app}
