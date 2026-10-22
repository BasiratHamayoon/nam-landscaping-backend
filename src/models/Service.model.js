import mongoose from "mongoose"
import slugify from "slugify"

const galleryItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    caption: { type: String, default: "" },
  },
  { _id: false }
)

const featureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const processStepSchema = new mongoose.Schema(
  {
    step: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 250 },
    description: { type: String, required: true, trim: true },

    icon: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    gallery: [galleryItemSchema],

    features: [featureSchema],
    process: [processStepSchema],

    category: {
      type: String,
      enum: ["Landscape Design", "Hardscaping", "Pool & Water", "Maintenance", "Lighting", "Irrigation", "Other"],
      default: "Other",
    },
    tags: [{ type: String, trim: true }],

    pricing: {
      startingPrice: { type: Number, default: 0 },
      currency: { type: String, default: "AED" },
      unit: { type: String, default: "project" },
    },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: [{ type: String }],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
)

serviceSchema.pre("validate", function (next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
  next()
})

serviceSchema.index({ title: "text", description: "text", tags: "text" })

export const Service = mongoose.model("Service", serviceSchema)