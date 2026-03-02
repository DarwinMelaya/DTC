const multer = require("multer");
const { ensureNetworkShare } = require("../controllers/googleDrive");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("document");

const uploadMiddleware = async (req, res, next) => {
  try {
    await ensureNetworkShare();
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: "Error uploading file" });
      }
      next();
    });
  } catch (error) {
    console.error("Network share unavailable:", error.message);
    res.status(500).json({ message: "Unable to access network share" });
  }
};

module.exports = uploadMiddleware;
