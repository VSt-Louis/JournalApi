const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const UserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  username: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);