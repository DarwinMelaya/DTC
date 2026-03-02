const path = require("path");
const fs = require("fs");

const NETWORK_SHARE_PATH =
  process.env.NETWORK_SHARE_PATH ||
  "\\\\PSTOMarSynology\\PSTO Marinduque FILES\\Document Tracking Storage";

const ensureNetworkShare = async () => {
  try {
    await fs.promises.mkdir(NETWORK_SHARE_PATH, { recursive: true });
    return NETWORK_SHARE_PATH;
  } catch (error) {
    console.error("Unable to initialize network share:", error.message);
    throw error;
  }
};

const sanitizeFileName = (fileName = "") =>
  fileName.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_");

async function uploadFile(fileBuffer, fileName) {
  try {
    const baseDir = await ensureNetworkShare();
    const safeName = sanitizeFileName(fileName);
    const stampedName = `${Date.now()}-${safeName}`;
    const targetPath = path.join(baseDir, stampedName);
    await fs.promises.writeFile(targetPath, fileBuffer);
    return { fileUrl: targetPath, storedFileName: stampedName };
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}

module.exports = { uploadFile, ensureNetworkShare, NETWORK_SHARE_PATH };
