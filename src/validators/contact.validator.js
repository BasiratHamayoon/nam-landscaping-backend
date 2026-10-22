import { body } from "express-validator"

export const submitContactValidator = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").notEmpty().withMessage("Phone number is required").trim(),
  body("message").notEmpty().withMessage("Message is required").trim(),
  body("serviceOfInterest").optional().trim(),
]

export const updateContactStatusValidator = [
  body("status")
    .isIn(["Unread", "Read", "Replied", "Archived"])
    .withMessage("Invalid status value"),
]