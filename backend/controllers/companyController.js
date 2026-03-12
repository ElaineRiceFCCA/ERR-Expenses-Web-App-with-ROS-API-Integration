import Company from "../models/Company.js";

// ----------------------------------------------------
// GET Company (single active record)
// ----------------------------------------------------
export const getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ active: true });

    if (!company) {
      return res.status(404).json({
        message: "No active company configuration found",
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching company",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// CREATE Company
// ----------------------------------------------------
export const createCompany = async (req, res) => {
  try {
    const existing = await Company.findOne({ active: true });

    if (existing) {
      return res.status(400).json({
        message: "Company configuration already exists",
      });
    }

    const company = await Company.create(req.body);

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({
      message: "Error creating company",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// UPDATE Company
// ----------------------------------------------------
export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: "Error updating company",
      error: error.message,
    });
  }
};
