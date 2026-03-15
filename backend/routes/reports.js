import express from "express";
import { protect } from "../middleware/auth.js";
import { getAllSubmissions } from "../controllers/reportController.js";

const router = express.Router();

// GET /api/reports/submissions
router.get("/submissions", protect, getAllSubmissions);

export default router;
