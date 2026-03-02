const mongoose = require("mongoose");


const receiverSchema = new mongoose.Schema({
  receiver: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Receiver", receiverSchema);
