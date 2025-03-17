const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 2, maxlength: 50 },
});

module.exports = mongoose.model('User', userSchema);