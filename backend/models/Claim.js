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
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "submitted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Claim", claimSchema);
