import { body } from "express-validator"

export const registerValidator = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
]

export const loginValidator = [
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
]

export const updateProfileValidator = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty").trim(),
  body("email").optional().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
]

export const updatePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters long"),
]

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
]

export const resetPasswordValidator = [
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
]