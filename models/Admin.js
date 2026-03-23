const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  branch: String,
  year: String
});

module.exports = mongoose.model('Admin', adminSchema);
