import { Router } from "express"
import { authLimiter } from "../middlewares/rateLimit.middleware.js"
import { protect } from "../middlewares/auth.middleware.js"
import { validateRequest } from "../middlewares/validate.middleware.js"
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  updatePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js"
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js"

const router = Router()

// Public Routes (Admin Postman Registration & Login)
router.post("/register", registerValidator, validateRequest, register)
router.post("/login", authLimiter, loginValidator, validateRequest, login)
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validateRequest, forgotPassword)
router.put("/reset-password/:token", resetPasswordValidator, validateRequest, resetPassword)
router.post("/logout", logout)

// Protected Routes (Requires JWT Cookie)
router.use(protect)
router.get("/me", getMe)
router.put("/update-profile", updateProfileValidator, validateRequest, updateProfile)
router.put("/update-password", updatePasswordValidator, validateRequest, updatePassword)

export default router