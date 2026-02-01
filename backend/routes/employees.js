import express from "express";
import { protect } from "../middleware/auth.js";
import { getEmployees } from "../controllers/employeeController.js";

const router = express.Router();

// GET /api/employees
router.get("/", protect, getEmployees);

export default router;
