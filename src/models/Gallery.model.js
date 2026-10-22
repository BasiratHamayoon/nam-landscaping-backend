import mongoose from "mongoose"

const gallerySchema = new mongoose.Schema(
  {
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    caption: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    category: {
      type: String,
      required: true,
      enum: ["Landscaping", "Hardscaping", "Pools", "Lighting", "Maintenance", "Other"],
      default: "Landscaping",
    },
    // Bento Grid settings (controls CSS grid spans on frontend)
    colSpan: { 
      type: Number, 
      enum: [1, 2], 
      default: 1 
    },
    rowSpan: { 
      type: Number, 
      enum: [1, 2], 
      default: 1 
    },
    order: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
)

export const Gallery = mongoose.model("Gallery", gallerySchema)