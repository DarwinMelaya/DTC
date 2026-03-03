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

const AddOutgoingModal = ({ isOpen, onClose, onDocumentAdded }) => {
  const api = `${API_BASE_URL}/api/document/get-document`;
  const add = `${API_BASE_URL}/api/document/add-document`;
  const FETCHAPI = `${API_BASE_URL}/api/receiver/get-receiver`;
  const FETCHAGENCYAPI = `${API_BASE_URL}/api/agency/get-agency`;

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [receivers, setReceivers] = useState([]);
  const [filteredReceivers, setFilteredReceivers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isAgencyDropdownVisible, setIsAgencyDropdownVisible] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const agencyDropdownRef = useRef(null);

  const getAgency = async () => {
    try {
      const response = await axios.get(FETCHAGENCYAPI);
      setAgencies(response.data);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getAgency();
      getReceivers();
    }
  }, [isOpen]);

  const getReceivers = async () => {
    try {
      const response = await axios.get(FETCHAPI);
      setReceivers(response.data);
      setFilteredReceivers(response.data);
    } catch (error) {
      console.error("Error fetching receivers:", error);
    }
  };

  const [formData, setFormData] = useState({
    agency: "",
    name: "",
    code: "",
    purposeOfLetter: "",
    date: "",
    type: "outgoing",
    deliveryMethod: "",
  });

  useEffect(() => {
    if (formData.type && isOpen) {
      fetchLastCode();
    }
  }, [formData.type, isOpen]);

  const fetchLastCode = async () => {
    try {
      const res = await axios.get(api);
      const allDocs = res.data;

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const prefix = "OUT";

      const filteredDocs = allDocs
        .filter(
          (doc) =>
            doc.type === "outgoing" &&
            doc.code &&
            doc.code.startsWith(`${prefix}-${currentYear}-`),
        )
        .sort((a, b) => b.code.localeCompare(a.code));

      let newCode;
      if (filteredDocs.length > 0) {
        const lastCode = filteredDocs[0].code;
        const lastNumber = parseInt(lastCode.split("-")[2], 10);

        newCode = `${prefix}-${currentYear}-${String(lastNumber + 1).padStart(
          3,
          "0",
        )}`;
      } else {
        newCode = `${prefix}-${currentYear}-001`;
      }

      setFormData((prev) => ({ ...prev, code: newCode }));
    } catch (error) {
      console.error("Error fetching last document:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "name") {
      const filtered = receivers.filter((receiver) =>
        receiver.receiver.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredReceivers(filtered);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile);
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting form...");
    console.log("Form Data:", formData);

    const formDataToSend = new FormData();
    formDataToSend.append("agency", formData.agency);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("code", formData.code);
    formDataToSend.append("purposeOfLetter", formData.purposeOfLetter);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("type", "outgoing");
    formDataToSend.append("deliveryMethod", formData.deliveryMethod);
    formDataToSend.append("document", file);

    console.log(
      "FormData before sending:",
      Object.fromEntries(formDataToSend.entries()),
    );

    try {
      const response = await axios.post(add, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response from server:", response.data);

      setFormData({
        agency: "",
        name: "",
        code: "",
        purposeOfLetter: "",
        date: "",
        type: "outgoing",
        deliveryMethod: "",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      setNotification({
        message: "Document uploaded successfully!",
        type: "success",
      });

      if (onDocumentAdded) {
        onDocumentAdded();
      }

      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1500);
    } catch (error) {
      console.error(
        "Error adding document:",
        error.response ? error.response.data : error.message,
      );
      setNotification({ message: "Error uploading document.", type: "error" });
    }

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }

      if (
        agencyDropdownRef.current &&
        !agencyDropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsAgencyDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setFormData({
      agency: "",
      name: "",
      code: "",
      purposeOfLetter: "",
      date: "",
      type: "outgoing",
      deliveryMethod: "",
    });
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setNotification(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <Notification message={notification?.message} type={notification?.type} />
      <div className="bg-white text-slate-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Add Outgoing Document
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-row space-x-4">
            <div className="space-y-4 w-full">
              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Agency
                </label>
                <div className="relative w-full" ref={agencyDropdownRef}>
                  <input
                    name="agency"
                    value={formData.agency}
                    onClick={() => setIsAgencyDropdownVisible(true)}
                    onChange={handleChange}
                    type="text"
                    className="block rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 placeholder-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Enter agency name"
                  />
                  {isAgencyDropdownVisible && agencies.length > 0 && (
                    <ul className="absolute bg-white text-slate-900 border border-slate-300 mt-2 max-h-40 overflow-y-auto w-full z-10 shadow-lg rounded-md">
                      {agencies.map((agency) => (
                        <li
                          key={agency._id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              agency: agency.agencyName,
                            });
                            setIsAgencyDropdownVisible(false);
                          }}
                          className="p-2 cursor-pointer hover:bg-slate-100 text-slate-900"
                        >
                          {agency.agencyName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Sender Name
                </label>
                <div className="relative w-full">
                  <input
                    ref={inputRef}
                    name="name"
                    value={formData.name}
                    onClick={() => setIsDropdownVisible(true)}
                    onChange={handleChange}
                    type="text"
                    className="block w-full rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Type sender name"
                  />
                  {isDropdownVisible && filteredReceivers.length > 0 && (
                    <ul
                      ref={dropdownRef}
                      className="absolute bg-white text-slate-900 border border-slate-300 mt-2 max-h-40 overflow-y-auto w-full z-10 shadow-lg rounded-md"
                    >
                      {filteredReceivers.map((receiver) => (
                        <li
                          key={receiver._id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              name: receiver.receiver,
                            });
                            setIsDropdownVisible(false);
                          }}
                          className="p-2 cursor-pointer hover:bg-slate-100 text-slate-900"
                        >
                          {receiver.receiver}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Purpose of Letter
                </label>
                <input
                  name="purposeOfLetter"
                  type="text"
                  placeholder="Describe the purpose of this request"
                  value={formData.purposeOfLetter}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Date
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Code
                </label>
                <input
                  name="code"
                  type="text"
                  placeholder="Enter code for the document"
                  value={formData.code}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Delivery Method
                </label>
                <select
                  name="deliveryMethod"
                  value={formData.deliveryMethod}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  <option value="">Select delivery method</option>
                  <option value="Email">Email</option>
                  <option value="Physical Document">Physical Document</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Upload Document
                </label>
                <input
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  type="file"
                  className="block w-full rounded-md px-2 py-2 border border-slate-300 bg-white text-slate-900 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700"
                />
              </div>
            </div>
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

export default AddOutgoingModal;
