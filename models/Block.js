const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  index: Number,
  timestamp: String,
  transactions: [mongoose.Schema.Types.Mixed],
  previousHash: String,
  nonce: Number,
  hash: String,
});

module.exports = mongoose.model('Block', blockSchema);
