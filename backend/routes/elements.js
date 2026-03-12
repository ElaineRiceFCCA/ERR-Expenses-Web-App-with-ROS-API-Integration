import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getAllElements,
  createElement,
} from "../controllers/elementController.js";

const router = express.Router();

// GET /api/elements
// Returns all active ERR elements
// Requires authenticated user
router.get("/", protect, getAllElements);

// POST /api/elements
// Creates a new ERR element
// Requires authenticated user
router.post("/", protect, createElement);

export default router;
