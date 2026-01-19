import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Admin-only dashboard endpoint
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  res.json({
    message: "Welcome to the Admin Dashboard",
    user: req.user,
    docs: [
      "/api/admin/users",
      "/api/admin/users/:id",
      "/api/admin/users/:id (PUT/DELETE)",
    ],
  });
});

// CRUD endpoints
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
