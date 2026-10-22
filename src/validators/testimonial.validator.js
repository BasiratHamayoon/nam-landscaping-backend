import { body } from "express-validator"

export const createTestimonialValidator = [
  body("name").notEmpty().withMessage("Client name is required").trim(),
  body("location").notEmpty().withMessage("Location is required").trim(),
  body("projectType").notEmpty().withMessage("Project type is required").trim(),
  body("content").notEmpty().withMessage("Testimonial content is required").trim(),
  body("rating").optional().isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
]

export const updateTestimonialValidator = [
  body("name").optional().notEmpty().trim(),
  body("content").optional().notEmpty().trim(),
  body("rating").optional().isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
]