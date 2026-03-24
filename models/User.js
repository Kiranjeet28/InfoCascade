


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  branch: String,
  year: String,
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
