const Agency = require("../models/agencyModel");

const addAgency = async (req, res) => {
  try {
    const { agencyName } = req.body;

    if (!agencyName) {
      return res.status(400).json({ message: "Agency name is required." });
    }

    const agency = new Agency({ agencyName });
    await agency.save();

    return res.status(201).json({ message: "Agency added successfully", agency });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAgency = async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.json(agencies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Agency ID is required" });
    }

    const deletedAgency = await Agency.findByIdAndDelete(id);

    if (!deletedAgency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    res.json({ message: "Agency deleted successfully", deletedAgency });
  } catch (error) {
    console.error("Delete Agency Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update an agency
const updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { agencyName } = req.body;

    if (!id || !agencyName) {
      return res.status(400).json({ message: "Agency ID and name are required." });
    }

    const updatedAgency = await Agency.findByIdAndUpdate(
      id,
      { agencyName },
      { new: true } 
    );

    if (!updatedAgency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    res.json({ message: "Agency updated successfully", updatedAgency });
  } catch (error) {
    console.error("Update Agency Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { addAgency, getAgency, deleteAgency, updateAgency };
