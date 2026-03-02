import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ----------------------------------------------------
// User Schema
// Represents an authenticated system user
// Supports RBAC (admin / processor)
// ----------------------------------------------------

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Display name
    email: { type: String, required: true, unique: true }, // Login identifier
    password: { type: String, required: true }, // Stored as bcrypt hash
    role: { type: String, enum: ["admin", "processor"], default: "processor" }, // RBAC: Default least-privilege role
  },

  // Automatically stores createdAt and updatedAt
  // Supports auditability and submission traceability
  { timestamps: true },
);

// Pre-save hook: hashes password before persisting
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Runs only if password is new or modified
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compares plaintext password
// with stored bcrypt hash during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export model
const User = mongoose.model("User", userSchema);
export default User;
