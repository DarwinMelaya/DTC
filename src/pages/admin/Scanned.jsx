import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./layout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5001`;

const Scanned = () => {
  const [documents, setDocuments] = useState([]);
  const fetchApi = `${API_BASE_URL}/api/document/get-scanned`;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(fetchApi);
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching scanned documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Scanned Documents</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc._id} className="border p-4 rounded-md bg-slate-50">
                <p className="text-sm text-gray-600">Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline block mt-2"
                >
                  View Document
                </a>
              </div>
            ))
          ) : (
            <p>No scanned documents available.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Scanned;