import Employee from "../models/Employee.js";

// Get all active employees (for claims entry)
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ active: true }).sort({
      familyName: 1,
      firstName: 1,
    });

    res.json(employees);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch employees",
      error: err.message,
    });
  }
};
