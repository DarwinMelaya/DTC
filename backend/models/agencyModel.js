const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  agencyName: { type: String, required: true }
});

const Agency = mongoose.model('Agency', agencySchema);
module.exports = Agency;
