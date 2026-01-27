import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    // --- Common fields ---
    firstName: {
      type: String,
      required: true,
    },

    familyName: {
      type: String,
      required: true,
    },

    // --- PPSN known ---
    employmentID: {
      type: String,
      required: true,
    },

    employeePpsn: {
      type: String,
      required: false,
    },

    // --- PPSN unknown ---
    employerReference: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    address: {
      line1: { type: String, required: true },
      line2: { type: String, required: false },
      city: { type: String, required: true },
      county: { type: String, required: true },
      country: { type: String, required: true, default: "IE" },
    },

    // --- Status ---
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
