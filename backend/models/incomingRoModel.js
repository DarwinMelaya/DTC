const mongoose = require("mongoose");

const incomingRoSchema = new mongoose.Schema({
  receiverName: {
    type: String,
    required: true,
  },
  particulars: {
    type: String,
    required: true,
  },
  dateReceived: {
    type: String,
    required: true,
  },
  documentName: {
    type: String,
    required: false,
  },
  documentPath: {
    type: String, // Path to file on network share
    required: false,
  },
});

module.exports = mongoose.model("IncomingRo", incomingRoSchema);
