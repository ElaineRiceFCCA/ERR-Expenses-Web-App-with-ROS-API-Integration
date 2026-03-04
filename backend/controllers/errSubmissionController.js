import { generateERRSubmission } from "../services/errSubmissionCtrl.js";
import Claim from "../models/Claim.js";

// POST /api/processor/submissions
// Generate ERR submission and attempt ROS submission
export const createERRSubmission = async (req, res) => {
  try {
    const { payDate } = req.body;

    if (!payDate) {
      return res.status(400).json({
        success: false,
        message: "payDate is required",
      });
    }

    const result = await generateERRSubmission(payDate);

    const { submission, filePath, claims } = result;

    // ROS API submission attempt
    let rosResponse = null;
    let submissionSuccess = false;

    try {
      // POC simulation
      submissionSuccess = true;
    } catch (error) {
      console.error("ROS submission failed:", error);
    }

    // Update claims ONLY if successful
    if (submissionSuccess) {
      const claimIds = claims.map((c) => c._id);

      await Claim.updateMany(
        { _id: { $in: claimIds } },
        { status: "submitted" },
      );
    }

    return res.status(200).json({
      success: true,

      message: submissionSuccess
        ? "ERR submission generated and submitted to ROS"
        : "ERR submission generated but ROS submission failed",

      submissionID: submission.submissionID,

      filePath,

      rosSubmitted: submissionSuccess,

      submission,
    });
  } catch (error) {
    console.error("ERR submission error:", error);

    return res.status(500).json({
      success: false,
      message: "ERR submission generation failed",
      error: error.message,
    });
  }
};
