const express = require("express");
const router = express.Router();
const { addReceiver, getReceivers, editReceiver, deleteReceiver } = require("../controllers/receiverNameControllers");

router.post("/add-receiver", addReceiver);
router.get("/get-receiver", getReceivers);
router.put("/edit-receiver/:id", editReceiver); 
router.delete("/delete-receiver/:id", deleteReceiver); 

module.exports = router;
