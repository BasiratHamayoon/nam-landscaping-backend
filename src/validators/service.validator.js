import { body } from "express-validator"

export const createServiceValidator = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("shortDescription").notEmpty().withMessage("Short description is required").isLength({ max: 250 }),
  body("description").notEmpty().withMessage("Full description is required"),
  body("category").optional().isIn([
    "Landscape Design", "Hardscaping", "Pool & Water", "Maintenance", "Lighting", "Irrigation", "Other",
  ]),
]

export const updateServiceValidator = [
  body("title").optional().notEmpty().trim(),
  body("shortDescription").optional().isLength({ max: 250 }),
]