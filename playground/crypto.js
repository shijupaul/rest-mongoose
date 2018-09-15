const {SHA256} = require('crypto-js');

var message = "I am shiju Paul";
var encryptedMessage = SHA256(message);

console.log(`Original Message: ${message}`);
console.log(`Encrypted Message: ${encryptedMessage.toString()}`);
