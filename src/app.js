import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import mongoSanitize from "express-mongo-sanitize"
import hpp from "hpp"

import { env } from "./config/env.js"
import { globalLimiter } from "./middlewares/rateLimit.middleware.js"
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js"
import indexRouter from "./routes/index.js"

const app = express()

// Trust proxy (Required for Vercel deployment so rate-limiters get the real IP)
app.set("trust proxy", 1)

// Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
  })
)

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or matching our whitelist
      if (!origin || env.CORS_ORIGIN.includes(origin) || env.CORS_ORIGIN.includes("*")) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
)

// Body parsers
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Optimization & Security plugins
app.use(compression())
app.use(mongoSanitize())
app.use(hpp())

// Logging (Only in development)
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Global rate limiting
app.use(globalLimiter)

// ==========================================
// Root Welcome Route (Fixes the Vercel 404)
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🌿 Welcome to NAM Landscaping API",
    healthCheck: "/api/v1/health",
    version: "1.0.0",
  })
})

// Main API Routes
app.use("/api/v1", indexRouter)

// Unmatched routes and Error Handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app