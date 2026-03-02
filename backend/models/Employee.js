import mongoose from "mongoose";

// ----------------------------------------------------
// Employee Schema
// Represents an employee included in ERR submissions.
// Supports both PPSN-known and PPSN-unknown reporting scenarios.
// ----------------------------------------------------

const employeeSchema = new mongoose.Schema(
  {
    // Core identity fields
    firstName: {
      type: String,
      required: true,
    },

    familyName: {
      type: String,
      required: true,
    },

    // PPSN known scenario
    // Internal employment identifier
    employmentID: {
      type: String,
      required: true,
    },

    // PPSN (optional depending on reporting scenario)
    employeePpsn: {
      type: String,
      required: false,
    },

    // PPSN unknown scenario
    // Employer-assigned reference (used when PPSN unavailable)
    employerReference: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    // Structured address object (required for PPSN-unknown submissions)
    address: {
      line1: { type: String, required: true },
      line2: { type: String, required: false },
      city: { type: String, required: true },
      county: { type: String, required: true },
      country: { type: String, required: true, default: "IE" },
    },

    // Soft enable/disable flag
    active: {
      type: Boolean,
      default: true,
    },
  },

  // Automatically stores createdAt and updatedAt
  // Supports auditability and submission traceability
  { timestamps: true },
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
