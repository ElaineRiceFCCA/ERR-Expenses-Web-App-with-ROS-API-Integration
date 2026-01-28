// ----------------------------------------------------
// Creates ERR payment elements (PAYCELMS)
// Run with: node utils/createElements.js
// ----------------------------------------------------

import dotenv from "dotenv";
import Element from "../models/Element.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

const elements = [
  {
    category: "REMOTE_WORKING_DAILY_ALLOWANCE",
    subCategory: null,
    description: "Remote working daily allowance",
  },
  {
    category: "SMALL_BENEFITS_EXEMPTION",
    subCategory: null,
    description: "Small benefits exemption",
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "EATING_ON_SITE",
    description: "Eating on site",
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "EMERGENCY_TRAVEL",
    description: "Emergency travel",
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "SITE_BASED_EMPLOYEES",
    description: "Site-based employees travel",
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "SUBSISTENCE_UNVOUCHED",
    description: "Subsistence unvouched",
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "SUBSISTENCE_VOUCHED",
    description: "Subsistence vouched",
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "TRAVEL_UNVOUCHED",
    description: "Travel unvouched",
  },
  {
    category: "TRAVEL_AND_SUBSISTENCE",
    subCategory: "TRAVEL_VOUCHED",
    description: "Travel vouched",
  },
];

async function createElements() {
  try {
    // Clear existing elements
    await Element.deleteMany({});

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
