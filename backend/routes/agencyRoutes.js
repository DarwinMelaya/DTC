const express = require("express");
const router = express.Router();
const {
  addAgency,
  getAgency,
  deleteAgency,
  updateAgency,
} = require("../controllers/agencyControllers");

router.get("/get-agency", getAgency);
router.post("/add-agency", addAgency);
router.put("/edit-agency/:id", updateAgency);
router.delete("/delete-agency/:id", deleteAgency);


module.exports = router;
