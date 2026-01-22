// ----------------------------------------------------
// Creates new admin and processor users directly in DB
// Run with: node utils/createUsers.js from root backend directory
// ----------------------------------------------------

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/Users.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

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
    // Clear existing test users if needed
    await User.deleteMany({
      email: { $in: ["admin@test.com", "processor@test.com"] },
    });

    // Insert users
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
