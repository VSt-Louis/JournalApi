const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const BankSchema = new Schema({
  userId: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  bank: {
    type: Schema.Types.Mixed,
    required: true,
    default: {balance: 0, history: [], pending_transfers: []}
  }
});

module.exports = Bank = mongoose.model('bank', BankSchema);