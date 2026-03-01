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
