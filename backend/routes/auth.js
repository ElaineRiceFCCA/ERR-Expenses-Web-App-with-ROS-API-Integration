import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
const router = express.Router();

// Public authentication endpoints
// Issue JWT on successful registration or login
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
