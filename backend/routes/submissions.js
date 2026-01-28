import express from "express";
import { generateERRSubmission } from "../services/errSubmissionCtrl.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { payDate } = req.body;

    if (!payDate) {
      return res.status(400).json({ message: "payDate is required" });
    }

    const submission = await generateERRSubmission(new Date(payDate));

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
