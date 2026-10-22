import { Router } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"
import { getSettings, updateSettings } from "../controllers/settings.controller.js"

const router = Router()

// Public Route (Used by Frontend to populate Footer/Navbar)
router.get("/", getSettings)

// Protected Admin Route
router.use(protect)

router.put("/", upload.fields([{ name: "logo", maxCount: 1 }]), updateSettings)

export default router