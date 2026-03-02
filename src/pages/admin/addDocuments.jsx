import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "../../App.css";
import AdminBG from "../../assets/bg2.jpg";
import DasboardLayout from "./dashboardLayout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const Notification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      className={`absolute right-5 transform -translate-x-1/2 p-4 rounded-md text-white shadow-lg ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
      style={{ zIndex: 1000 }}
    >
      {message}
    </div>
  );
};

const AddDocuments = () => {
  const api = `${API_BASE_URL}/api/document/get-document`;
  const add = `${API_BASE_URL}/api/document/add-document`;
  const FETCHAPI = `${API_BASE_URL}/api/receiver/get-receiver`;
  const FETCHAGENCYAPI = `${API_BASE_URL}/api/agency/get-agency`;

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [total, setTotal] = useState([]);
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
    getAgency();
  }, []);

  const getReceivers = async () => {
    try {
      const response = await axios.get(FETCHAPI);
      setReceivers(response.data);
      setFilteredReceivers(response.data);
    } catch (error) {
      console.error("Error fetching receivers:", error);
    }
  };

  useEffect(() => {
    getReceivers();
  }, []);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(api);
      const incomingDocs = response.data.filter(
        (doc) => doc.type === "incoming",
      );
      const outgoingDocs = response.data.filter(
        (doc) => doc.type === "outgoing",
      );

      setTotal(response.data);
      setIncoming(incomingDocs);
      setOutgoing(outgoingDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const [formData, setFormData] = useState({
    agency: "",
    name: "",
    code: "",
    purposeOfLetter: "",
    date: "",
    type: "",
  });

  useEffect(() => {
    if (formData.type) {
      fetchLastCode();
    }
  }, [formData.type]);

  const fetchLastCode = async () => {
    try {
      const res = await axios.get(api);
      const allDocs = res.data;

      const currentYear = new Date().getFullYear().toString().slice(-2);

      let prefix;
      if (formData.type === "incoming") {
        prefix = "INC";
      } else if (formData.type === "outgoing") {
        prefix = "OUT";
      } else {
        console.error("Invalid document type:", formData.type);
        return;
      }

      console.log("Selected prefix:", prefix);

      const filteredDocs = allDocs
        .filter(
          (doc) =>
            doc.type === formData.type &&
            doc.code &&
            doc.code.startsWith(`${prefix}-${currentYear}-`),
        )
        .sort((a, b) => b.code.localeCompare(a.code));

      console.log("Filtered docs for", formData.type, ":", filteredDocs);

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
    formDataToSend.append("type", formData.type);
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
        type: "",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      setNotification({
        message: "Document uploaded successfully!",
        type: "success",
      });

      fetchDocument();
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

      // Close agency dropdown if clicked outside of the input and dropdown
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

  return (
    <DasboardLayout>
      <div
        className="h-screen flex flex-col items-center bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${AdminBG})` }}
      >
        <div className="absolute inset-0 bg-blue-950 opacity-85"></div>
        <Notification
          message={notification?.message}
          type={notification?.type}
        />

        <div className="flex justify-center space-x-8 mt-4 flex-col">
          <div>
            <h1 className="text-4xl text-white relative font-bold pb-4">
              Add New Document
            </h1>
          </div>
          <form
            onSubmit={handleSubmit}
            className="glassmorphism-container-dashboard-form space-y-4 relative z-10 p-6 rounded-md"
          >
            <div className="flex flex-row space-x-4 items-center justify-center">
              <div className="space-y-1 w-full">
                <label className="text-white font-medium">Agency</label>
                <div className="relative w-full" ref={agencyDropdownRef}>
                  <input
                    name="agency"
                    value={formData.agency}
                    onClick={() => setIsAgencyDropdownVisible(true)}
                    onChange={handleChange}
                    type="text"
                    className="block rounded-md px-2 py-2 border border-black bg-white bg-opacity-50 w-full"
                    placeholder="Enter agency name"
                  />
                  {isAgencyDropdownVisible && agencies.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 mt-2 max-h-40 overflow-y-auto w-full z-10">
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
                          className="p-2 cursor-pointer hover:bg-gray-200"
                        >
                          {agency.agencyName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label className="text-white font-medium">Name</label>
                <div className="relative w-full">
                  <input
                    ref={inputRef}
                    name="name"
                    value={formData.name}
                    onClick={() => setIsDropdownVisible(true)}
                    onChange={handleChange}
                    type="text"
                    className="block w-full rounded-md px-2 py-2 border border-black bg-white bg-opacity-50"
                    placeholder="Type receiver name"
                  />
                  {isDropdownVisible && filteredReceivers.length > 0 && (
                    <ul
                      ref={dropdownRef}
                      className="absolute bg-white border border-gray-300 mt-2 max-h-40 overflow-y-auto w-full z-10"
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
                          className="p-2 cursor-pointer hover:bg-gray-200"
                        >
                          {receiver.receiver}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <label className="text-white font-medium">
                  Purpose of Letter
                </label>
                <input
                  name="purposeOfLetter"
                  type="text"
                  placeholder="Describe the purpose of this request"
                  value={formData.purposeOfLetter}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-black bg-white bg-opacity-50"
                />
              </div>
              <div className="space-y-1 w-full">
                <label className="text-white font-medium">Document Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-black bg-white bg-opacity-50"
                >
                  <option value="">Select Type</option>
                  <option value="incoming">Incoming</option>
                  <option value="outgoing">Outgoing</option>
                </select>
                <label className="text-white font-medium">Date</label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-black bg-white bg-opacity-50"
                />

                <label className="text-white font-medium">Code</label>
                <input
                  name="code"
                  type="text"
                  placeholder="Enter code for the document"
                  value={formData.code}
                  onChange={handleChange}
                  className="block w-full rounded-md px-2 py-2 border border-black bg-white bg-opacity-50"
                />
              </div>
            </div>
            <div className="space-y-1 w-[485px]">
              <label className="text-white font-medium">Upload Document</label>
              <input
                ref={fileInputRef}
                onChange={handleFileChange}
                type="file"
                className="block w-full rounded-md px-2 py-2 border border-black bg-white bg-opacity-50"
              />
            </div>
            <div className="flex justify-center mt-4 space-x-5">
              <button
                type="submit"
                className="rounded-md bg-yellow-500 text-white py-2 px-4 hover:bg-yellow-600 transition duration-200"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </DasboardLayout>
  );
};

export default AddDocuments;
