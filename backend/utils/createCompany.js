// ----------------------------------------------------
// Creates PAYCOMP (company details) seed data
// Run with: node utils/createCompany.js
// ----------------------------------------------------

import dotenv from "dotenv";
import Company from "../models/Company.js";
import connectDB from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
await connectDB();

// Required to use __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const company = {
  employerRegistrationNumber: "01536466V",
  payrollReference: "ERI4",
  taxYear: 2025,
  softwareUsed: "ERRExpenseManagementSystem",
  softwareVersion: "0.01.0.0001",

  // ROS certificate configuration (PIT test cert details)
  rosCertPath: path.join(__dirname, "..", "certs", "01536466V.p12"),
  rosCertPassword: "Itptest1",
  agentTain: null,
  active: true,
};

async function createCompany() {
  try {
    // Clear any existing company records
    await Company.deleteMany({});

    const newCompany = await Company.create(company);

    console.log(
      `Company created: ${newCompany.employerRegistrationNumber} (${newCompany.payrollReference})`,
    );

    console.log("Company seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating company:", error);
    process.exit(1);
  }
}

createCompany();
