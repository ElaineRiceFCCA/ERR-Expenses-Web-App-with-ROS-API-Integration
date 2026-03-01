import express from "express";
import { protect } from "../middleware/auth.js";
import { getAllElements } from "../controllers/elementController.js";

const router = express.Router();

// GET /api/elements
// Returns all active ERR elements
// Requires authenticated user
router.get("/", protect, getAllElements);

export default router;
