import express from "express";
import { protect } from "../middleware/auth.js";
import Claim from "../models/Claim.js";

const router = express.Router();

// Processor dashboard (shows user info + options)
router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome, Payroll Processor!",
    user: req.user,
    availableActions: [
      "Submit Expense Claim",
      "View Submitted Claims",
      "Send ERR Submission",
    ],
  });
});

// Submit a new expense claim
router.post("/claim", protect, async (req, res) => {
  try {
    const { amount, description, payDate } = req.body;

    if (!payDate) {
      return res.status(400).json({ message: "paydate is required" });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: "amount is required" });
    }

    const claim = await Claim.create({
      processor: req.user._id,
      employee: req.body.employee,
      element: req.body.element,
      amount: req.body.amount,
      description: req.body.description,
      payDate: new Date(req.body.payDate),
    });

    res.status(201).json({ message: "Claim created successfully", claim });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating claim", error: err.message });
  }
});

// Get all claims for current processor (inc audit info)
router.get("/claims", protect, async (req, res) => {
  try {
    const claims = await Claim.find({})
      .populate("processor", "name role email") // for auditing
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching claims", error: err.message });
  }
});

export default router;
