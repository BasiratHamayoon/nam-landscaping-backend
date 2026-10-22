import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Contact } from "../models/Contact.model.js"
import { sendEmail } from "../utils/sendEmail.js"
import { env } from "../config/env.js"
import { getAdminNotificationEmail } from "../templates/adminNotification.template.js"
import { getAutoReplyEmail } from "../templates/contactReply.template.js"

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, serviceOfInterest, message } = req.body

  const contact = await Contact.create({
    name,
    email,
    phone,
    serviceOfInterest,
    message,
  })

  // Send Emails asynchronously (don't block the response)
  Promise.all([
    // Notify Admin
    sendEmail({
      to: env.EMAIL.ADMIN_NOTIFY || env.EMAIL.USER,
      subject: `New Lead: ${serviceOfInterest || "General Inquiry"} - ${name}`,
      html: getAdminNotificationEmail(contact),
    }),
    // Auto-reply to Customer
    sendEmail({
      to: email,
      subject: "We received your inquiry - NAM Landscaping",
      html: getAutoReplyEmail(name),
    }),
  ]).catch((err) => console.error("Email sending failed:", err))

  res.status(201).json(new ApiResponse(201, {}, "Message sent successfully"))
})

export const getAllContacts = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query
  const filter = {}

  if (status && status !== "All") filter.status = status
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Contact.countDocuments(filter),
  ])

  res.status(200).json(
    new ApiResponse(200, {
      contacts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    }, "Contacts fetched successfully")
  )
})

export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
  if (!contact) throw new ApiError(404, "Contact inquiry not found")

  // Auto-mark as Read if it was Unread
  if (contact.status === "Unread") {
    contact.status = "Read"
    await contact.save()
  }

  res.status(200).json(new ApiResponse(200, contact, "Contact fetched successfully"))
})

export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body
  const contact = await Contact.findById(req.params.id)
  
  if (!contact) throw new ApiError(404, "Contact inquiry not found")

  if (status) contact.status = status
  if (notes !== undefined) contact.notes = notes

  await contact.save()

  res.status(200).json(new ApiResponse(200, contact, "Contact updated successfully"))
})

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
  if (!contact) throw new ApiError(404, "Contact inquiry not found")

  await contact.deleteOne()
  res.status(200).json(new ApiResponse(200, {}, "Contact deleted successfully"))
})