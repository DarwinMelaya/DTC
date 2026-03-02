import React, { useState, useEffect } from "react";
import Layout from "../layout";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const AddAgency = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [agencyName, setAgencyName] = useState("");
  const [editingAgency, setEditingAgency] = useState(null);
  const [agencyToDelete, setAgencyToDelete] = useState(null);

  const FETCHAPI = `${API_BASE_URL}/api/agency/get-agency`;
  const ADDAGENCY = `${API_BASE_URL}/api/agency/add-agency`;
  const EDITAGENCY = `${API_BASE_URL}/api/agency/edit-agency`;
  const DELETEAGENCY = `${API_BASE_URL}/api/agency/delete-agency`;

  const getAgency = async () => {
    try {
      const response = await axios.get(FETCHAPI);
      setAgencies(response.data);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    }
  };

  useEffect(() => {
    getAgency();
  }, []);

  const handleEdit = (agency) => {
    setAgencyName(agency.agencyName);
    setEditingAgency(agency);
    setIsOpen(true);
  };

  const handleSaveAgency = async () => {
    try {
      if (editingAgency) {
        await axios.put(`${EDITAGENCY}/${editingAgency._id}`, { agencyName });
      } else {
        await axios.post(ADDAGENCY, { agencyName });
      }
      setAgencyName("");
      setEditingAgency(null);
      getAgency();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving agency:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${DELETEAGENCY}/${agencyToDelete._id}`);
      getAgency();
      setDeleteModalOpen(false);
      setAgencyToDelete(null);
    } catch (error) {
      console.error("Error deleting agency:", error);
    }
  };

  return (
    <Layout>
      <div className="p-8 flex-col">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold">Agencies</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Add Agency
          </button>
        </div>

        <div className="pt-6">
          <table className="w-full border-collapse border border-gray-300 table-fixed">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2 w-auto">
                  Agency
                </th>
                <th className="border border-gray-300 px-4 py-2 w-[200px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto" style={{ maxHeight: "300px" }}>
              {agencies.map((agency) => (
                <tr key={agency._id}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {agency.agencyName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2 w-[200px]">
                    <button
                      onClick={() => handleEdit(agency)}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setAgencyToDelete(agency);
                        setDeleteModalOpen(true);
                      }}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-950/70 backdrop-blur-sm z-50">
              <div className="bg-white rounded-lg shadow-lg relative p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-lg">
                    {editingAgency ? "Edit Agency" : "Add Agency"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setEditingAgency(null);
                      setAgencyName("");
                    }}
                    className="text-gray-600 hover:text-black"
                  >
                    ✖
                  </button>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Agency Name</label>
                  <input
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Enter agency name"
                    className="border border-gray-400 py-2 px-3 mt-1 rounded"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveAgency}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition duration-200"
                  >
                    {editingAgency ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-950/70 backdrop-blur-sm z-50">
              <div className="bg-white rounded-lg shadow-lg relative p-6 w-96">
                <h2 className="font-medium text-lg mb-4">Confirm Deletion</h2>
                <p>Are you sure you want to delete this agency?</p>

                <div className="pt-4 flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddAgency;
