import { Router } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"
import { validateRequest } from "../middlewares/validate.middleware.js"
import { createServiceValidator, updateServiceValidator } from "../validators/service.validator.js"
import {
  createService,
  getAllServices,
  getServiceBySlug,
  getServiceById,
  updateService,
  deleteService,
  deleteGalleryImage,
  toggleServiceStatus,
} from "../controllers/service.controller.js"

const router = Router()

const serviceUploadFields = upload.fields([
  { name: "icon", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
])

router.get("/", getAllServices)
router.get("/slug/:slug", getServiceBySlug)

router.use(protect)

router.get("/:id", getServiceById)
router.post("/", serviceUploadFields, createServiceValidator, validateRequest, createService)
router.put("/:id", serviceUploadFields, updateServiceValidator, validateRequest, updateService)
router.patch("/:id/toggle", toggleServiceStatus)
router.delete("/:id/gallery/:publicId", deleteGalleryImage)
router.delete("/:id", deleteService)

export default router