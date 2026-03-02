import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import "../../App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const Notification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      className={`absolute top-4 right-4 p-4 rounded-md text-white shadow-lg ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
      style={{ zIndex: 1001 }}
    >
      {message}
    </div>
  );
};

/**
 * Reusable edit modal for incoming/outgoing documents.
 * - Uses multipart/form-data to support optional file replacement.
 * - Shows Delivery Method only for outgoing docs.
 */
const EditDocumentModal = ({ isOpen, onClose, document, onUpdated }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    agency: "",
    name: "",
    code: "",
    purposeOfLetter: "",
    date: "",
    type: "",
    deliveryMethod: "",
  });

  useEffect(() => {
    if (!isOpen || !document) return;
    setFormData({
      agency: document.agency || "",
      name: document.name || "",
      code: document.code || "",
      purposeOfLetter: document.purposeOfLetter || "",
      date: document.date ? String(document.date).slice(0, 10) : "",
      type: document.type || "",
      deliveryMethod: document.deliveryMethod || "",
    });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    setNotification(null);
  }, [isOpen, document]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!document?._id) return;

    const payload = new FormData();
    payload.append("agency", formData.agency);
    payload.append("name", formData.name);
    payload.append("code", formData.code);
    payload.append("purposeOfLetter", formData.purposeOfLetter);
    payload.append("date", formData.date);
    payload.append("type", formData.type);
    if (formData.type === "outgoing") {
      payload.append("deliveryMethod", formData.deliveryMethod);
    }
    if (file) payload.append("document", file);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/document/update-document/${document._id}`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setNotification({ message: "Document updated successfully!", type: "success" });
      if (onUpdated) onUpdated(response.data.document);

      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 800);
    } catch (error) {
      console.error(
        "Error updating document:",
        error.response ? error.response.data : error.message,
      );
      setNotification({ message: "Error updating document.", type: "error" });
      setTimeout(() => setNotification(null), 2500);
    }
  };

  const handleClose = () => {
    setNotification(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    onClose();
  };

  if (!isOpen || !document) return null;

  const nameLabel = document.type === "outgoing" ? "Sender Name" : "Name";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <Notification message={notification?.message} type={notification?.type} />
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Document</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-row space-x-4">
            <div className="space-y-4 w-full">
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  Agency
                </label>
                <input
                  name="agency"
                  value={formData.agency}
                  onChange={handleChange}
                  type="text"
                  className="block rounded-md px-2 py-2 border border-gray-300 bg-white w-full"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  {nameLabel}
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  className="block w-full rounded-md px-2 py-2 border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  Purpose of Letter
                </label>
                <input
                  name="purposeOfLetter"
                  type="text"
                  value={formData.purposeOfLetter}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-gray-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  Date
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  Code
                </label>
                <input
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-gray-300 bg-white"
                />
              </div>

              {formData.type === "outgoing" && (
                <div>
                  <label className="text-gray-700 font-medium block mb-1">
                    Delivery Method
                  </label>
                  <select
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                    className="block w-full rounded-md px-2 py-2 border border-gray-300 bg-white"
                    required
                  >
                    <option value="">Select delivery method</option>
                    <option value="Email">Email</option>
                    <option value="Physical Document">Physical Document</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  Replace Document (optional)
                </label>
                <input
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  type="file"
                  className="block w-full rounded-md px-2 py-2 border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentModal;

