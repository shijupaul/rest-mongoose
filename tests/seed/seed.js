const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todos} = require('./../../model/todos');
const {User} = require('./../../model/user');

var userOneId = new ObjectId();
var userTwoId = new ObjectId();
var access = 'auth';

var users = [{
  _id: userOneId,
  email: 'shijuppaul@hotmail.com',
  password: 'Joel2004',
  tokens: [{
    token: jwt.sign({_id: userOneId.toHexString(), access}, process.env.JWT_SECRET),
    access,
  }]
},{
  _id: userTwoId,
  email: 'shiju.paul@blackcatsolutions.co.uk',
  password: 'Joel2004',
  tokens: [{
    token: jwt.sign({_id: userTwoId.toHexString(), access}, process.env.JWT_SECRET),
    access,
  }]
}]

var todos = [
  {_id: new ObjectId(), text: 'todo 1', _creator: userOneId},
  {_id: new ObjectId(), text: 'todo 2', _creator: userOneId},
  {_id: new ObjectId(), text: 'todo 3', _creator: userTwoId},
  {_id: new ObjectId(), text: 'todo 4', _creator: userTwoId, completed: true, completedAt: 123}
];

const populateTodos = (done) => {
  Todos.remove({})
    .then(() => {
      return Todos.insertMany(todos);
    })
    .then(() => done());
};

// insertMany method won't call middleware and our password won't get hashed
// middleware code is --> userSchema.pre('save', function(next) -- only in save
const populateUsers = (done) => {
  User.remove({})
    .then(() => {
      var userOnePromise = new User(users[0]).save();
      var userTwoPromise = new User(users[1]).save();
      //resolving multiple promises -- Promise.all
      return Promise.all([userOnePromise, userTwoPromise]);
    })
    .then(() => done())
}

module.exports = {todos, populateTodos, users, populateUsers}
