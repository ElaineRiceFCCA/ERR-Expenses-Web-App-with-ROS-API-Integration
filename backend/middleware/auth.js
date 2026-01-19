import jwt from "jsonwebtoken";
import User from "../models/Users.js";

// Protect routes by validating JWT
export const protect = async (req, res, next) => {
  let token;

  // Look for token in Authorisation header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      req.user = await User.findById(decoded.id).select("-password"); // Attach user to request
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token)
    return res.status(401).json({ message: "Not authorized, no token" });
};

// Restrict route to admin users only
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Admin access required" });
};
