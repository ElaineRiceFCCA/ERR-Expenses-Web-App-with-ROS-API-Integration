import jwt from "jsonwebtoken";
import User from "../models/Users.js";

// Middleware: Protects routes by validating JWT
// - Extracts token from Authorization header
// - Verifies signature
// - Attaches authenticated user to req.user
export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token value
      token = req.headers.authorization.split(" ")[1];

      // Validate token signature and expiry
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (excluding password) to request context
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // No token present
  if (!token)
    return res.status(401).json({ message: "Not authorized, no token" });
};

// Middleware: Restricts access to admin users only
// Requires protect middleware to run first
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Admin access required" });
};
