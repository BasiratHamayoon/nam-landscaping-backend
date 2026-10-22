import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Gallery } from "../models/Gallery.model.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js"

// Upload single or multiple images to the gallery
export const uploadGalleryImages = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.images || req.files.images.length === 0) {
    throw new ApiError(400, "Please upload at least one image")
  }

  const { category, caption, colSpan, rowSpan } = req.body

  const uploadPromises = req.files.images.map(async (file) => {
    const uploaded = await uploadToCloudinary(file.buffer, "nam-landscaping/gallery")
    return {
      image: uploaded,
      category: category || "Landscaping",
      caption: caption || "",
      colSpan: Number(colSpan) || 1,
      rowSpan: Number(rowSpan) || 1,
      createdBy: req.admin._id,
    }
  })

  const galleryData = await Promise.all(uploadPromises)
  const insertedImages = await Gallery.insertMany(galleryData)

  res.status(201).json(new ApiResponse(201, insertedImages, "Images uploaded to gallery successfully"))
})

// Public: Get all active gallery images for the Bento grid
export const getGalleryImages = asyncHandler(async (req, res) => {
  const { category, active, limit = 50, page = 1 } = req.query
  const filter = {}

  if (category && category !== "All") filter.category = category
  if (active !== undefined) filter.isActive = active === "true"
  else if (req.admin === undefined) filter.isActive = true // Default for public visitors

  const skip = (Number(page) - 1) * Number(limit)

  const [images, total] = await Promise.all([
    Gallery.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
    Gallery.countDocuments(filter),
  ])

  res.status(200).json(
    new ApiResponse(200, {
      images,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    }, "Gallery images fetched successfully")
  )
})

// Update grid span, category, or caption
export const updateGalleryItem = asyncHandler(async (req, res) => {
  const { caption, category, colSpan, rowSpan, isActive, order } = req.body

  const galleryItem = await Gallery.findById(req.params.id)
  if (!galleryItem) throw new ApiError(404, "Gallery item not found")

  if (caption !== undefined) galleryItem.caption = caption
  if (category) galleryItem.category = category
  if (colSpan) galleryItem.colSpan = Number(colSpan)
  if (rowSpan) galleryItem.rowSpan = Number(rowSpan)
  if (isActive !== undefined) galleryItem.isActive = isActive === "true" || isActive === true
  if (order !== undefined) galleryItem.order = Number(order)

  await galleryItem.save()

  res.status(200).json(new ApiResponse(200, galleryItem, "Gallery item updated successfully"))
})

// Delete an image from DB and Cloudinary
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const galleryItem = await Gallery.findById(req.params.id)
  if (!galleryItem) throw new ApiError(404, "Gallery item not found")

  await deleteFromCloudinary(galleryItem.image.publicId)
  await galleryItem.deleteOne()

  res.status(200).json(new ApiResponse(200, {}, "Gallery item deleted successfully"))
})

// Bulk update order (for drag-and-drop on admin frontend)
export const reorderGallery = asyncHandler(async (req, res) => {
  const { items } = req.body // Array of { id, order }

  if (!items || !Array.isArray(items)) {
    throw new ApiError(400, "Please provide an array of items with id and order")
  }

  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { order: item.order } },
    },
  }))

  await Gallery.bulkWrite(bulkOps)

  res.status(200).json(new ApiResponse(200, {}, "Gallery reordered successfully"))
})