import nodemailer from "nodemailer"
import { env } from "./env.js"

export const transporter = nodemailer.createTransport({
  host: env.EMAIL.HOST,
  port: env.EMAIL.PORT,
  secure: env.EMAIL.PORT === 465,
  auth: {
    user: env.EMAIL.USER,
    pass: env.EMAIL.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

export const verifyMailer = async () => {
  try {
    await transporter.verify()
    console.log("✅ Email service ready")
  } catch (error) {
    console.error(`⚠️ Email service error: ${error.message}`)
  }
}