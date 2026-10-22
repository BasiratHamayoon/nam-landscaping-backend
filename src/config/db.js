import mongoose from "mongoose"
import { env } from "./env.js"

let isConnected = 0

export const connectDB = async () => {
  if (isConnected === 1 && mongoose.connection.readyState === 1) {
    return
  }

  try {
    mongoose.set("strictQuery", true)
    const db = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    })

    isConnected = db.connections[0].readyState
    console.log(`✅ MongoDB Connected: ${db.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`)
    throw error
  }
}