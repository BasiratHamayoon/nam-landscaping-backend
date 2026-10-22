import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { env } from "../config/env.js"
import { Admin } from "../models/Admin.model.js"

export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.cookies.token) {
    token = req.cookies.token
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    throw new ApiError(401, "Not authorized to access this route")
  }

  try {
    const decoded = jwt.verify(token, env.JWT.SECRET)
    const admin = await Admin.findById(decoded.id).select("-password")

    if (!admin) {
      throw new ApiError(401, "Admin user not found")
    }

    req.admin = admin
    next()
  } catch (error) {
    throw new ApiError(401, "Token is invalid or expired")
  }
})