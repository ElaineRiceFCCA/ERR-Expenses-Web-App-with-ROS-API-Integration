// ----------------------------------------------------
// Creates PAYCOMP (company details) seed data
// Run with: node utils/createClaims.js
// ----------------------------------------------------

import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Claim from "../models/Claim.js";
import Employee from "../models/Employee.js";
import Element from "../models/Element.js";

dotenv.config();
await connectDB();

async function createClaims() {
  const defaultEmployee = await Employee.findOne();
  const defaultElement = await Element.findOne();

  if (!defaultEmployee || !defaultElement) {
    throw new Error("Seed employees and elements first");
  }

  const result = await Claim.updateMany(
    {
      $or: [{ employee: { $exists: false } }, { element: { $exists: false } }],
    },
    {
      $set: {
        employee: defaultEmployee._id,
        element: defaultElement._id,
      },
    },
  );

  console.log(`Created ${result.modifiedCount} claims`);
  process.exit(0);
}

createClaims();
