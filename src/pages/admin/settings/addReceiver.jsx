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
      <div className="p-8 flex-col">
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-bold">Receiver</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-black text-white px-6 py-2 rounded-md"
          >
            Add Receiver
          </button>
        </div>

        <div className="pt-6">
          <table className="w-full border-collapse border border-gray-300 table-fixed">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2 w-auto">
                  Receiver
                </th>
                <th className="border border-gray-300 px-4 py-2 w-[500px] text-center">
                  Position
                </th>
                <th className="border border-gray-300 px-4 py-2 w-[200px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto" style={{ maxHeight: "300px" }}>
              {receivers.map((receiver) => (
                <tr key={receiver._id}>
                  <td className="border border-gray-300 font-medium px-4 py-2 text-center">
                    {receiver.receiver}
                  </td>
                  <td className="border border-gray-300 font-medium px-4 py-2 w-[500px] text-center">
                    {receiver.position}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2 w-[200px]">
                    <button
                      onClick={() => handleEdit(receiver)}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setReceiverToDelete(receiver);
                        setDeleteModalOpen(true);
                      }}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded"
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
                    {editingReceiver ? "Edit Receiver" : "Add Receiver"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setEditingReceiver(null);
                      setReceiverName("");
                      setPosition("");
                    }}
                    className="text-gray-600 hover:text-black"
                  >
                    ✖
                  </button>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Receiver Name</label>
                  <input
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Enter receiver name"
                    className="border border-gray-400 py-2 px-3 mt-1 rounded"
                  />
                  <label className="text-sm font-medium mt-4">Position</label>
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Enter position"
                    className="border border-gray-400 py-2 px-3 mt-1 rounded"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveReceiver}
                    className="bg-black text-white px-4 py-2 rounded-md"
                  >
                    {editingReceiver ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-950/70 backdrop-blur-sm z-50">
              <div className="bg-white rounded-lg shadow-lg relative p-6 w-96">
                <h2 className="font-medium text-lg mb-4">Confirm Deletion</h2>
                <p>Are you sure you want to delete this receiver?</p>

                <div className="pt-4 flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-black rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded"
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
