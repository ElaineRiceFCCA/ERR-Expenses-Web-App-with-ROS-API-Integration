// ----------------------------------------------------
// Utility: Seeds Company configuration (PAYCOMP data)
// Required for ERR generation and ROS integration
// Run with: node utils/createCompany.js
// ----------------------------------------------------
import dotenv from "dotenv";
import Company from "../models/Company.js";
import connectDB from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
await connectDB(); // Establish MongoDB connection

// Required to use __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default company configuration (PIT test environment)
const company = {
  employerRegistrationNumber: "8031508KH",
  payrollReference: "ERI4",
  taxYear: 2025,
  softwareUsed: "ERRExpenseManagementSystem",
  softwareVersion: "0.01.0.0001",

  // ROS certificate configuration (used by signing microservice)
  rosCertPath: path.join(__dirname, "..", "certs", "999966377.p12"),
  rosCertPassword: "d301b398",
  agentTain: "88502T",
  active: true,
};

async function createCompany() {
  try {
    // Ensure single active company record
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
