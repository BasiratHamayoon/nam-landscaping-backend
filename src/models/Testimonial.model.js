import mongoose from "mongoose"

const testimonialSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    role: { 
      type: String, 
      default: "Client", 
      trim: true 
    },
    location: { 
      type: String, 
      required: true, 
      trim: true // e.g., "Dubai, UAE"
    },
    projectType: { 
      type: String, 
      required: true, 
      trim: true // e.g., "Villa Landscaping"
    },
    content: { 
      type: String, 
      required: true, 
      trim: true // The actual quote
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5, 
      default: 5 
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    order: { 
      type: Number, 
      default: 0 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
)

export const Testimonial = mongoose.model("Testimonial", testimonialSchema)