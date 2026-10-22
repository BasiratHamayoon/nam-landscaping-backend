import mongoose from "mongoose"
import { env } from "./env.js"

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true)

    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB error: ${err.message}`)
    })

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Reconnecting...")
    })
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`)
    process.exit(1)
  }
}