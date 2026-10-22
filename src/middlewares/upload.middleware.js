import multer from "multer"
import ApiError from "../utils/ApiError.js"

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(400, "Only JPG, PNG, WEBP, and SVG images are allowed"), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})