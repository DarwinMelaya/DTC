const path = require("path");
const fs = require("fs");

// Base directory where uploaded files (e.g. PDFs) are stored on the backend.
// By default this is `<project-root>/backend/uploads`, but you can override it
// via the NETWORK_SHARE_PATH environment variable if needed.
const NETWORK_SHARE_PATH =
  process.env.NETWORK_SHARE_PATH ||
  path.join(__dirname, "..", "uploads");

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

const sanitizePathSegment = (segment = "") =>
  segment
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\.+/g, ".")
    .trim();

async function ensureNetworkSubdir(subdir) {
  const baseDir = await ensureNetworkShare();
  if (!subdir) return baseDir;

  const safeSubdir = sanitizePathSegment(subdir);
  const resolved = path.join(baseDir, safeSubdir);
  await fs.promises.mkdir(resolved, { recursive: true });
  return resolved;
}

async function uploadFile(fileBuffer, fileName, options = {}) {
  try {
    const baseDir = await ensureNetworkSubdir(options?.subdir);
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

module.exports = {
  uploadFile,
  ensureNetworkShare,
  ensureNetworkSubdir,
  NETWORK_SHARE_PATH,
};
