import Claim from "../models/Claim.js";
import Submission from "../models/Submission.js";

// ----------------------------------------------------
// Admin: User Activity Report
// Provides governance-level visibility into:
// - Which user created which claims
// - Which user submitted which ERR runs
// ----------------------------------------------------
export const getUserActivityReport = async (req, res) => {
  try {
    // Claims with processor info
    const claims = await Claim.find()
      .populate("processor", "name email role")
      .populate("employee", "firstName familyName")
      .sort({ createdAt: -1 });

    // Submissions with submitting user
    const submissions = await Submission.find()
      .populate("submittedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      claims,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generating admin activity report",
      error: error.message,
    });
  }
};
