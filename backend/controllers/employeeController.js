import Employee from "../models/Employee.js";

// Retrieves all active employees
// Used primarily during claim entry and ERR payload construction
export const getEmployees = async (req, res) => {
  try {
    // Filter by active flag and sort alphabetically
    const employees = await Employee.find({ active: true }).sort({
      familyName: 1,
      firstName: 1,
    });

    res.json(employees);
  } catch (err) {
    // Generic server error response
    res.status(500).json({
      message: "Failed to fetch employees",
      error: err.message,
    });
  }
};

// ----------------------------------------------------
// POST: Create new employee
// ----------------------------------------------------
export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      familyName,
      employmentID,
      employeePpsn,
      employerReference,
      dateOfBirth,
      address,
    } = req.body;

    // Basic validation
    if (
      !firstName ||
      !familyName ||
      !employmentID ||
      !employerReference ||
      !dateOfBirth ||
      !address?.line1 ||
      !address?.city ||
      !address?.county ||
      !address?.country
    ) {
      return res.status(400).json({
        message: "Missing required employee fields",
      });
    }

    const newEmployee = await Employee.create({
      firstName,
      familyName,
      employmentID,
      employeePpsn,
      employerReference,
      dateOfBirth,
      address,
      active: true,
    });

    return res.status(201).json(newEmployee);
  } catch (err) {
    console.error("createEmployee error:", err);
    return res.status(500).json({
      message: "Failed to create employee",
      error: err.message,
    });
  }
};
