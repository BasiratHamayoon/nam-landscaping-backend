import { Router } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"
import { validateRequest } from "../middlewares/validate.middleware.js"
import { createTestimonialValidator, updateTestimonialValidator } from "../validators/testimonial.validator.js"
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.js"

const router = Router()

const avatarUpload = upload.fields([{ name: "avatar", maxCount: 1 }])

// Public Route (Used by Frontend Redux Thunk)
router.get("/", getAllTestimonials)

// Protected Admin Routes
router.use(protect)

router.get("/:id", getTestimonialById)
router.post("/", avatarUpload, createTestimonialValidator, validateRequest, createTestimonial)
router.put("/:id", avatarUpload, updateTestimonialValidator, validateRequest, updateTestimonial)
router.delete("/:id", deleteTestimonial)

export default router