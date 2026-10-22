import { Router } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"
import { validateRequest } from "../middlewares/validate.middleware.js"
import { createProjectValidator, updateProjectValidator } from "../validators/project.validator.js"
import {
  createProject,
  getAllProjects,
  getProjectBySlug,
  getProjectById,
  updateProject,
  deleteProject,
  deleteGalleryImage,
  toggleProjectStatus,
} from "../controllers/project.controller.js"

const router = Router()

const projectUploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "gallery", maxCount: 15 },
])

// Public Routes
router.get("/", getAllProjects)
router.get("/slug/:slug", getProjectBySlug)

// Protected Admin Routes
router.use(protect)

router.get("/:id", getProjectById)
router.post("/", projectUploadFields, createProjectValidator, validateRequest, createProject)
router.put("/:id", projectUploadFields, updateProjectValidator, validateRequest, updateProject)
router.patch("/:id/toggle", toggleProjectStatus)
router.delete("/:id/gallery/:publicId", deleteGalleryImage)
router.delete("/:id", deleteProject)

export default router