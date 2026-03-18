const Document = require("../models/documentModels");
const multer = require("multer");
const path = require("path");
const { Types } = require("mongoose");
const {
  uploadBufferToGridFS,
  openDownloadStreamFromGridFS,
} = require("../utils/gridfs");

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

    let fileId = null;
    let fileName = null;

    if (req.file) {
      try {
        const uploadResult = await uploadBufferToGridFS(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );
        fileName = req.file.originalname;
        fileId = uploadResult.fileId.toString();
      } catch (error) {
        console.error("GridFS upload error:", error);
        return res
          .status(500)
          .json({ message: "File upload to MongoDB failed!" });
      }
    }

    // Save document with the GridFS file ID
    const document = new Document({
      agency,
      purposeOfLetter,
      date,
      name,
      code,
      type,
      fileName,
      fileData: fileId, // GridFS file ID as string
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
      try {
        const uploadResult = await uploadBufferToGridFS(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );
        document.fileName = req.file.originalname || document.fileName;
        document.fileData = uploadResult.fileId.toString();
      } catch (error) {
        console.error("GridFS upload error:", error);
        return res.status(500).json({ message: "File upload failed!" });
      }
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

    let fileId;
    try {
      fileId = new Types.ObjectId(document.fileData);
    } catch (e) {
      return res.status(400).json({ message: "Invalid stored file reference" });
    }

    const downloadName = document.fileName || "document.pdf";
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
      console.error("GridFS download error:", err);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: "Unable to download document", error: err.message });
      }
    });
    downloadStream.pipe(res);
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
