// ----------------------------------------------------
// Utility: Seeds ERR reporting elements (PAYCELMS)
// Defines supported category/subCategory combinations
// Run with: node utils/createElements.js
// ----------------------------------------------------

import dotenv from "dotenv";
import Element from "../models/Element.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB(); // Establish MongoDB connection

// Revenue-aligned ERR element definitions (PIT scope)
const elements = [
  {
    category: "REMOTE_WORKING_DAILY_ALLOWANCE",
    subCategory: null,
    description: "Remote working daily allowance",
    rate: 3.2, // Daily rate used in amount calculation (hardcoded for POC)
  },
  {
    category: "SMALL_BENEFITS_EXEMPTION",
    subCategory: null,
    description: "Small benefits exemption",
    rate: null,
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "EATING_ON_SITE",
    description: "Eating on site",
    rate: null,
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "EMERGENCY_TRAVEL",
    description: "Emergency travel",
    rate: null,
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "SITE_BASED_EMPLOYEES",
    description: "Site-based employees travel",
    rate: null,
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "SUBSISTENCE_UNVOUCHED",
    description: "Subsistence unvouched",
    rate: null,
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "SUBSISTENCE_VOUCHED",
    description: "Subsistence vouched",
    rate: null,
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "TRAVEL_UNVOUCHED",
    description: "Travel unvouched",
    rate: null,
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "TRAVEL_VOUCHED",
    description: "Travel vouched",
    rate: null,
  },
];

async function createElements() {
  try {
    // Reset existing elements (POC assumption)
    await Element.deleteMany({});

    // Insert predefined ERR element set
    for (const el of elements) {
      const newEl = await Element.create(el);
      console.log(
        `Created element: ${newEl.category}${
          newEl.subCategory ? " / " + newEl.subCategory : ""
        }`,
      );
    }

    console.log("Payment elements seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating elements:", error);
    process.exit(1);
  }
}

createElements();
