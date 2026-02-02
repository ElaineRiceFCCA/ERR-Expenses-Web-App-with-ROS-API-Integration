import express from "express";
import { protect } from "../middleware/auth.js";
import Claim from "../models/Claim.js";
import Element from "../models/Element.js";

const router = express.Router();

// Submit a new expense claim
router.post("/claim", protect, async (req, res) => {
  try {
    const { description, payDate, employee, element, days, amount } = req.body;

    if (!payDate) {
      return res.status(400).json({ message: "paydate is required" });
    }

    const el = await Element.findById(element);
    if (!el) {
      return res.status(400).json({ message: "Invalid element" });
    }

    let finalAmount = amount;

    if (el.category === "REMOTE_WORKING_DAILY_ALLOWANCE") {
      if (!days) {
        return res.status(400).json({ message: "Days required" });
      }
      finalAmount = days * el.rate;
    }

    const claim = await Claim.create({
      processor: req.user._id,
      employee,
      element,
      days,
      amount: finalAmount,
      description,
      payDate: new Date(payDate),
    });

    res.status(201).json({ message: "Claim created successfully", claim });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating claim", error: err.message });
  }
});

// Get all pending claims
router.get("/claims", protect, async (req, res) => {
  try {
    const claims = await Claim.find({ status: "pending" })
      .populate("employee")
      .populate("element")
      .sort({ payDate: 1 });

    res.json(claims);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching claims", error: err.message });
  }
});

export default router;
