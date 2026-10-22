import dotenv from "dotenv"
dotenv.config()

const requiredVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_HOST",
  "EMAIL_USER",
  "EMAIL_PASS",
]

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`)
    process.exit(1)
  }
})

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    COOKIE_EXPIRES_IN: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7,
  },
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  EMAIL: {
    HOST: process.env.EMAIL_HOST,
    PORT: parseInt(process.env.EMAIL_PORT) || 587,
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS,
    FROM: process.env.EMAIL_FROM,
    ADMIN_NOTIFY: process.env.ADMIN_NOTIFICATION_EMAIL,
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
  ADMIN_PANEL_URL: process.env.ADMIN_PANEL_URL || "http://localhost:3001",
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
}