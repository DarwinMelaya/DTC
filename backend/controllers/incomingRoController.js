const IncomingRo = require("../models/incomingRoModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { uploadFile } = require("./googleDrive");

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("document");

/**
 * Get all Incoming RO documents
 */
const getIncomingRo = async (req, res) => {
  try {
    const documents = await IncomingRo.find().sort({ dateReceived: -1 });
    res.json(documents);
  } catch (error) {
    console.error("Get Incoming RO Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Add Incoming RO document
 */
const addIncomingRo = async (req, res) => {
  try {
    const { receiverName, particulars, dateReceived } = req.body;

    if (!receiverName || !particulars || !dateReceived) {
      return res.status(400).json({
        message: "Receiver Name, Particulars, and Date Received are required.",
      });
    }

    let documentPath = null;
    let documentName = null;

    if (req.file) {
      const uploadResult = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        { subdir: process.env.INCOMING_RO_SUBDIR || "Incoming RO" },
      );
      if (!uploadResult) {
        return res
          .status(500)
          .json({ message: "File upload to network share failed!" });
      }
      documentName = req.file.originalname;
      documentPath = uploadResult.fileUrl;
    }

    const doc = new IncomingRo({
      receiverName,
      particulars,
      dateReceived,
      documentName,
      documentPath,
    });

    await doc.save();

    return res.status(201).json({
      message: "Incoming RO document added successfully",
      document: doc,
    });
  } catch (error) {
    console.error("Add Incoming RO Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Update Incoming RO document
 */
const updateIncomingRo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const { receiverName, particulars, dateReceived } = req.body;

    if (!receiverName || !particulars || !dateReceived) {
      return res.status(400).json({
        message: "Receiver Name, Particulars, and Date Received are required.",
      });
    }

    const document = await IncomingRo.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.receiverName = receiverName;
    document.particulars = particulars;
    document.dateReceived = dateReceived;

    if (req.file) {
      const uploadResult = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        { subdir: process.env.INCOMING_RO_SUBDIR || "Incoming RO" },
      );
      if (!uploadResult) {
        return res
          .status(500)
          .json({ message: "File upload to network share failed!" });
      }
      document.documentName = req.file.originalname;
      document.documentPath = uploadResult.fileUrl;
    }

    await document.save();

    return res.status(200).json({
      message: "Incoming RO document updated successfully",
      document,
    });
  } catch (error) {
    console.error("Update Incoming RO Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Delete Incoming RO document
 */
const deleteIncomingRo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const deleted = await IncomingRo.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: "Document deleted successfully", deletedDocument: deleted });
  } catch (error) {
    console.error("Delete Incoming RO Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Download Incoming RO document file
 */
const downloadIncomingRo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const document = await IncomingRo.findById(id);
    if (!document || !document.documentPath) {
      return res.status(404).json({ message: "Document or file not found" });
    }

    const filePath = path.resolve(document.documentPath);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Stored file could not be located" });
    }

    const downloadName = document.documentName || path.basename(filePath);
    return res.download(filePath, downloadName);
  } catch (error) {
    console.error("Download Incoming RO Error:", error);
    return res.status(500).json({
      message: "Unable to download document",
      error: error.message,
    });
  }
};

module.exports = {
  getIncomingRo,
  addIncomingRo,
  updateIncomingRo,
  deleteIncomingRo,
  downloadIncomingRo,
  upload,
};
