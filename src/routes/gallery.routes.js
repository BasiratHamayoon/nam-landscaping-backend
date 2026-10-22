import { Router } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"
import {
  uploadGalleryImages,
  getGalleryImages,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGallery,
} from "../controllers/gallery.controller.js"

const router = Router()

// Public Route
router.get("/", getGalleryImages)

// Protected Admin Routes
router.use(protect)

router.post("/", upload.fields([{ name: "images", maxCount: 10 }]), uploadGalleryImages)
router.patch("/reorder", reorderGallery) // Call this when drag-and-drop sorting finishes
router.put("/:id", updateGalleryItem)
router.delete("/:id", deleteGalleryItem)

export default router