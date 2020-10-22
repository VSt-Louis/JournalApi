const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const JournalSchema = new Schema({
  userId: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  entries: {
    type: Array,
    required: true,
    default: []
  }
});

module.exports = Journal = mongoose.model('journal', JournalSchema);