import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCompany,
  createCompany,
  updateCompany,
} from "../controllers/companyController.js";

const router = express.Router();

router.get("/", protect, getCompany);
router.post("/", protect, createCompany);
router.put("/:id", protect, updateCompany);

export default router;
