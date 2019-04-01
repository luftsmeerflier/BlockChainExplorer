'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const blockHeightSchema = mongoose.Schema({
  height: { type: Number }
});


blockHeightSchema.methods.serialize = function() {
  return {
    height: this.height
  };
};



// UserSchema.methods.validatePassword = function(password) {
//   return bcrypt.compare(password, this.password);
// };

// UserSchema.statics.hashPassword = function(password) {
//   return bcrypt.hash(password, 10);
// };

const BlockHeight = mongoose.model('blockchain', blockHeightSchema);

module.exports = {BlockHeight};
