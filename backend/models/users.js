import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Full name
    email: { type: String, required: true, unique: true }, // Email for login
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ["admin", "processor"], default: "processor" }, // RBAC
  },
  { timestamps: true }
);

// Encrypt password before saving to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is new or changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export Mongoose model
const User = mongoose.model("User", userSchema);
export default User;
