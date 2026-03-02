import mongoose from "mongoose";

// ----------------------------------------------------
// Claim Schema
// Represents a single expense/benefit claim prior to ERR submission
// Acts as the primary transactional entity in the system
// ----------------------------------------------------

const claimSchema = new mongoose.Schema(
  {
    // User (processor) who created the claim
    processor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Monetary amount to be reported
    amount: { type: Number, required: true },

    // Free-text description (internal reference)
    description: { type: String, required: true },

    // Pay date used for ERR reporting period grouping
    payDate: {
      type: Date,
      required: true,
    },

    // Workflow state of the claim
    // - pending: created, not yet included in ERR run
    // - generated: included in ERR payload
    // - submitted: successfully submitted to ROS
    // - rejected: rejected by Revenue / failed validation
    status: {
      type: String,
      enum: ["pending", "generated", "submitted", "rejected"],
      default: "pending",
    },

    // Linked employee (required for PPSN logic handling)
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // Linked reporting element (ERR category/subcategory)
    element: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Element",
      required: true,
    },

    // Optional field (used for certain expense types, e.g. subsistence)
    days: {
      type: Number,
      required: false,
    },
  },

  // Automatically stores createdAt and updatedAt
  // Supports auditability and submission traceability
  { timestamps: true },
);

export default mongoose.model("Claim", claimSchema);
