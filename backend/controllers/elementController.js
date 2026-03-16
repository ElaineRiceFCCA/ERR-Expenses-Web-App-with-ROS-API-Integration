// ======================================================
// ELEMENT CONTROLLER
// ======================================================
// Purpose:
// Manages expense element configuration records
// Elements represent Revenue ERR expense categories
// (e.g., Remote Working, Small Benefits, Travel)
//
// Responsibilities:
//   - Retrieve active elements
//   - Validate category/subCategory business rules
//   - Create new elements
//   - Update existing elements
//
// This controller enforces Revenue category constraints
// before data is persisted to MongoDB
// ======================================================

import Element from "../models/Element.js";

// ----------------------------------------------------
// Allowed Subcategories for TRAVEL_AND_SUBSISTENCE
// ----------------------------------------------------
// Revenue specification restricts travel-related
// categories to a defined list of permitted values
// This constant ensures controlled validation

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
// Endpoint Purpose:
// Returns all active element definitions
// Elements are sorted hierarchically by:
//   - category (primary grouping)
//   - subCategory (secondary grouping)
//
// Only records with active: true are returned,
// allowing soft-deactivation without deletion

export const getAllElements = async (req, res) => {
  try {
    // Filter by active flag and sort hierarchically
    const elements = await Element.find({ active: true }).sort({
      category: 1,
      subCategory: 1,
    });

    // Return element list as JSON
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
// Endpoint Purpose:
// Creates a new expense element definition
//
// Business Rules Enforced:
//   - category is required
//   - description is required
//   - TRAVEL_AND_SUBSISTENCE must use valid subCategory
//   - Other categories must NOT contain subCategory
//
// Returns HTTP 201 on successful creation

export const createElement = async (req, res) => {
  try {
    const { category, subCategory, description, rate } = req.body;

    // Validate required fields
    if (!category || !description) {
      return res.status(400).json({
        message: "Category and description are required",
      });
    }

    // Validate subcategory rules
    if (category === "TRAVEL_AND_SUBSISTENCE") {
      // Travel category must use an approved subcategory
      if (!travelSubCategories.includes(subCategory)) {
        return res.status(400).json({
          message: "Invalid subCategory for TRAVEL_AND_SUBSISTENCE",
        });
      }
    } else {
      // All other categories must NOT define subCategory
      if (subCategory) {
        return res.status(400).json({
          message: "SubCategory not allowed for this category",
        });
      }
    }

    // Create and persist new element document
    const newElement = await Element.create({
      category,
      subCategory: category === "TRAVEL_AND_SUBSISTENCE" ? subCategory : null,
      description,
      rate,
      active: true, // Default to active on creation
    });

    return res.status(201).json(newElement);
  } catch (error) {
    res.status(500).json({
      message: "Error creating element",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// PUT: Update existing element
// ----------------------------------------------------
// Endpoint Purpose:
// Updates an existing element definition
//
// Re-applies the same validation rules as creation
// Ensures category/subCategory consistency is preserved
//
// Returns:
//   - 200 with updated document
//   - 404 if element not found
//   - 400 if validation fails

export const updateElement = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, subCategory } = req.body;

    // Re-validate subcategory rules on update
    if (category === "TRAVEL_AND_SUBSISTENCE") {
      // Travel must use allowed subcategories
      if (!travelSubCategories.includes(subCategory)) {
        return res.status(400).json({
          message: "Invalid subCategory for TRAVEL_AND_SUBSISTENCE",
        });
      }
    } else {
      // Other categories must not include subCategory
      if (subCategory) {
        return res.status(400).json({
          message: "SubCategory not allowed for this category",
        });
      }
    }

    // Update document by ID with validation enabled
    const updatedElement = await Element.findByIdAndUpdate(id, req.body, {
      new: true, // Return updated document
      runValidators: true, // Enforce schema validation
    });

    // Handle not-found scenario
    if (!updatedElement) {
      return res.status(404).json({
        message: "Element not found",
      });
    }

    return res.json(updatedElement);
  } catch (error) {
    res.status(500).json({
      message: "Error updating element",
      error: error.message,
    });
  }
};
