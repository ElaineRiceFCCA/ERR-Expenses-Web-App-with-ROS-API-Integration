import express from "express";
import { protect } from "../middleware/auth.js";
import { generateERRSubmission } from "../services/errSubmissionCtrl.js";

const router = express.Router();

// ----------------------------------------------------
// POST /api/submissions/generate
// ----------------------------------------------------

router.post("/generate", protect, async (req, res) => {
  try {
    const { payDate } = req.body;
    if (!payDate) {
      return res.status(400).json({ message: "payDate is required" });
    }

    const submission = await generateERRSubmission(new Date(payDate));

    res.status(201).json({
      message: "ERR submission generated successfully",
      submissionID: submission.submissionID,
      submission,
    });
  } catch (err) {
    res.status(500).json({
      message: "ERR submission generation failed",
      error: err.message,
    });
  }
});

export default router;
