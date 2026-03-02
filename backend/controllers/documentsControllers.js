const Document = require("../models/documentModels");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFile } = require("./googleDrive");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Add a new document
 */
const addDocument = async (req, res) => {
  try {
    const { agency, purposeOfLetter, date, name, code, type } = req.body;
    const deliveryMethod =
      req.body.deliveryMethod ??
      req.body.delivery_method ??
      req.body.deliverymethod;
    console.log("[addDocument] req.body keys:", Object.keys(req.body || {}));
    console.log("[addDocument] req.body.deliveryMethod:", deliveryMethod);

    if (!agency || !purposeOfLetter || !date || !code || !type) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (type === "outgoing" && !deliveryMethod) {
      return res.status(400).json({
        message: "Delivery Method is required for outgoing documents.",
      });
    }

    let fileUrl = null;
    let fileName = null;

    if (req.file) {
      const uploadResult = await uploadFile(
        req.file.buffer,
        req.file.originalname,
      );
      if (!uploadResult) {
        return res
          .status(500)
          .json({ message: "File upload to network share failed!" });
      }

      fileName = req.file.originalname;
      fileUrl = uploadResult.fileUrl;
    }

    // Save document with the Google Drive file URL
    const document = new Document({
      agency,
      purposeOfLetter,
      date,
      name,
      code,
      type,
      fileName,
      fileData: fileUrl, // Absolute path on the network share
      deliveryMethod,
    });

    await document.save();
    console.log(
      "[addDocument] saved document.deliveryMethod:",
      document.deliveryMethod,
    );

    return res.status(201).json({
      message: "Document added successfully",
      document,
    });
  } catch (error) {
    console.error("Add Document Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Get all documents
 */
const getDocument = async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (error) {
    console.error("Get Documents Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Delete document
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const deletedDocument = await Document.findByIdAndDelete(id);

    if (!deletedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: "Document deleted successfully", deletedDocument });
  } catch (error) {
    console.error("Delete Document Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Update document
 */
const updateDocument = async (req, res) => {
  try {
    const { agency, purposeOfLetter, date, name, code, type, deliveryMethod } =
      req.body;

    if (!agency || !purposeOfLetter || !date || !code || !type) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.agency = agency;
    document.purposeOfLetter = purposeOfLetter;
    document.date = date;
    document.name = name;
    document.code = code;
    document.type = type;
    document.deliveryMethod = deliveryMethod;

    if (req.file) {
      const uploadResult = await uploadFile(
        req.file.buffer,
        req.file.originalname,
      );
      if (!uploadResult) {
        return res.status(500).json({ message: "File upload failed!" });
      }
      document.fileName = req.file.originalname || document.fileName;
      document.fileData = uploadResult.fileUrl;
    }

    await document.save();

    return res.status(200).json({
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const document = await Document.findById(id);
    if (!document || !document.fileData) {
      return res.status(404).json({ message: "Document or file not found" });
    }

    const filePath = path.resolve(document.fileData);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Stored file could not be located" });
    }

    const downloadName = document.fileName || path.basename(filePath);
    return res.download(filePath, downloadName);
  } catch (error) {
    console.error("Download Document Error:", error);
    return res.status(500).json({
      message: "Unable to download document",
      error: error.message,
    });
  }
};

module.exports = {
  addDocument,
  getDocument,
  deleteDocument,
  updateDocument,
  downloadDocument,
  upload,
};
