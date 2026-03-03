import axios from "axios";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { convertBase64ToBlob } from "../../utils/fileupload";
import Layout from "./layout";
import AddOutgoingModal from "./AddOutgoingModal";
import EditDocumentModal from "./EditDocumentModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const Notification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      className={`absolute top-20 right-5 transform -translate-x-1/2 p-4 rounded-md text-white shadow-lg ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
      style={{ zIndex: 1000 }}
    >
      {message}
    </div>
  );
};

const Outgoing = () => {
  const api = `${API_BASE_URL}/api/document/get-document`;
  const [outgoing, setOutgoing] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    agency: "",
    name: "",
    purposeOfLetter: "",
    date: "",
    type: "",
    deliveryMethod: "",
  });
  const [editDoc, setEditDoc] = useState(null);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [setOpen, setIsOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemsPerPage = 15;

  const handlePreview = (docId) => {
    if (!docId) {
      console.error("Document ID is missing");
      return;
    }

    const downloadUrl = `${API_BASE_URL}/api/document/download/${docId}`;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  const fetchDocument = async () => {
    try {
      const response = await axios.get(api);
      const outgoingDocs = response.data.filter(
        (doc) => doc.type === "outgoing",
      );
      setOutgoing(outgoingDocs);
      setFilteredDocs(outgoingDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const applyFilter = () => {
    const filtered = outgoing.filter((doc) => {
      const date = new Date(doc.date);
      const yearMatch =
        selectedYear === "All" ||
        date.getFullYear().toString() === selectedYear;
      const monthMatch =
        selectedMonth === "All" || date.getMonth().toString() === selectedMonth;
      const agencyMatch = doc.agency
        .toLowerCase()
        .includes(filterText.toLowerCase());
      return yearMatch && monthMatch && agencyMatch;
    });
    setFilteredDocs(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilter();
  }, [selectedYear, selectedMonth, filterText, outgoing]);

  const uniqueYears = [
    ...new Set(
      outgoing.map((doc) => new Date(doc.date).getFullYear().toString()),
    ),
  ];
  uniqueYears.sort((a, b) => a - b);
  const uniqueMonths = [
    ...new Set(outgoing.map((doc) => new Date(doc.date).getMonth().toString())),
  ];
  uniqueMonths.sort((a, b) => a - b);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const deleteDocument = async (id) => {
    if (!id) {
      console.error("Error: Document ID is null or undefined");
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/document/delete-document/${id}`);
      setOutgoing((prev) => prev.filter((doc) => doc._id !== id));
      setFilteredDocs((prev) => prev.filter((doc) => doc._id !== id));
      setIsOpen(false);
      setNotification({
        message: "Document Deleted successfully!",
        type: "error",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
    }
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleEdit = (doc) => {
    setEditDoc(doc);
    setIsEditModalOpen(true);
  };

  const handlePrintPreview = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write("<html><head><title>Document Preview</title>");
    printWindow.document.write(
      `<style>
        /* Reset margin and padding */
        body, html { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          font-size: 12px; 
          width: 100%; 
          height: 100%;
          text-align: center; /* Center align all content on the page */
        }
  
        /* Table styles */
        table { 
          width: 80%; /* Table width reduced to 80% for better alignment */
          margin: 0 auto; /* Centers the table */
          border-collapse: collapse; 
          table-layout: auto;
        }
        table, th, td { 
          border: 1px solid black; 
        }
        th, td { 
          padding: 6px; 
          text-align: center; /* Center align text in all cells */
          font-size: 12px; 
        }
        th { 
          background-color: #f2f2f2; 
        }
  
        /* Column widths */
        .agency-column { width: 15%; }
        .name-column { width: 15%; }
        .purpose-column { 
          width: 30%; /* Allow the Purpose column to take up more space */
          word-wrap: break-word; 
          white-space: normal; 
        }
        .date-column { width: 20%; }
  
        /* Printing specific styles */
        @media print {
          /* Set margins for printing */
          @page { 
            margin: 10mm; /* Set the page margin to 10mm */
          }
  
          /* Ensure everything is aligned to the full width of the page */
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            text-align: center; /* Ensure text is centered for printing as well */
          }
  
          table {
            width: 100%; /* Ensure the table takes full width */
            page-break-inside: avoid;
            margin: 0 auto; /* Ensure the table stays centered */
          }
  
          /* Scale content to fit the page without overflowing */
          body {
            transform: scale(1); /* Ensure normal scaling to avoid content shrinking */
            transform-origin: top left;
          }
  
          /* Make sure the content doesn't overflow */
          .purpose-column {
            white-space: normal;
            word-wrap: break-word;
          }
        }
      </style>`,
    );
    printWindow.document.write("</head><body><h2>Outgoing Documents</h2>");

    printWindow.document.write(
      "<table><thead><tr><th class='agency-column'>Agency</th><th class='name-column'>Name</th><th class='purpose-column'>Purpose of Letter</th><th class='date-column'>Code</th><th class='date-column'>Date</th></tr></thead><tbody>",
    );

    filteredDocs.forEach((doc) => {
      printWindow.document.write(
        `<tr>
          <td class='agency-column'>${doc.agency}</td>
          <td class='name-column'>${doc.name}</td>
          <td class='purpose-column'>${doc.purposeOfLetter}</td>
                    <td class='agency-column'>${doc.code}</td>
          <td class='date-column'>${formatDate(doc.date)}</td>
        </tr>`,
      );
    });

    printWindow.document.write("</tbody></table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Layout>
      <div className="flex flex-col px-6 py-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Outgoing Documents</h1>
        </div>

        <div className="flex flex-row items-center justify-between py-2">
          <Notification
            message={notification?.message}
            type={notification?.type}
          />

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
            >
              Add Document
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              <option value="All">All Months</option>
              {uniqueMonths.map((month) => (
                <option key={month} value={month}>
                  {monthNames[parseInt(month)]}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              <option value="All">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filter by agency..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="p-2 border border-slate-600 rounded bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button
            onClick={handlePrintPreview}
            className="px-3 py-1.5 bg-black text-white rounded ml-2"
          >
            Print Preview
          </button>
        </div>

        {filteredDocs.length > 0 ? (
          <>
            <EditDocumentModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditDoc(null);
                setNewFile(null);
              }}
              document={editDoc}
              onUpdated={(updated) => {
                setOutgoing(
                  outgoing.map((d) => (d._id === updated._id ? updated : d)),
                );
                setFilteredDocs(
                  filteredDocs.map((d) =>
                    d._id === updated._id ? updated : d,
                  ),
                );
                setNotification({
                  message: "Document updated successfully!",
                  type: "success",
                });
                setTimeout(() => setNotification(null), 3000);
              }}
            />
            <table className="min-w-full border border-slate-600 bg-slate-800 shadow-md rounded-lg text-slate-100">
              <thead className="bg-slate-700 text-slate-100">
                <tr>
                  <th className="px-1 py-1 border border-slate-600 w-50">
                    Agency
                  </th>
                  <th className="px-1 py-1 border border-slate-600 w-40">
                    Sender Name
                  </th>
                  <th
                    className="px-1 py-1 border border-slate-600"
                    style={{ width: "300px" }}
                  >
                    Purpose Of Letter
                  </th>
                  <th className="px-1 py-1 border border-slate-600 w-30">
                    Code
                  </th>

                  <th className="px-1 py-1 border border-slate-600 w-40">
                    Date
                  </th>
                  <th className="px-1 py-1 border border-slate-600 w-40">
                    Delivery Method
                  </th>
                  <th className="px-1 py-1 border border-slate-600 w-40">
                    Document
                  </th>
                  <th className="px-1 py-1 border border-slate-600 w-40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentDocs.map((doc) => (
                  <tr
                    key={doc._id}
                    className="border-b border-slate-600 hover:bg-slate-700/50 text-center text-slate-100"
                  >
                    <>
                      <td className="px-4 py-1 border border-slate-600 text-sm">
                        {doc.agency}
                      </td>
                      <td className="px-4 py-1 border border-slate-600 text-sm">
                        {doc.name}
                      </td>
                      <td className="px-4 py-1 border border-slate-600 text-sm">
                        {doc.purposeOfLetter}
                      </td>
                      <td className="px-1 py-1 border border-slate-600 text-sm">
                        {doc.code}
                      </td>
                      <td className="px-4 py-1 border border-slate-600">
                        {new Date(doc.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-1 py-1 border border-slate-600 text-sm">
                        {doc.deliveryMethod || "-"}
                      </td>
                      <td className="px-1 py-1 border border-slate-600 text-sm">
                        {doc.fileName}
                      </td>
                      <td className="px-4 py-1 border-slate-600 text-sm text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDocId(doc._id);
                              setIsOpen(true);
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handlePreview(doc._id)}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Preview
                          </button>
                        </div>
                      </td>
                    </>
                  </tr>
                ))}
              </tbody>
            </table>
            {pdfUrl && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                <div className="bg-slate-900 text-slate-100 p-5 rounded-lg shadow-lg w-3/4 h-full relative pt-16">
                  <button
                    onClick={() => setPdfUrl(null)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-400"
                  >
                    <X size={30} />
                  </button>

                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="100%"
                    title="PDF Preview"
                  ></iframe>
                </div>
              </div>
            )}

            <div>
              {setOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur z-50">
                  <div className="bg-slate-800 text-slate-100 p-6 rounded-lg shadow-lg border border-slate-600 relative z-10 w-90">
                    <p className="font-medium text-slate-100">
                      Are you sure you want to delete?
                    </p>
                    <p className="text-slate-300 mt-1">
                      This will permanently delete the item and remove it from
                      our servers.
                    </p>
                    <div className="w-full flex justify-end items-end space-x-2 mt-4">
                      <button
                        onClick={() => deleteDocument(selectedDocId)}
                        className="bg-red-500 text-white px-4 py-2 w-20 rounded hover:bg-red-600"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="bg-slate-600 text-slate-100 border border-slate-500 px-4 py-2 rounded hover:bg-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-slate-400 mt-4">
            No documents available
          </p>
        )}
        <div className="sticky top-0 z-10 w-full py-6 px-6 bg-slate-900/60 border-t border-slate-700 shadow-sm">
          <div className="flex justify-end items-center space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-600 text-slate-100 rounded hover:bg-slate-500 disabled:opacity-50 disabled:hover:bg-slate-600"
            >
              Prev
            </button>
            <span className="text-lg font-semibold text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-600 text-slate-100 rounded hover:bg-slate-500 disabled:opacity-50 disabled:hover:bg-slate-600"
            >
              Next
            </button>
          </div>
        </div>

        <AddOutgoingModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onDocumentAdded={fetchDocument}
        />
      </div>
    </Layout>
  );
};

export default Outgoing;
