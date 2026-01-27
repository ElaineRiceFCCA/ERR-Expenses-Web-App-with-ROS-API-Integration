// ----------------------------------------------------
// Creates new employee table / fields in DB
// Run with: node utils/createEmployee.js from root backend directory
// ----------------------------------------------------

import dotenv from "dotenv";
import Employee from "../models/Employee.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

const employees = [
  // Employee with PPSN
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

  // Employee without PPSN
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
    // Clear existing seed employees
    await Employee.deleteMany({
      firstName: { $in: ["Jane", "Joe"] },
    });

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
