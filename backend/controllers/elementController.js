import Element from "../models/Element.js";

// Retrieves all active expense elements
// Results are sorted for predictable UI grouping
export const getAllElements = async (req, res) => {
  try {
    // Filter by active flag and sort hierarchically
    const elements = await Element.find({ active: true }).sort({
      category: 1,
      subCategory: 1,
    });
    res.json(elements);
  } catch (error) {
    // Generic server error response
    res.status(500).json({
      message: "Error fetching elements",
      error: error.message,
    });
  }
};
