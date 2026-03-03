const express = require("express");
const {
  getIncomingRo,
  addIncomingRo,
  deleteIncomingRo,
  downloadIncomingRo,
  upload,
} = require("../controllers/incomingRoController");

const router = express.Router();

router.get("/get-document", getIncomingRo);
router.post("/add-document", upload, addIncomingRo);
router.delete("/delete-document/:id", deleteIncomingRo);
router.get("/download/:id", downloadIncomingRo);

module.exports = router;
