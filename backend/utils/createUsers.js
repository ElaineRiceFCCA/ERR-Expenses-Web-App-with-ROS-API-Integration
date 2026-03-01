// ----------------------------------------------------
// Utility: Seeds test users (admin + processor)
// Passwords are hashed via User model pre-save hook
// Run with: node utils/createUsers.js
// ----------------------------------------------------

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/Users.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB(); // Establish MongoDB connection

// Default test accounts for RBAC validation
const users = [
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "Admin123!",
    role: "admin",
  },
  {
    name: "Processor User",
    email: "processor@test.com",
    password: "Processor123!",
    role: "processor",
  },
];

async function createUsers() {
  try {
    // Remove existing seed users (POC reset strategy)
    await User.deleteMany({
      email: { $in: ["admin@test.com", "processor@test.com"] },
    });

    // Insert predefined users
    // Password hashing handled automatically in model pre-save hook
    for (const user of users) {
      const newUser = await User.create(user);
      console.log(`Created user: ${newUser.email} (${newUser.role})`);
    }

    console.log("User creation complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating users:", error);
    process.exit(1);
  }
}

createUsers();
