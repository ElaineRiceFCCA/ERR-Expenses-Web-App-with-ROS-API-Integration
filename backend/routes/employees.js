import express from "express";
import { protect } from "../middleware/auth.js";
import { getEmployees } from "../controllers/employeeController.js";

const router = express.Router();

// GET /api/employees
// Returns all active employees
// Requires authenticated user
router.get("/", protect, getEmployees);

export default router;
