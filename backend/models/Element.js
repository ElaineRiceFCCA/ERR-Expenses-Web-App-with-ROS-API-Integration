import mongoose from "mongoose";

// ----------------------------------------------------
// Element Schema
// Represents a Revenue ERR reporting element
// Defines the category/subcategory structure used
// when building submission payloads
// ----------------------------------------------------

const elementSchema = new mongoose.Schema(
  {
    // Revenue-defined ERR category (restricted to supported values)
    category: {
      type: String,
      required: true,
      enum: [
        "REMOTE_WORKING_DAILY_ALLOWANCE",
        "SMALL_BENEFITS_EXEMPTION",
        "TRAVEL_AND_SUBSISTENCE",
      ],
    },

    // Revenue subCategory (optional depending on category)
    subCategory: {
      type: String,
      required: false,
    },

    // UI-facing description for claim entry screens
    description: {
      type: String,
      required: true,
    },

    // Soft enable/disable flag to control availability
    active: {
      type: Boolean,
      default: true,
    },

    // Daily rate (used only for REMOTE_WORKING_DAILY_ALLOWANCE)
    // Enables validation or auto-calculation logic if required
    rate: {
      type: Number,
      required: false,
    },
  },

  // Automatically stores createdAt and updatedAt
  // Supports auditability and submission traceability
  { timestamps: true },
);

const Element = mongoose.model("Element", elementSchema);
export default Element;
