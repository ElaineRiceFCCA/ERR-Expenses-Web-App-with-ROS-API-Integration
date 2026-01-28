import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // Revenue required identifiers
    employerRegistrationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    payrollReference: {
      type: String,
      required: true,
    },

    taxYear: {
      type: Number,
      required: true,
    },

    // Software identifiers
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

    // Control flag (future-proofing)
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Company = mongoose.model("Company", companySchema);
export default Company;
