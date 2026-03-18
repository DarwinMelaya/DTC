const IncomingRo = require("../models/incomingRoModel");
const path = require("path");
const { Types } = require("mongoose");
const multer = require("multer");
const {
  uploadBufferToGridFS,
  openDownloadStreamFromGridFS,
} = require("../utils/gridfs");

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
      try {
        const uploadResult = await uploadBufferToGridFS(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );
        documentName = req.file.originalname;
        documentPath = uploadResult.fileId.toString();
      } catch (error) {
        console.error("GridFS upload error (Incoming RO):", error);
        return res
          .status(500)
          .json({ message: "File upload to MongoDB failed!" });
      }
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
      try {
        const uploadResult = await uploadBufferToGridFS(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );
        document.documentName = req.file.originalname;
        document.documentPath = uploadResult.fileId.toString();
      } catch (error) {
        console.error("GridFS upload error (Incoming RO update):", error);
        return res
          .status(500)
          .json({ message: "File upload to MongoDB failed!" });
      }
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

    let fileId;
    try {
      fileId = new Types.ObjectId(document.documentPath);
    } catch (e) {
      return res.status(400).json({ message: "Invalid stored file reference" });
    }

    const downloadName = document.documentName || "document.pdf";
    res.setHeader(
      "Content-Type",
      "application/pdf",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(downloadName)}"`,
    );

    const downloadStream = openDownloadStreamFromGridFS(fileId);
    downloadStream.on("error", (err) => {
      console.error("GridFS download error (Incoming RO):", err);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Unable to download document",
          error: err.message,
        });
      }
    });
    downloadStream.pipe(res);
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
