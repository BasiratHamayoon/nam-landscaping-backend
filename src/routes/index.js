import { Router } from "express"
import authRoutes from "./auth.routes.js"
import serviceRoutes from "./service.routes.js"
import projectRoutes from "./project.routes.js"
import galleryRoutes from "./gallery.routes.js"
import testimonialRoutes from "./testimonial.routes.js"
import contactRoutes from "./contact.routes.js"
import settingsRoutes from "./settings.routes.js" // <-- ADD THIS

const router = Router()

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NAM Landscaping API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

router.use("/auth", authRoutes)
router.use("/services", serviceRoutes)
router.use("/projects", projectRoutes)
router.use("/gallery", galleryRoutes)
router.use("/testimonials", testimonialRoutes)
router.use("/contacts", contactRoutes)
router.use("/settings", settingsRoutes) // <-- ADD THIS

export default router