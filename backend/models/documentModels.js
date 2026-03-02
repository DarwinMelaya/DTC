const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  agency: {
    type: String,
    required: true,
  },
  purposeOfLetter: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["incoming", "outgoing"],
    required: true,
  },
  fileName: {
    type: String,
    required: false,
  },
  fileData: {
    type: String, // Absolute path to the file on the network share
    required: false,
  },
  deliveryMethod: {
    type: String,
    enum: ["Email", "Physical Document"],
    required: false,
  },
});

module.exports = mongoose.model("Document", documentSchema);
