const bcrypt = require('bcryptjs');

var password = "Joel123";

// 10 is the number of rounds we use to generate the salt, higher the no - slower algorithm will be
bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
      console.log(`Hash for password '${password}' is '${hash}'`);
  })
})

var passwordHashs = ['$2a$10$PN5yWn5xVqPsfuqPnbWbKOIGSUL1kBFoWeOWrsp3uTPnpOeat9rau',
 '$2a$10$t8FlTEe7zc1mPu7KZ8db3O5jrZdWl9er1tdmUraFzbMXcsNCZxfmC',
 '$2a$10$Mg52POyFH8.gELjqYAXVSes3YrgchHvRrYpIhg.lJH80sZHcIqwee',
 '$2a$10$AfCWvWm5bLlDQz08xc.MjOmhFkTfJ7GUW0j.b1q5NfnOXyP3LTTLe'];

 passwordHashs.forEach((value) => {
   bcrypt.compare(password, value)
    .then((res) => {
      console.log(`comparing '${password}' to '${value}' returned ${res}`);
    })
    .catch((err) => {
      console.log(`comparing '${password}' to '${value}' resulted in error`, err);
    })
 })
