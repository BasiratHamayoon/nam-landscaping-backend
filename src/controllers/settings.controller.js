import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Settings } from "../models/Settings.model.js"
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

// Fetch settings (Creates default if none exist)
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ singleton: "NAM_SETTINGS" })

  if (!settings) {
    settings = await Settings.create({})
  }

  res.status(200).json(new ApiResponse(200, settings, "Settings fetched successfully"))
})

// Update global settings
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ singleton: "NAM_SETTINGS" })

  if (!settings) {
    settings = await Settings.create({})
  }

  // Parse nested fields from form-data or JSON
  const siteInfo = parseJsonField(req.body.siteInfo) || settings.siteInfo
  const contact = parseJsonField(req.body.contact) || settings.contact
  const socialLinks = parseJsonField(req.body.socialLinks) || settings.socialLinks
  const seo = parseJsonField(req.body.seo) || settings.seo

  // Handle optional logo upload
  if (req.files?.logo?.[0]) {
    if (settings.siteInfo.logoPublicId) {
      await deleteFromCloudinary(settings.siteInfo.logoPublicId)
    }
    const uploadedLogo = await uploadToCloudinary(req.files.logo[0].buffer, "nam-landscaping/settings")
    siteInfo.logoUrl = uploadedLogo.url
    siteInfo.logoPublicId = uploadedLogo.publicId
  }

  settings.siteInfo = siteInfo
  settings.contact = contact
  settings.socialLinks = socialLinks
  settings.seo = seo
  settings.updatedBy = req.admin._id

  await settings.save()

  res.status(200).json(new ApiResponse(200, settings, "Settings updated successfully"))
})