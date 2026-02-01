import Element from "../models/Element.js";

// GET all active elements
export const getAllElements = async (req, res) => {
  try {
    const elements = await Element.find({ active: true }).sort({
      category: 1,
      subCategory: 1,
    });
    res.json(elements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching elements",
      error: error.message,
    });
  }
};
