// ----------------------------------------------------
// Utility: Seeds Employee records for ERR testing
// Includes both PPSN-known and PPSN-unknown scenarios
// Run with: node utils/createEmployees.js
// ----------------------------------------------------

import dotenv from "dotenv";
import Employee from "../models/Employee.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB(); // Establish MongoDB connection

// Sample employees for PIT testing
const employees = [
  // PPSN known employee (standard submission structure)
  {
    firstName: "Jane",
    familyName: "Blogs",
    employmentID: "BEBDEB174E094CBBBB8C",
    employerReference: "EMP001",
    employeePpsn: "1111113P",
    dateOfBirth: "1981-01-01",
    address: {
      line1: "1 Main Street",
      city: "Wicklow",
      county: "Wicklow",
      country: "IE",
    },
  },

  // PPSN unknown employee (requires DOB + address in submission)
  {
    firstName: "Joe",
    familyName: "Blogs",
    employmentID: "AEBCEB164E194XBAJB9H",
    employerReference: "EMP002",
    dateOfBirth: "1985-04-12",
    address: {
      line1: "1 High Street",
      city: "Dublin",
      county: "Dublin",
      country: "IE",
    },
  },
];

async function createEmployees() {
  try {
    // Remove existing seed entries (POC reset strategy)
    await Employee.deleteMany({
      firstName: { $in: ["Jane", "Joe"] },
    });

    // Insert predefined employees
    for (const emp of employees) {
      const newEmp = await Employee.create(emp);
      console.log(`Created employee: ${newEmp.firstName} ${newEmp.familyName}`);
    }

    console.log("Employee seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating employees:", error);
    process.exit(1);
  }
}

createEmployees();
