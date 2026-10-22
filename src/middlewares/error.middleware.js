import { env } from "../config/env.js"
import ApiError from "../utils/ApiError.js"

export const errorHandler = (err, req, res, next) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500)
    const message = error.message || "Internal Server Error"
    error = new ApiError(statusCode, message, error?.errors || [], err.stack)
  }

  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`)
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    error = new ApiError(409, `Duplicate value for field: ${field}`)
  }

  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token. Please log in again.")
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired. Please log in again.")
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(env.NODE_ENV === "development" && { stack: error.stack }),
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${error.message}`)

  res.status(error.statusCode).json(response)
}

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`))
}