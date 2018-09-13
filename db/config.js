const mongoose = require('mongoose');

mongoose.Promise = global.Promise; // use the default promise comes with lang
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
