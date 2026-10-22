import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Project } from "../models/Project.model.js"
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

export const createProject = asyncHandler(async (req, res) => {
  const { title, client, location, completionDate, category, serviceType, shortDescription, description, isFeatured, isActive, order } = req.body

  const existing = await Project.findOne({ title })
  if (existing) throw new ApiError(409, "A project with this title already exists")

  const projectData = {
    title, client, location, category, serviceType, shortDescription, description,
    completionDate: completionDate ? new Date(completionDate) : undefined,
    isFeatured: isFeatured === "true" || isFeatured === true,
    isActive: isActive !== "false",
    order: Number(order) || 0,
    stats: parseJsonField(req.body.stats) || [],
    challenge: parseJsonField(req.body.challenge) || {},
    solution: parseJsonField(req.body.solution) || {},
    testimonial: parseJsonField(req.body.testimonial) || {},
    tags: parseJsonField(req.body.tags) || [],
    seo: parseJsonField(req.body.seo) || {},
    createdBy: req.admin._id,
  }

  if (req.files?.coverImage?.[0]) {
    const uploaded = await uploadToCloudinary(req.files.coverImage[0].buffer, "nam-landscaping/projects/covers")
    projectData.coverImage = uploaded
  }

  if (req.files?.gallery?.length) {
    const uploads = await Promise.all(
      req.files.gallery.map((file) => uploadToCloudinary(file.buffer, "nam-landscaping/projects/gallery"))
    )
    projectData.gallery = uploads
  }

  const project = await Project.create(projectData)
  res.status(201).json(new ApiResponse(201, project, "Project created successfully"))
})

export const getAllProjects = asyncHandler(async (req, res) => {
  const { category, featured, active, search, page = 1, limit = 20 } = req.query
  const filter = {}

  if (category) filter.category = category
  if (featured !== undefined) filter.isFeatured = featured === "true"
  if (active !== undefined) filter.isActive = active === "true"
  if (search) filter.$text = { $search: search }

  const skip = (Number(page) - 1) * Number(limit)

  const [projects, total] = await Promise.all([
    Project.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
    Project.countDocuments(filter),
  ])

  res.status(200).json(
    new ApiResponse(200, {
      projects,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    }, "Projects fetched successfully")
  )
})

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, isActive: true })
  if (!project) throw new ApiError(404, "Project not found")
  res.status(200).json(new ApiResponse(200, project, "Project fetched"))
})

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) throw new ApiError(404, "Project not found")
  res.status(200).json(new ApiResponse(200, project, "Project fetched"))
})

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) throw new ApiError(404, "Project not found")

  const updates = {}
  const simpleFields = ["title", "client", "location", "category", "serviceType", "shortDescription", "description", "order"]
  simpleFields.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  })

  if (req.body.completionDate) updates.completionDate = new Date(req.body.completionDate)
  if (req.body.isFeatured !== undefined) updates.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true
  if (req.body.isActive !== undefined) updates.isActive = req.body.isActive !== "false"

  const jsonFields = ["stats", "challenge", "solution", "testimonial", "tags", "seo"]
  jsonFields.forEach((key) => {
    const parsed = parseJsonField(req.body[key])
    if (parsed !== undefined) updates[key] = parsed
  })

  if (req.files?.coverImage?.[0]) {
    if (project.coverImage?.publicId) await deleteFromCloudinary(project.coverImage.publicId)
    updates.coverImage = await uploadToCloudinary(req.files.coverImage[0].buffer, "nam-landscaping/projects/covers")
  }

  if (req.files?.gallery?.length) {
    const uploads = await Promise.all(
      req.files.gallery.map((file) => uploadToCloudinary(file.buffer, "nam-landscaping/projects/gallery"))
    )
    updates.gallery = [...project.gallery, ...uploads]
  }

  Object.assign(project, updates)
  if (updates.title) project.slug = undefined
  await project.save()

  res.status(200).json(new ApiResponse(200, project, "Project updated successfully"))
})

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const { id, publicId } = req.params
  const project = await Project.findById(id)
  if (!project) throw new ApiError(404, "Project not found")

  const decodedPublicId = decodeURIComponent(publicId)
  const imageIndex = project.gallery.findIndex((img) => img.publicId === decodedPublicId)
  if (imageIndex === -1) throw new ApiError(404, "Gallery image not found")

  await deleteFromCloudinary(decodedPublicId)
  project.gallery.splice(imageIndex, 1)
  await project.save()

  res.status(200).json(new ApiResponse(200, project, "Gallery image removed"))
})

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) throw new ApiError(404, "Project not found")

  const deletions = []
  if (project.coverImage?.publicId) deletions.push(deleteFromCloudinary(project.coverImage.publicId))
  project.gallery.forEach((img) => deletions.push(deleteFromCloudinary(img.publicId)))
  await Promise.all(deletions)

  await project.deleteOne()
  res.status(200).json(new ApiResponse(200, {}, "Project deleted successfully"))
})

export const toggleProjectStatus = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) throw new ApiError(404, "Project not found")

  project.isActive = !project.isActive
  await project.save()
  res.status(200).json(new ApiResponse(200, project, `Project ${project.isActive ? "activated" : "deactivated"}`))
})