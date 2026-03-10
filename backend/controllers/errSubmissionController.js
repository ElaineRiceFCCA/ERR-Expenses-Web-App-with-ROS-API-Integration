// backend/controllers/errSubmissionController.js
import { generateERRSubmission } from "../services/errSubmissionCtrl.js";
import { submitErrToRos } from "../services/rosErrClient.js";
import Claim from "../models/Claim.js";
import Submission from "../models/Submission.js";

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
      rosResponse = await submitErrToRos({
        employerRegistrationNumber: submission.employerRegistrationNumber,
        taxYear: submission.taxYear,
        runReference: submission.enhancedReportingRunReference,
        submissionID: submission.submissionID,
        payload: submission.requestBody,
      });

      submissionSuccess = rosResponse.ok;
    } catch (error) {
      console.error("ROS submission failed:", error);
      rosResponse = {
        ok: false,
        status: 0,
        response: { message: error.message },
      };
    }

    // --------------------------------------------
    // Calculate submission summary (ALWAYS)
    // --------------------------------------------

    const claimIds = claims.map((c) => c._id);

    const lineItemCount = claims.length;

    const totalAmount = claims.reduce((sum, claim) => {
      return sum + Number(claim.amount || 0);
    }, 0);

    // --------------------------------------------
    // Determine acknowledgement values
    // --------------------------------------------

    let acknowledgementStatus = "REJECTED";
    let acknowledgementID = null;

    if (submissionSuccess) {
      acknowledgementStatus =
        rosResponse.response?.acknowledgementStatus || "ACKNOWLEDGED";

      acknowledgementID = rosResponse.response?.acknowledgementID || null;

      // Update claims to submitted ONLY if successful
      await Claim.updateMany(
        { _id: { $in: claimIds } },
        { status: "submitted" },
      );
    }

    // --------------------------------------------
    // Persist submission attempt to MongoDB
    // (Always store for audit purposes)
    // --------------------------------------------

    try {
      const newSubmission = await Submission.create({
        employerRegistrationNumber: submission.employerRegistrationNumber,
        taxYear: submission.taxYear,
        enhancedReportingRunReference: submission.enhancedReportingRunReference,
        submissionID: submission.submissionID,
        payDate: new Date(payDate),
        claims: claimIds,
        lineItemCount,
        totalAmount,
        expensesBenefits: submission.requestBody.expensesBenefits,
        acknowledgementStatus,
        acknowledgementID,
        revenueResponse: rosResponse,
        traceId: rosResponse?.traceId || null,
      });

      console.log("Submission saved:", newSubmission._id);
    } catch (err) {
      console.error("SUBMISSION SAVE ERROR:");
      console.error(err);
    }

    return res.status(200).json({
      success: true,
      message: submissionSuccess
        ? "ERR submission generated and submitted to ROS"
        : "ERR submission generated but ROS submission failed",
      submissionID: submission.submissionID,
      filePath,
      rosSubmitted: submissionSuccess,
      rosResponse,
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
