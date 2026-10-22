import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Service } from "../models/Service.model.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js"

const parseJsonField = (field) => {
  if (!field) return undefined
  if (typeof field === "object") return field
  try {
    return JSON.parse(field)
  } catch {
    return undefined
  }
}

export const createService = asyncHandler(async (req, res) => {
  const { title, shortDescription, description, category, isFeatured, isActive, order } = req.body

  const existing = await Service.findOne({ title })
  if (existing) throw new ApiError(409, "A service with this title already exists")

  const serviceData = {
    title,
    shortDescription,
    description,
    category,
    isFeatured: isFeatured === "true" || isFeatured === true,
    isActive: isActive !== "false",
    order: Number(order) || 0,
    features: parseJsonField(req.body.features) || [],
    process: parseJsonField(req.body.process) || [],
    tags: parseJsonField(req.body.tags) || [],
    pricing: parseJsonField(req.body.pricing) || {},
    seo: parseJsonField(req.body.seo) || {},
    createdBy: req.admin._id,
  }

  if (req.files?.icon?.[0]) {
    const uploaded = await uploadToCloudinary(req.files.icon[0].buffer, "nam-landscaping/services/icons")
    serviceData.icon = uploaded
  }

  if (req.files?.coverImage?.[0]) {
    const uploaded = await uploadToCloudinary(req.files.coverImage[0].buffer, "nam-landscaping/services/covers")
    serviceData.coverImage = uploaded
  }

  if (req.files?.gallery?.length) {
    const uploads = await Promise.all(
      req.files.gallery.map((file) => uploadToCloudinary(file.buffer, "nam-landscaping/services/gallery"))
    )
    serviceData.gallery = uploads
  }

  const service = await Service.create(serviceData)
  res.status(201).json(new ApiResponse(201, service, "Service created successfully"))
})

export const getAllServices = asyncHandler(async (req, res) => {
  const { category, featured, active, search, page = 1, limit = 20 } = req.query
  const filter = {}

  if (category) filter.category = category
  if (featured !== undefined) filter.isFeatured = featured === "true"
  if (active !== undefined) filter.isActive = active === "true"
  if (search) filter.$text = { $search: search }

  const skip = (Number(page) - 1) * Number(limit)

  const [services, total] = await Promise.all([
    Service.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
    Service.countDocuments(filter),
  ])

  res.status(200).json(
    new ApiResponse(200, {
      services,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    }, "Services fetched successfully")
  )
})

export const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, isActive: true })
  if (!service) throw new ApiError(404, "Service not found")
  res.status(200).json(new ApiResponse(200, service, "Service fetched"))
})

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) throw new ApiError(404, "Service not found")
  res.status(200).json(new ApiResponse(200, service, "Service fetched"))
})

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) throw new ApiError(404, "Service not found")

  const updates = {}
  const simpleFields = ["title", "shortDescription", "description", "category", "order"]
  simpleFields.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  })

  if (req.body.isFeatured !== undefined) updates.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true
  if (req.body.isActive !== undefined) updates.isActive = req.body.isActive !== "false"

  const jsonFields = ["features", "process", "tags", "pricing", "seo"]
  jsonFields.forEach((key) => {
    const parsed = parseJsonField(req.body[key])
    if (parsed !== undefined) updates[key] = parsed
  })

  if (req.files?.icon?.[0]) {
    if (service.icon?.publicId) await deleteFromCloudinary(service.icon.publicId)
    updates.icon = await uploadToCloudinary(req.files.icon[0].buffer, "nam-landscaping/services/icons")
  }

  if (req.files?.coverImage?.[0]) {
    if (service.coverImage?.publicId) await deleteFromCloudinary(service.coverImage.publicId)
    updates.coverImage = await uploadToCloudinary(req.files.coverImage[0].buffer, "nam-landscaping/services/covers")
  }

  if (req.files?.gallery?.length) {
    const uploads = await Promise.all(
      req.files.gallery.map((file) => uploadToCloudinary(file.buffer, "nam-landscaping/services/gallery"))
    )
    updates.gallery = [...service.gallery, ...uploads]
  }

  Object.assign(service, updates)
  if (updates.title) service.slug = undefined
  await service.save()

  res.status(200).json(new ApiResponse(200, service, "Service updated successfully"))
})

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const { id, publicId } = req.params
  const service = await Service.findById(id)
  if (!service) throw new ApiError(404, "Service not found")

  const decodedPublicId = decodeURIComponent(publicId)
  const imageIndex = service.gallery.findIndex((img) => img.publicId === decodedPublicId)
  if (imageIndex === -1) throw new ApiError(404, "Gallery image not found")

  await deleteFromCloudinary(decodedPublicId)
  service.gallery.splice(imageIndex, 1)
  await service.save()

  res.status(200).json(new ApiResponse(200, service, "Gallery image removed"))
})

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) throw new ApiError(404, "Service not found")

  const deletions = []
  if (service.icon?.publicId) deletions.push(deleteFromCloudinary(service.icon.publicId))
  if (service.coverImage?.publicId) deletions.push(deleteFromCloudinary(service.coverImage.publicId))
  service.gallery.forEach((img) => deletions.push(deleteFromCloudinary(img.publicId)))
  await Promise.all(deletions)

  await service.deleteOne()
  res.status(200).json(new ApiResponse(200, {}, "Service deleted successfully"))
})

export const toggleServiceStatus = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) throw new ApiError(404, "Service not found")

  service.isActive = !service.isActive
  await service.save()

  res.status(200).json(new ApiResponse(200, service, `Service ${service.isActive ? "activated" : "deactivated"}`))
})