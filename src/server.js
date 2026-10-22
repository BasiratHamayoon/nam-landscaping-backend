import app from "./app.js"
import { connectDB } from "./config/db.js"
import { env } from "./config/env.js"
import { verifyMailer } from "./config/mailer.js"

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err)
  process.exit(1)
})

const startServer = async () => {
  await connectDB()
  await verifyMailer()

  const server = app.listen(env.PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════╗
    ║  🌿  NAM Landscaping Backend                 ║
    ║  🚀  Server running on port ${env.PORT}            ║
    ║  🌍  Environment: ${env.NODE_ENV.padEnd(27)}║
    ║  🔗  http://localhost:${env.PORT}/api/v1/health    ║
    ╚══════════════════════════════════════════════╝
    `)
  })

  process.on("unhandledRejection", (err) => {
    console.error("❌ UNHANDLED REJECTION:", err)
    server.close(() => process.exit(1))
  })

  process.on("SIGTERM", () => {
    console.log("👋 SIGTERM received. Shutting down gracefully...")
    server.close(() => process.exit(0))
  })
}

startServer()