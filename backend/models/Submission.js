import mongoose from "mongoose";

// ----------------------------------------------------
// ERR Submission Schema
// Represents a generated ERR run sent to Revenue
// Provides auditability and acknowledgement tracking
// ----------------------------------------------------

const submissionSchema = new mongoose.Schema(
  {
    // Revenue employer identifier
    employerRegistrationNumber: {
      type: String,
      required: true,
    },

    // Reporting tax year (e.g., 2025)
    taxYear: {
      type: Number,
      required: true,
    },

    // Generated run reference:
    // payrollReference + YYYYMM + sequence
    enhancedReportingRunReference: {
      type: String,
      required: true,
    },

    // Unique submission identifier for this run
    // Ensures idempotency and prevents duplication
    submissionID: {
      type: String,
      required: true,
      unique: true,
    },

    // Pay date associated with this submission batch
    payDate: {
      type: Date,
      required: true,
    },

    // Claims included in this submission
    // Links to Claim documents for traceability
    claims: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Claim",
      },
    ],

    // User who triggered submission
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Submission Summary
    lineItemCount: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // --- NEW: Exact line items sent to Revenue ---
    expensesBenefits: {
      type: Array,
      required: true,
    },

    // Revenue acknowledgement status
    // Set after submission response received
    acknowledgementStatus: {
      type: String,
      enum: ["ACKNOWLEDGED", "REJECTED"],
      required: true,
    },

    // Revenue-issued acknowledgement identifier
    acknowledgementID: {
      type: String,
    },

    // Full Revenue response payload (stored for audit/debug)
    revenueResponse: {
      type: Object,
    },

    // Revenue trace ID (X-trace-id header)
    // Supports correlation and troubleshooting
    traceId: {
      type: String,
    },
  },

  // Automatically stores createdAt and updatedAt
  // Supports auditability and submission traceability
  { timestamps: true },
);

export default mongoose.model("Submission", submissionSchema, "submissions");
