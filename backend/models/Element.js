import mongoose from "mongoose";

const elementSchema = new mongoose.Schema(
  {
    // Revenue ERR category
    category: {
      type: String,
      required: true,
      enum: [
        "REMOTE_WORKING_DAILY_ALLOWANCE",
        "SMALL_BENEFITS_EXEMPTION",
        "TRAVEL_AND_SUBSISTENCE",
      ],
    },

    // Revenue ERR subCategory (nullable for some categories)
    subCategory: {
      type: String,
      required: false,
    },

    // Human-readable description (for UI purposes)
    description: {
      type: String,
      required: true,
    },

    // Control flag (future-proofing)
    active: {
      type: Boolean,
      default: true,
    },

    // Only used for REMOTE_WORKING_DAILY_ALLOWANCE category
    rate: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true },
);

const Element = mongoose.model("Element", elementSchema);
export default Element;
