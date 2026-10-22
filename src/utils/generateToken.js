import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

export const generateTokenAndSetCookie = (res, adminId) => {
  const token = jwt.sign({ id: adminId }, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES_IN,
  })

  const cookieOptions = {
    expires: new Date(Date.now() + env.JWT.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  }

  res.cookie("token", token, cookieOptions)

  return token
}