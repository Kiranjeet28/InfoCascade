const mongoose = require('mongoose');
const noticeSchema = new mongoose.Schema({
  title: String,
  message: String,
  date: { type: Date, default: Date.now },
  postedBy: {
    name: String,
    branch: String,
    year: String
  }
});
module.exports = mongoose.model('Notice', noticeSchema);
