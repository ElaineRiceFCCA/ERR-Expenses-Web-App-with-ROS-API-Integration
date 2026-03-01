import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import bcrypt from "bcryptjs"; // Used by model-level password hashing / comparison

// Generates a signed JWT containing the user ID
// Token is valid for 7 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Registers a new user
// - Validates email uniqueness
// - Persists user to MongoDB
// - Returns JWT for immediate authentication
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check for existing account
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Create user (password hashing handled in User model)
    const user = await User.create({ name, email, password, role });

    // Return minimal user payload + JWT
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Authenticates user credentials
// - Validates email
// - Compares password via model method
// - Returns JWT on success
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    // matchPassword() defined in User schema
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
