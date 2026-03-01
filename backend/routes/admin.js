import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { performRevenueHandshake } from "../services/revenueHandshake.js";
import Company from "../models/Company.js";

const router = express.Router();

// Admin dashboard endpoint
// Protected by JWT authentication and RBAC
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  res.json({
    message: "Welcome to the Admin Dashboard",
    user: req.user, // Injected by protect middleware
    docs: [
      "/api/admin/users",
      "/api/admin/users/:id",
      "/api/admin/users/:id (PUT/DELETE)",
    ],
  });
});

// ----------------------------------------------------
// POST /api/admin/revenue/handshake
// Tests ROS connectivity using active company config
// Calls signing / handshake service
// ----------------------------------------------------
router.post("/revenue/handshake", protect, adminOnly, async (req, res) => {
  try {
    // Retrieve active company configuration
    const company = await Company.findOne({ active: true });

    if (!company) {
      return res.status(400).json({
        message: "No active company configuration found",
      });
    }

    // Execute ROS handshake via service layer
    const result = await performRevenueHandshake(company);

    res.json({
      message: "Revenue handshake completed",
      status: result.status,
      response: result.body,
    });
  } catch (err) {
    res.status(500).json({
      message: "Revenue handshake failed",
      error: err.message,
    });
  }
});

// ----------------------------------------------------
// Admin user management (CRUD)
// All routes require protect + adminOnly middleware.
// ----------------------------------------------------
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
