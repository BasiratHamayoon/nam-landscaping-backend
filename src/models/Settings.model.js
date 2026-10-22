import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    // We force this schema to only ever have one document
    singleton: {
      type: String,
      default: "NAM_SETTINGS",
      unique: true,
      immutable: true,
    },
    siteInfo: {
      siteName: { type: String, default: "NAM Landscaping" },
      footerText: { type: String, default: "Cultivating Excellence in Every Landscape." },
      logoUrl: { type: String, default: "" },
      logoPublicId: { type: String, default: "" },
    },
    contact: {
      email: { type: String, default: "info@namlandscaping.ae" },
      phonePrimary: { type: String, default: "+971 50 123 4567" },
      phoneSecondary: { type: String, default: "" },
      whatsapp: { type: String, default: "971501234567" },
      address: { type: String, default: "Dubai, United Arab Emirates" },
      workingHours: { type: String, default: "Monday - Saturday | 8:00 AM - 6:00 PM" },
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    seo: {
      defaultMetaTitle: { type: String, default: "NAM Landscaping | Luxury Landscape Design in Dubai" },
      defaultMetaDescription: { type: String, default: "Premier landscaping company in the UAE specializing in luxury garden design, hardscaping, and pool construction." },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
)

export const Settings = mongoose.model("Settings", settingsSchema)