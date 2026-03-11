import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getEmployees,
  createEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

// GET /api/employees
// Returns all active employees
// Requires authenticated user
router.get("/", protect, getEmployees);

// POST /api/employees
// Creates a new employee
// Requires authenticated user
router.post("/", protect, createEmployee);

export default router;
