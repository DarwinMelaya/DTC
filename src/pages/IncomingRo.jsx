import axios from "axios";
import React, { useState, useEffect } from "react";
import Layout from "./admin/layout";
import { X } from "lucide-react";
import AddIncomingRoModal from "./AddIncomingRoModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const IncomingRo = () => {
  const api = `${API_BASE_URL}/api/incoming-ro/get-document`;
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const itemsPerPage = 15;

  const handlePreview = (docId) => {
    if (!docId) return;
    const downloadUrl = `${API_BASE_URL}/api/incoming-ro/download/${docId}`;
    setPdfUrl(downloadUrl);
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(api);
      setDocs(response.data || []);
      setFilteredDocs(response.data || []);
    } catch (error) {
      console.error("Error fetching Incoming RO documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const applyFilter = () => {
    const filtered = docs.filter((doc) => {
      const date = new Date(doc.dateReceived);
      const yearMatch =
        selectedYear === "All" ||
        date.getFullYear().toString() === selectedYear;
      const monthMatch =
        selectedMonth === "All" || date.getMonth().toString() === selectedMonth;
      const nameMatch = (doc.receiverName || "")
        .toLowerCase()
        .includes(filterText.toLowerCase());
      const particularsMatch = (doc.particulars || "")
        .toLowerCase()
        .includes(filterText.toLowerCase());
      return yearMatch && monthMatch && (nameMatch || particularsMatch);
    });
    setFilteredDocs(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilter();
  }, [selectedYear, selectedMonth, filterText, docs]);

  const uniqueYears = [
    ...new Set(
      docs.map((doc) => new Date(doc.dateReceived).getFullYear().toString()),
    ),
  ].sort((a, b) => a - b);
  const uniqueMonths = [
    ...new Set(docs.map((doc) => new Date(doc.dateReceived).getMonth().toString())),
  ].sort((a, b) => a - b);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;

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
          <h1 className="text-2xl font-semibold text-slate-100">
            Incoming from RO
          </h1>
        </div>

        <div className="flex flex-row items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition duration-200"
            >
              Add Document
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
              className="px-3 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
              placeholder="Filter by receiver or particulars..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="p-2 border border-slate-600 rounded bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <>
            <table className="min-w-full border border-slate-600 bg-slate-800 shadow-md rounded-lg text-slate-100">
              <thead className="bg-slate-700 text-slate-100">
                <tr>
                  <th className="px-4 py-2 border border-slate-600 text-left">
                    Receiver Name
                  </th>
                  <th
                    className="px-4 py-2 border border-slate-600 text-left"
                    style={{ width: "300px" }}
                  >
                    Particulars
                  </th>
                  <th className="px-4 py-2 border border-slate-600 w-40">
                    Date
                  </th>
                  <th className="px-4 py-2 border border-slate-600 w-40">
                    Documents
                  </th>
                  <th className="px-4 py-2 border border-slate-600 w-32 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentDocs.map((doc) => (
                  <tr
                    key={doc._id}
                    className="border-b border-slate-600 hover:bg-slate-700/50 text-slate-100"
                  >
                    <td className="px-4 py-2 border border-slate-600 text-sm">
                      {doc.receiverName || "—"}
                    </td>
                    <td className="px-4 py-2 border border-slate-600 text-sm">
                      {doc.particulars || "—"}
                    </td>
                    <td className="px-4 py-2 border border-slate-600 text-sm">
                      {new Date(doc.dateReceived).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2 border border-slate-600 text-sm">
                      {doc.documentName || "—"}
                    </td>
                    <td className="px-4 py-2 border border-slate-600 text-center">
                      <button
                        onClick={() => handlePreview(doc._id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-500 transition duration-200"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pdfUrl && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                <div className="bg-slate-900 text-slate-100 p-5 rounded-lg shadow-lg w-3/4 h-screen relative pt-16">
                  <button
                    onClick={() => setPdfUrl(null)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-400"
                  >
                    <X size={30} />
                  </button>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              </div>
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
          </>
        ) : (
          <p className="text-center text-slate-400 mt-4">
            No documents available
          </p>
        )}

        <AddIncomingRoModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onDocumentAdded={fetchDocuments}
        />
      </div>
    </Layout>
  );
};

export default IncomingRo;
