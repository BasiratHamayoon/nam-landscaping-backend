import mongoose from "mongoose"
import slugify from "slugify"

const galleryItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    caption: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false }, // For bento grid large tiles
  },
  { _id: false }
)

const statSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
)

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    client: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    completionDate: { type: Date },
    category: {
      type: String,
      enum: ["Residential", "Commercial", "Public Space", "Hospitality"],
      default: "Residential",
    },
    serviceType: { type: String, required: true }, // e.g., "Landscape & Pool Design"

    shortDescription: { type: String, required: true, maxlength: 300 },
    description: { type: String, required: true }, // Full overview

    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    gallery: [galleryItemSchema],

    stats: [statSchema],

    challenge: {
      description: { type: String, default: "" },
      points: [{ type: String }],
    },
    solution: {
      description: { type: String, default: "" },
      points: [{ type: String }],
    },

    testimonial: {
      quote: { type: String, default: "" },
      author: { type: String, default: "" },
      role: { type: String, default: "" },
      rating: { type: Number, min: 1, max: 5, default: 5 },
    },

    tags: [{ type: String, trim: true }],

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

projectSchema.pre("validate", function (next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
  next()
})

projectSchema.index({ title: "text", client: "text", location: "text", tags: "text" })

export const Project = mongoose.model("Project", projectSchema)