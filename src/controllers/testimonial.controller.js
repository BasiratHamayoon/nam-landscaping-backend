import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Testimonial } from "../models/Testimonial.model.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js"

export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, role, location, projectType, content, rating, isActive, order } = req.body

  const testimonialData = {
    name,
    role,
    location,
    projectType,
    content,
    rating: Number(rating) || 5,
    isActive: isActive !== "false",
    order: Number(order) || 0,
    createdBy: req.admin._id,
  }

  // Upload avatar if provided
  if (req.files?.avatar?.[0]) {
    const uploaded = await uploadToCloudinary(req.files.avatar[0].buffer, "nam-landscaping/testimonials")
    testimonialData.avatar = uploaded
  }

  const testimonial = await Testimonial.create(testimonialData)
  res.status(201).json(new ApiResponse(201, testimonial, "Testimonial created successfully"))
})

export const getAllTestimonials = asyncHandler(async (req, res) => {
  const { active, page = 1, limit = 20 } = req.query
  const filter = {}

  // Public frontend only needs active testimonials
  if (active !== undefined) filter.isActive = active === "true"
  else if (req.admin === undefined) filter.isActive = true

  const skip = (Number(page) - 1) * Number(limit)

  const [testimonials, total] = await Promise.all([
    Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
    Testimonial.countDocuments(filter),
  ])

  res.status(200).json(
    new ApiResponse(200, {
      testimonials,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    }, "Testimonials fetched successfully")
  )
})

export const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id)
  if (!testimonial) throw new ApiError(404, "Testimonial not found")
  res.status(200).json(new ApiResponse(200, testimonial, "Testimonial fetched"))
})

export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id)
  if (!testimonial) throw new ApiError(404, "Testimonial not found")

  const updates = {}
  const fields = ["name", "role", "location", "projectType", "content", "rating", "order"]
  
  fields.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  })

  if (req.body.isActive !== undefined) {
    updates.isActive = req.body.isActive === "true" || req.body.isActive === true
  }

  // Handle avatar update
  if (req.files?.avatar?.[0]) {
    // Delete old avatar if it exists
    if (testimonial.avatar?.publicId) {
      await deleteFromCloudinary(testimonial.avatar.publicId)
    }
    // Upload new avatar
    updates.avatar = await uploadToCloudinary(req.files.avatar[0].buffer, "nam-landscaping/testimonials")
  }

  Object.assign(testimonial, updates)
  await testimonial.save()

  res.status(200).json(new ApiResponse(200, testimonial, "Testimonial updated successfully"))
})

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id)
  if (!testimonial) throw new ApiError(404, "Testimonial not found")

  if (testimonial.avatar?.publicId) {
    await deleteFromCloudinary(testimonial.avatar.publicId)
  }

  await testimonial.deleteOne()
  res.status(200).json(new ApiResponse(200, {}, "Testimonial deleted successfully"))
})