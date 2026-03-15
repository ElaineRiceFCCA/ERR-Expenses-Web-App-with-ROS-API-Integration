import express from "express";
import { protect } from "../middleware/auth.js";
import { getUserActivityReport } from "../controllers/adminReportController.js";

const router = express.Router();

// Admin-only route
router.get("/activity", protect, getUserActivityReport);

export default router;
