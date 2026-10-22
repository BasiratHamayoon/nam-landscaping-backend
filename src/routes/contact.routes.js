import { Router } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { contactLimiter } from "../middlewares/rateLimit.middleware.js"
import { validateRequest } from "../middlewares/validate.middleware.js"
import { submitContactValidator, updateContactStatusValidator } from "../validators/contact.validator.js"
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../controllers/contact.controller.js"

const router = Router()

// Public Route for Website Form (Includes rate limiting to stop spam)
router.post("/submit", contactLimiter, submitContactValidator, validateRequest, submitContact)

// Protected Admin Routes
router.use(protect)

router.get("/", getAllContacts)
router.get("/:id", getContactById)
router.put("/:id/status", updateContactStatusValidator, validateRequest, updateContactStatus)
router.delete("/:id", deleteContact)

export default router