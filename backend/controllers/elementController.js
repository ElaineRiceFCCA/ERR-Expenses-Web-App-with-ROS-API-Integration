import Element from "../models/Element.js";

// ----------------------------------------------------
// Allowed Subcategories for TRAVEL_AND_SUBSISTENCE
// ----------------------------------------------------
const travelSubCategories = [
  "EATING_ON_SITE",
  "EMERGENCY_TRAVEL",
  "SITE_BASED_EMPLOYEES",
  "SUBSISTENCE_UNVOUCHED",
  "SUBSISTENCE_VOUCHED",
  "TRAVEL_UNVOUCHED",
  "TRAVEL_VOUCHED",
];

// ----------------------------------------------------
// GET: Retrieve all active elements
// ----------------------------------------------------
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
// ----------------------------------------------------
// POST: Create new element
// ----------------------------------------------------
export const createElement = async (req, res) => {
  try {
    const { category, subCategory, description, rate } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        message: "Category and description are required",
      });
    }

    // Validate subcategory rules
    if (category === "TRAVEL_AND_SUBSISTENCE") {
      if (!travelSubCategories.includes(subCategory)) {
        return res.status(400).json({
          message: "Invalid subCategory for TRAVEL_AND_SUBSISTENCE",
        });
      }
    } else {
      // All other categories must NOT have subcategory
      if (subCategory) {
        return res.status(400).json({
          message: "SubCategory not allowed for this category",
        });
      }
    }

    const newElement = await Element.create({
      category,
      subCategory: category === "TRAVEL_AND_SUBSISTENCE" ? subCategory : null,
      description,
      rate,
      active: true,
    });

    return res.status(201).json(newElement);
  } catch (error) {
    res.status(500).json({
      message: "Error creating element",
      error: error.message,
    });
  }
};
