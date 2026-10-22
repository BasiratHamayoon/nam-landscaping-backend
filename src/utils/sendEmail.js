import { transporter } from "../config/mailer.js"
import { env } from "../config/env.js"

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: env.EMAIL.FROM,
    to,
    subject,
    html,
  }

  await transporter.sendMail(mailOptions)
}