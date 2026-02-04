// ----------------------------------------------------
// Creates PAYCOMP (company details) seed data
// Run with: node utils/createCompany.js
// ----------------------------------------------------

import dotenv from "dotenv";
import Company from "../models/Company.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

const company = {
  employerRegistrationNumber: "9027650WH",
  payrollReference: "ERI4",
  taxYear: 2025,
  softwareUsed: "ERRExpenseManagementSystem",
  softwareVersion: "0.01.0.0001",
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
