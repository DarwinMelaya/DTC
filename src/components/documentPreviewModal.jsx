import React, { useMemo, useState } from "react";
import PdfPreview from "./pdfPreview";

const looksLikeBase64 = (value) => {
  if (!value || typeof value !== "string") return false;
  const cleaned = value.replace(/\s/g, "");
  if (cleaned.length < 32) return false;
  return /^[A-Za-z0-9+/=]+$/.test(cleaned);
};

const buildPreviewMeta = (value) => {
  if (!value) return { type: "none", src: null };

  if (value.startsWith("data:application/pdf")) {
    return { type: "base64", src: value };
  }

  if (value.startsWith("data:")) {
    return { type: "base64", src: value };
  }

  if (/^https?:\/\//i.test(value)) {
    return { type: "remote", src: value };
  }

  if (/^file:\/\//i.test(value)) {
    return { type: "fileUrl", src: value };
  }

  if (value.startsWith("\\\\")) {
    return { type: "networkPath", src: value };
  }

  if (looksLikeBase64(value)) {
    return {
      type: "base64",
      src: `data:application/pdf;base64,${value}`,
    };
  }

  return { type: "unknown", src: value };
};

const DocumentPreviewModal = ({ previewFile, setPreviewFile }) => {
  const [copyStatus, setCopyStatus] = useState(null);

  const previewMeta = useMemo(
    () => buildPreviewMeta(previewFile),
    [previewFile]
  );

  if (!previewMeta.src) return null;

  const closeModal = () => {
    setCopyStatus(null);
    setPreviewFile(null);
  };

  const handleCopyPath = async () => {
    if (!previewMeta.src) return;
    try {
      await navigator.clipboard.writeText(previewMeta.src);
      setCopyStatus("Copied!");
    } catch (error) {
      console.error("Failed to copy path:", error);
      setCopyStatus("Copy failed");
    } finally {
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleOpenInNewTab = () => {
    if (!previewMeta.src) return;
    window.open(previewMeta.src, "_blank", "noopener,noreferrer");
  };

  const renderPreviewBody = () => {
    switch (previewMeta.type) {
      case "base64":
        return <PdfPreview base64Data={previewMeta.src} />;
      case "remote":
      case "fileUrl":
        return (
          <iframe
            src={previewMeta.src}
            className="w-full h-[70vh] border rounded"
            title="Document Preview"
          />
        );
      case "networkPath":
      case "unknown":
        return (
          <div className="bg-yellow-50 border border-yellow-200 text-sm p-4 rounded">
            <p className="font-medium mb-2">
              This document is stored on the PSTO network share. Copy the path
              below and open it through File Explorer.
            </p>
            <code className="block bg-white p-2 rounded break-all">
              {previewMeta.src}
            </code>
          </div>
        );
      default:
        return <div>Unsupported file format.</div>;
    }
  };

  const showCopyButton =
    previewMeta.type === "networkPath" || previewMeta.type === "unknown";

  const showOpenButton =
    previewMeta.type === "remote" || previewMeta.type === "fileUrl";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950/70 backdrop-blur-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative z-10 w-[90vw] max-w-5xl">
        <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
        {renderPreviewBody()}

        <div className="flex justify-end items-center gap-3 mt-4">
          {showCopyButton && (
            <button
              onClick={handleCopyPath}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded border border-blue-200"
            >
              {copyStatus ?? "Copy path"}
            </button>
          )}
          {showOpenButton && (
            <button
              onClick={handleOpenInNewTab}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Open in new tab
            </button>
          )}
          <button
            onClick={closeModal}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
