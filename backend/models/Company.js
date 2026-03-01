import mongoose from "mongoose";

// Stores organisation-level configuration required
// for ERR generation and ROS submission
const companySchema = new mongoose.Schema(
  {
    // Revenue employer identifier (unique per organisation)
    employerRegistrationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Payroll reference used in ERR run identifiers
    payrollReference: {
      type: String,
      required: true,
    },

    // Reporting tax year (used in submission metadata)
    taxYear: {
      type: Number,
      required: true,
    },

    // Software metadata required by Revenue specifications
    softwareUsed: {
      type: String,
      required: true,
      default: "ERRExpenseManagementSystem",
    },

    softwareVersion: {
      type: String,
      required: true,
      default: "0.01.0.0001",
    },

    // ROS certificate configuration
    // Used by the .NET signing microservice
    rosCertPath: {
      type: String,
      required: true,
    },

    rosCertPassword: {
      type: String,
      required: true,
    },

    // Optional agent identifier (for bureau / agent submissions)
    agentTain: {
      type: String,
    },

    // Soft enable/disable flag (future-proofing)
    active: {
      type: Boolean,
      default: true,
    },
  },

  // Automatically stores createdAt and updatedAt
  // Supports auditability and submission traceability
  { timestamps: true },
);

const Company = mongoose.model("Company", companySchema);
export default Company;
