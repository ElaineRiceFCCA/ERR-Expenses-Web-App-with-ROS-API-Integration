import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getAllElements,
  createElement,
  updateElement,
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

// PUT /api/elements/:id
// Updates an existing ERR element
// Requires authenticated user
router.put("/:id", protect, updateElement);

export default router;
