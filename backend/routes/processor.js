import express from "express";
import { protect } from "../middleware/auth.js";
import Claim from "../models/Claim.js";
import Element from "../models/Element.js";

const router = express.Router();

// ----------------------------------------------------
// POST /api/processor/claim
// Creates a new expense claim (processor role)
// Applies category-specific validation and calculation
// ----------------------------------------------------
router.post("/claim", protect, async (req, res) => {
  try {
    const { description, payDate, employee, element, days, amount } = req.body;

    // payDate is mandatory for ERR period grouping
    if (!payDate) {
      return res.status(400).json({ message: "paydate is required" });
    }

    // Validate referenced reporting element
    const el = await Element.findById(element);
    if (!el) {
      return res.status(400).json({ message: "Invalid element" });
    }

    let finalAmount = amount;

    // Category-specific logic:
    // REMOTE_WORKING_DAILY_ALLOWANCE = days * predefined rate
    if (el.category === "REMOTE_WORKING_DAILY_ALLOWANCE") {
      if (!days) {
        return res.status(400).json({ message: "Days required" });
      }
      finalAmount = days * el.rate;
    }

    // Persist claim with processor reference
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

// ----------------------------------------------------
// PUT /api/processor/claim/:id
// Updates a pending claim only
// ----------------------------------------------------
router.put("/claim/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, payDate, employee, element, days, amount } = req.body;

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Only allow editing of pending claims
    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "Only pending claims can be edited",
      });
    }

    const el = await Element.findById(element);
    if (!el) {
      return res.status(400).json({ message: "Invalid element" });
    }

    let finalAmount = amount;

    // Reapply category logic on update
    if (el.category === "REMOTE_WORKING_DAILY_ALLOWANCE") {
      if (!days) {
        return res.status(400).json({ message: "Days required" });
      }
      finalAmount = days * el.rate;
    }

    claim.description = description;
    claim.payDate = new Date(payDate);
    claim.employee = employee;
    claim.element = element;
    claim.days = days;
    claim.amount = finalAmount;

    await claim.save();

    res.json({ message: "Claim updated successfully", claim });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating claim", error: err.message });
  }
});

// ----------------------------------------------------
// GET /api/processor/claims
// Returns all pending claims for ERR generation
// ----------------------------------------------------
router.get("/claims", protect, async (req, res) => {
  try {
    const claims = await Claim.find({ status: "pending" })
      .populate("employee") // Required for PPSN logic
      .populate("element") // Required for category mapping
      .sort({ payDate: 1 });

    res.json(claims);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching claims", error: err.message });
  }
});

export default router;
