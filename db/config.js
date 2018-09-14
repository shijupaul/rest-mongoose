const mongoose = require('mongoose');

mongoose.Promise = global.Promise; // use the default promise comes with lang
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
