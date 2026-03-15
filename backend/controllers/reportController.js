import Submission from "../models/Submission.js";

// ----------------------------------------------------
// GET: All company submissions
// ----------------------------------------------------
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching submissions",
      error: error.message,
    });
  }
};
