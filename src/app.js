import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import mongoSanitize from "express-mongo-sanitize"
import hpp from "hpp"
import indexRouter from "./routes/index.js"
import { errorHandler } from "./middlewares/error.middleware.js"

const app = express()

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  process.env.CORS_ORIGIN,
  process.env.ADMIN_PANEL_URL,
  process.env.FRONTEND_URL,
].filter(Boolean)

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true)
    }

    return callback(null, true)
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
  ],
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
)

app.use(express.json({ limit: "20mb" }))
app.use(express.urlencoded({ extended: true, limit: "20mb" }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(hpp())

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NAM Landscaping API Running Successfully",
    healthCheck: "/api/v1/health",
    version: "1.0.0",
  })
})

app.use("/api/v1", indexRouter)

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

app.use(errorHandler)

export default app