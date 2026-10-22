import { body } from "express-validator"

export const createProjectValidator = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("client").notEmpty().withMessage("Client name is required").trim(),
  body("location").notEmpty().withMessage("Location is required").trim(),
  body("serviceType").notEmpty().withMessage("Service type is required").trim(),
  body("shortDescription").notEmpty().withMessage("Short description is required").isLength({ max: 300 }),
  body("description").notEmpty().withMessage("Full description is required"),
]

export const updateProjectValidator = [
  body("title").optional().notEmpty().trim(),
  body("shortDescription").optional().isLength({ max: 300 }),
]