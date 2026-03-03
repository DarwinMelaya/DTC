import axios from "axios";
import React, { useRef, useState } from "react";
import { X } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const Notification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      className={`absolute top-4 right-4 p-4 rounded-md text-white shadow-lg z-[1001] ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

const AddIncomingRoModal = ({ isOpen, onClose, onDocumentAdded }) => {
  const addUrl = `${API_BASE_URL}/api/incoming-ro/add-document`;

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    receiverName: "",
    particulars: "",
    dateReceived: "",
  });

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

    if (!formData.receiverName?.trim() || !formData.particulars?.trim() || !formData.dateReceived) {
      setNotification({ message: "Receiver Name, Particulars, and Date Received are required.", type: "error" });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const payload = new FormData();
    payload.append("receiverName", formData.receiverName.trim());
    payload.append("particulars", formData.particulars.trim());
    payload.append("dateReceived", formData.dateReceived);
    if (file) payload.append("document", file);

    try {
      await axios.post(addUrl, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({ receiverName: "", particulars: "", dateReceived: "" });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      setNotification({ message: "Incoming RO document added successfully!", type: "success" });

      if (onDocumentAdded) onDocumentAdded();
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error adding Incoming RO document:", error);
      setNotification({
        message: error.response?.data?.message || "Error adding document.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleClose = () => {
    setFormData({ receiverName: "", particulars: "", dateReceived: "" });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    setNotification(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
      <Notification message={notification?.message} type={notification?.type} />
      <div className="bg-white text-slate-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Add Incoming from RO
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Receiver Name
            </label>
            <input
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              type="text"
              placeholder="Enter receiver name"
              className="block w-full rounded-md px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Particulars
            </label>
            <input
              name="particulars"
              value={formData.particulars}
              onChange={handleChange}
              type="text"
              placeholder="Enter particulars"
              className="block w-full rounded-md px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Date Received
            </label>
            <input
              name="dateReceived"
              type="date"
              value={formData.dateReceived}
              onChange={handleChange}
              className="block w-full rounded-md px-3 py-2 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Upload Document (optional)
            </label>
            <input
              ref={fileInputRef}
              onChange={handleFileChange}
              type="file"
              className="block w-full rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700"
            />
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomingRoModal;
