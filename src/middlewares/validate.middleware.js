import { validationResult } from "express-validator"
import ApiError from "../utils/ApiError.js"

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }))

  throw new ApiError(400, "Validation Error", extractedErrors)
}