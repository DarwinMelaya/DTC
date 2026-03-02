const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authentication");
const { userLogin, userSignup, userLogout } = require("../controllers/adminController");


router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/logout", userLogout);

module.exports = router;
