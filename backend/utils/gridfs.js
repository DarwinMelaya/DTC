const mongoose = require("mongoose");

let bucket;

function initGridFS() {
  const conn = mongoose.connection;
  if (!conn.db) {
    throw new Error("MongoDB connection is not ready for GridFS");
  }
  const { GridFSBucket } = mongoose.mongo;
  bucket =
    bucket ||
    new GridFSBucket(conn.db, {
      bucketName: process.env.GRIDFS_BUCKET_NAME || "uploads",
    });
  return bucket;
}

function getBucket() {
  if (!bucket) {
    initGridFS();
  }
  return bucket;
}

async function uploadBufferToGridFS(buffer, filename, mimeType) {
  const uploadStream = getBucket().openUploadStream(filename, {
    contentType: mimeType || "application/octet-stream",
  });

  return new Promise((resolve, reject) => {
    uploadStream.end(buffer, (err) => {
      if (err) return reject(err);
      resolve({
        fileId: uploadStream.id,
        filename: uploadStream.filename,
      });
    });
  });
}

function openDownloadStreamFromGridFS(fileId) {
  return getBucket().openDownloadStream(fileId);
}

module.exports = {
  initGridFS,
  uploadBufferToGridFS,
  openDownloadStreamFromGridFS,
};

