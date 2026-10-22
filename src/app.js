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

app.set("trust proxy", 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
  })
)

app.use(
  cors({
    origin: (origin, callback) => {
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

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())
app.use(compression())
app.use(mongoSanitize())
app.use(hpp())

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

app.use(globalLimiter)

app.use("/api/v1", indexRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app