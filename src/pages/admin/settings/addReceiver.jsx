import React, { useState, useEffect } from "react";
import Layout from "../layout";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const AddReceiver = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [receivers, setReceivers] = useState([]);
  const [receiverName, setReceiverName] = useState("");
  const [position, setPosition] = useState("");
  const [editingReceiver, setEditingReceiver] = useState(null);
  const [receiverToDelete, setReceiverToDelete] = useState(null);

  const FETCHAPI = `${API_BASE_URL}/api/receiver/get-receiver`;
  const ADDRECEIVER = `${API_BASE_URL}/api/receiver/add-receiver`;
  const EDITRECEIVER = `${API_BASE_URL}/api/receiver/edit-receiver`;
  const DELETERECEIVER = `${API_BASE_URL}/api/receiver/delete-receiver`;

  const getReceivers = async () => {
    try {
      const response = await axios.get(FETCHAPI);
      setReceivers(response.data);
    } catch (error) {
      console.error("Error fetching receivers:", error);
    }
  };

  useEffect(() => {
    getReceivers();
  }, []);

  const handleEdit = (receiver) => {
    setReceiverName(receiver.receiver);
    setPosition(receiver.position);
    setEditingReceiver(receiver);
    setIsOpen(true);
  };

  const handleSaveReceiver = async () => {
    try {
      if (editingReceiver) {
        await axios.put(`${EDITRECEIVER}/${editingReceiver._id}`, {
          receiver: receiverName,
          position: position,
        });
      } else {
        await axios.post(ADDRECEIVER, {
          receiver: receiverName,
          position: position,
        });
      }
      setReceiverName("");
      setPosition("");
      setEditingReceiver(null);
      getReceivers();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving receiver:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${DELETERECEIVER}/${receiverToDelete._id}`);
      getReceivers();
      setDeleteModalOpen(false);
      setReceiverToDelete(null);
    } catch (error) {
      console.error("Error deleting receiver:", error);
    }
  };

  return (
    <Layout>
      <div className="p-8 flex flex-col">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold text-slate-100">Receiver</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-slate-600 text-white px-6 py-2 rounded-md hover:bg-slate-500 transition duration-200"
          >
            Add Receiver
          </button>
        </div>

        <div className="pt-6">
          <table className="w-full border-collapse border border-slate-600 table-fixed rounded-lg overflow-hidden bg-slate-800 shadow-md">
            <thead className="bg-slate-700 text-slate-100 sticky top-0 z-10">
              <tr>
                <th className="border border-slate-600 px-4 py-2 w-auto text-left">
                  Receiver
                </th>
                <th className="border border-slate-600 px-4 py-2 w-[500px] text-center">
                  Position
                </th>
                <th className="border border-slate-600 px-4 py-2 w-[200px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto" style={{ maxHeight: "300px" }}>
              {receivers.map((receiver) => (
                <tr key={receiver._id} className="border-b border-slate-600 hover:bg-slate-700/50 text-slate-100">
                  <td className="border border-slate-600 font-medium px-4 py-2 text-center">
                    {receiver.receiver}
                  </td>
                  <td className="border border-slate-600 font-medium px-4 py-2 w-[500px] text-center">
                    {receiver.position}
                  </td>
                  <td className="border border-slate-600 px-4 py-2 flex justify-center gap-2 w-[200px]">
                    <button
                      onClick={() => handleEdit(receiver)}
                      className="px-4 py-2 text-sm bg-slate-600 text-white rounded hover:bg-slate-500 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setReceiverToDelete(receiver);
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
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur z-50">
              <div className="bg-white text-slate-900 rounded-lg shadow-lg border border-slate-200 relative p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-lg text-slate-900">
                    {editingReceiver ? "Edit Receiver" : "Add Receiver"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setEditingReceiver(null);
                      setReceiverName("");
                      setPosition("");
                    }}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    ✖
                  </button>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Receiver Name</label>
                  <input
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Enter receiver name"
                    className="border border-slate-300 bg-white text-slate-900 placeholder-slate-500 py-2 px-3 mt-1 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <label className="text-sm font-medium mt-4 text-slate-700">Position</label>
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Enter position"
                    className="border border-slate-300 bg-white text-slate-900 placeholder-slate-500 py-2 px-3 mt-1 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveReceiver}
                    className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition duration-200"
                  >
                    {editingReceiver ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur z-50">
              <div className="bg-slate-800 text-slate-100 rounded-lg shadow-lg border border-slate-600 relative p-6 w-96">
                <h2 className="font-medium text-lg mb-4 text-slate-100">Confirm Deletion</h2>
                <p className="text-slate-300">Are you sure you want to delete this receiver?</p>

                <div className="pt-4 flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 bg-slate-600 text-slate-100 rounded hover:bg-slate-500 transition duration-200"
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

export default AddReceiver;
