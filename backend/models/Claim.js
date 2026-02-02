import mongoose from "mongoose";

// Local claim schema
const claimSchema = new mongoose.Schema(
  {
    processor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: { type: Number, required: true },

    description: { type: String, required: true },

    // Pay date (relevant for Revenue)
    payDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "generated", "submitted", "rejected"],
      default: "pending",
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    element: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Element",
      required: true,
    },

    days: {
      type: Number,
      required: false,
    },
  },

  // Timestamp (relevant for audit trail)
  { timestamps: true },
);

export default mongoose.model("Claim", claimSchema);
