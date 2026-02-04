import express from "express";
import { protect } from "../middleware/auth.js";
import { performRevenueHandshake } from "../services/revenueHandshake.js";
import Company from "../models/Company.js";

const router = express.Router();

// ----------------------------------------------------
// POST /api/revenue/handshake
// Admin-only: performs ROS handshake
// ----------------------------------------------------
router.post("/handshake", protect, async (req, res) => {
  try {
    const company = await Company.findOne({ active: true });
    if (!company) {
      return res.status(400).json({ message: "No active company found" });
    }

    const result = await performRevenueHandshake(company);

    res.json({
      message: "Revenue handshake completed",
      status: result.status,
      response: result.body,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      message: "Revenue handshake failed",
      error: err.message,
    });
  }
});

export default router;
