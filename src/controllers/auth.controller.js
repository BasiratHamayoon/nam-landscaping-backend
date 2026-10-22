import crypto from "crypto"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Admin } from "../models/Admin.model.js"
import { generateTokenAndSetCookie } from "../utils/generateToken.js"
import { sendEmail } from "../utils/sendEmail.js"
import { env } from "../config/env.js"

// Use this strictly via Postman to setup your initial admin account
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const adminExists = await Admin.findOne({ email })
  if (adminExists) {
    throw new ApiError(400, "Admin already exists with this email")
  }

  const admin = await Admin.create({ name, email, password })
  const token = generateTokenAndSetCookie(res, admin._id)

  res.status(201).json(
    new ApiResponse(201, {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    }, "Admin registered successfully")
  )
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const admin = await Admin.findOne({ email }).select("+password")
  if (!admin || !(await admin.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password")
  }

  const token = generateTokenAndSetCookie(res, admin._id)

  res.status(200).json(
    new ApiResponse(200, {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      avatar: admin.avatar,
      role: admin.role,
      token,
    }, "Logged in successfully")
  )
})

export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"))
})

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.admin, "Admin profile fetched"))
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body

  if (email && email !== req.admin.email) {
    const emailExists = await Admin.findOne({ email })
    if (emailExists) throw new ApiError(400, "Email already in use")
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin._id,
    { name, email },
    { new: true, runValidators: true }
  )

  res.status(200).json(new ApiResponse(200, updatedAdmin, "Profile updated successfully"))
})

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const admin = await Admin.findById(req.admin._id).select("+password")
  if (!(await admin.matchPassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect")
  }

  admin.password = newPassword
  await admin.save()

  generateTokenAndSetCookie(res, admin._id)

  res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"))
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email })
  if (!admin) throw new ApiError(404, "There is no admin with that email")

  const resetToken = admin.getResetPasswordToken()
  await admin.save({ validateBeforeSave: false })

  const resetUrl = `${env.ADMIN_PANEL_URL}/reset-password/${resetToken}`
  const message = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your NAM Landscaping Admin account.</p>
    <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
    <a href="${resetUrl}" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `

  try {
    await sendEmail({
      to: admin.email,
      subject: "NAM Landscaping Admin - Password Reset",
      html: message,
    })
    res.status(200).json(new ApiResponse(200, {}, "Password reset email sent"))
  } catch (error) {
    admin.resetPasswordToken = undefined
    admin.resetPasswordExpire = undefined
    await admin.save({ validateBeforeSave: false })
    throw new ApiError(500, "Email could not be sent")
  }
})

export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

  const admin = await Admin.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!admin) throw new ApiError(400, "Invalid or expired reset token")

  admin.password = req.body.password
  admin.resetPasswordToken = undefined
  admin.resetPasswordExpire = undefined
  await admin.save()

  generateTokenAndSetCookie(res, admin._id)

  res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"))
})