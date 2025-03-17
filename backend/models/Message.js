const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  seen: { type: Boolean, default: false }, // New field
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
