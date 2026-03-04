import express from "express";
import { protect } from "../middleware/auth.js";
import { createERRSubmission } from "../controllers/errSubmissionController.js";

const router = express.Router();

// ----------------------------------------------------
// POST /api/submissions/generate
// Generates an ERR submission for a given payDate
// Requires authenticated user
// ----------------------------------------------------
router.post(
  "/",
  protect,
  (req, res, next) => {
    if (req.user.role !== "processor" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorised to generate submissions",
      });
    }

    next();
  },
  createERRSubmission,
);

export default router;
