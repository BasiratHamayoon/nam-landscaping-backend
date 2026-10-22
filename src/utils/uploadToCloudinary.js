import cloudinary from "../config/cloudinary.js"
import ApiError from "./ApiError.js"

export const uploadToCloudinary = (fileBuffer, folder = "nam-landscaping") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        transformation: [{ quality: "auto:good", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(new ApiError(500, "Cloudinary upload failed"))
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    uploadStream.end(fileBuffer)
  })
}

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset: ${publicId}`)
  }
}