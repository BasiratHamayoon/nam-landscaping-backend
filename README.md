# NAM Landscaping Backend API

Secure, production-ready backend for the NAM Landscaping admin panel.

## Tech Stack
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication + Bcrypt
- Cloudinary (image uploads)
- Nodemailer (Gmail SMTP)
- Helmet, CORS, Rate Limiting, XSS/NoSQL sanitization

## Quick Start

```bash
npm install
cp .env.example .env
# Fill in your .env values
npm run dev