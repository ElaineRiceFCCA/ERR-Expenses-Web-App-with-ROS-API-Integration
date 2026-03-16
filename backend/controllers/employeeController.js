// ======================================================
// Employee Controller
// ======================================================
// Responsible for managing Employee master data
// Employees are required for:
//   - Claim creation
//   - ERR payload construction
//   - Revenue submission processing
//
// This controller supports:
//   - Retrieval of active employees
//   - Creation of new employee records
//   - Updating existing employee records
//
// All database operations are performed using the
// Mongoose Employee model
// ======================================================

import Employee from "../models/Employee.js";

// ======================================================
// GET: Retrieve Active Employees
// ======================================================
// Returns all employees where:
//   active = true
//
// Used primarily during:
//   - Claim entry (dropdown selection)
//   - ERR submission generation
//
// Results are sorted alphabetically by:
//   1. familyName
//   2. firstName
// ======================================================

export const getEmployees = async (req, res) => {
  try {
    // Query active employees only
    // Sorting ensures predictable UI ordering
    const employees = await Employee.find({ active: true }).sort({
      familyName: 1,
      firstName: 1,
    });

    // Return array of employee documents
    res.json(employees);
  } catch (err) {
    // Generic server error response
    // Avoid exposing internal stack traces
    res.status(500).json({
      message: "Failed to fetch employees",
      error: err.message,
    });
  }
};

// ----------------------------------------------------
// POST: Create New Employee
// ----------------------------------------------------
// Creates a new employee record
//
// Business Requirements:
//   - Certain fields are mandatory for ERR compliance
//   - PPSN may be optional (supports unknown PPSN scenario)
//
// Required fields:
//   - firstName
//   - familyName
//   - employmentID
//   - employerReference
//   - dateOfBirth
//   - full address object
//
// The employee is created as active by default
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

    // --------------------------------------------------
    // Basic Input Validation
    // --------------------------------------------------
    // Ensures required fields are present before
    // attempting database creation
    // Prevents incomplete ERR employee records

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

    // --------------------------------------------------
    // Create Employee Document
    // --------------------------------------------------
    // active: true ensures employee is selectable
    // in future claim entry operations

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

    // Return created employee (HTTP 201 Created)
    return res.status(201).json(newEmployee);
  } catch (err) {
    // Log server-side error for diagnostics
    console.error("createEmployee error:", err);

    return res.status(500).json({
      message: "Failed to create employee",
      error: err.message,
    });
  }
};

// ----------------------------------------------------
// PUT: Update Existing Employee
// ----------------------------------------------------
// Updates an employee record by ID
//
// Features:
//   - Uses findByIdAndUpdate()
//   - Returns updated document (new: true)
//   - Enforces schema validation (runValidators: true)
//
// Used for:
//   - Correcting employee details
//   - Updating PPSN status
//   - Amending address information
// ----------------------------------------------------

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Attempt to update employee by ID
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true, // Return updated document
      runValidators: true, // Enforce schema validation rules
    });

    // If no employee found with provided ID
    if (!updatedEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Return updated employee document
    return res.json(updatedEmployee);
  } catch (err) {
    console.error("updateEmployee error:", err);

    return res.status(500).json({
      message: "Failed to update employee",
      error: err.message,
    });
  }
};
