const jwt = require('jsonwebtoken');

var data = {
  id: 1000
}
var token = jwt.sign(data,'shiju');
console.log(token);

var decoded = jwt.verify(token, 'shiju');
console.log(decoded);
