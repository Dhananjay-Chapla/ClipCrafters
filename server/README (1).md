<div align="center">

# 🎬 ClipCrafters — Backend API

### Node.js + Express REST API for AI Video Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)

[Main Docs](../README.md) · [Frontend Docs](../client/README.md) · [API Docs](http://localhost:5001/api/docs)

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Setup & Run](#setup--run)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
7. [Authentication](#authentication)
8. [Security Features](#security-features)
9. [Database Models](#database-models)
10. [Error Handling](#error-handling)
11. [Testing](#testing)

---

## Overview

The ClipCrafters backend is a RESTful API built with Node.js and Express.js. It handles:

- User authentication (JWT with access + refresh tokens)
- Project and video management
- AI service integration (FastAPI communication)
- Cloud storage (Cloudinary)
- Email notifications (Resend)
- OTP verification
- Edit history tracking

**Base URL (dev):** `http://localhost:5001/api`

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18 LTS | JavaScript runtime |
| **Express.js** | 4.x | Web framework |
| **MongoDB** | Atlas | NoSQL database |
| **Mongoose** | 7.x | MongoDB ODM |
| **JWT** | 9.x | Authentication tokens |
| **Bcrypt** | 5.x | Password hashing |
| **Cloudinary** | Latest | Media storage & CDN |
| **Resend** | Latest | Transactional emails |
| **Helmet** | Latest | Security headers |
| **Morgan** | Latest | HTTP request logging |

---

## Folder Structure

```
server/
├── server.js                   # Entry point — HTTP server
├── .env                        # Environment variables (git-ignored)
├── .env.example                # Environment template
└── src/
    ├── app.js                  # Express app factory
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   └── env.js              # Validated env config
    ├── constants/
    │   └── messages.js         # Response messages
    ├── controllers/            # HTTP request handlers
    │   ├── auth.controller.js
    │   ├── project.controller.js
    │   ├── video.controller.js
    │   ├── scene.controller.js
    │   └── edit.controller.js
    ├── middlewares/
    │   ├── auth.middleware.js      # JWT verification
    │   ├── error.middleware.js     # Global error handler
    │   ├── upload.middleware.js    # Multer file uploads
    │   └── rateLimit.middleware.js # Rate limiting
    ├── models/                 # Mongoose schemas
    │   ├── User.js
    │   ├── Project.js
    │   ├── Video.js
    │   ├── Scene.js
    │   ├── EditHistory.js
    │   ├── OTP.js
    │   ├── RefreshToken.js
    │   ├── AIGeneration.js
    │   └── AuditLog.js
    ├── routes/                 # Route definitions
    │   ├── auth.routes.js
    │   ├── project.routes.js
    │   ├── video.routes.js
    │   ├── scene.routes.js
    │   └── edit.routes.js
    ├── services/               # Business logic
    │   ├── auth.service.js
    │   ├── ai.service.js           # FastAPI integration
    │   ├── cloudinary.service.js
    │   ├── email.service.js        # Resend integration
    │   ├── otp.service.js
    │   ├── project.service.js
    │   ├── refreshToken.service.js
    │   └── video.service.js
    ├── utils/
    │   ├── asyncHandler.js         # Async error wrapper
    │   ├── apiResponse.js          # Response formatter
    │   ├── logger.js               # Winston logger
    │   └── token.js                # JWT utilities
    └── validators/             # Request validation
        ├── auth.validator.js
        └── project.validator.js
```

---

## Setup & Run

### Prerequisites

- Node.js ≥ 18 LTS
- MongoDB Atlas account
- Cloudinary account
- Resend account (for emails)

### Install Dependencies

```bash
cd server
npm install
```

### Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your credentials
```

> **Important:** Never commit `.env` to version control. It's already in `.gitignore`.

See [Environment Variables](#environment-variables) section for all required and optional variables.

### Development Server

```bash
npm run dev
```

Server starts on **http://localhost:5001**

### Production Server

```bash
npm start
```

---

## Environment Variables

Copy the example file and configure with your credentials:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your actual values:

```env
# ── Server ─────────────────────────────────
PORT=5001
NODE_ENV=development

# ── Database ───────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/clipcrafters

# ── JWT & Tokens ───────────────────────────
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
ACCESS_TOKEN_SECRET=generate_random_32_char_string
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=generate_random_32_char_string
REFRESH_TOKEN_EXPIRY=7d
VERIFICATION_TOKEN_SECRET=generate_random_32_char_string

# ── Security ───────────────────────────────
BCRYPT_SALT_ROUNDS=10
PASSWORD_EXPIRY_DAYS=30
PASSWORD_REMINDER_DAYS_BEFORE=5

# ── CORS ───────────────────────────────────
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# ── Rate Limiting ──────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ── FastAPI AI Service ──────────────────────
FASTAPI_URL=http://localhost:8000

# ── Cloudinary ─────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=clipcrafters

# ── Twilio SMS (optional) ──────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ── Resend Email ───────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_API_URL=https://api.resend.com/emails
EMAIL_FROM=ClipCrafters <no-reply@clipcrafters.app>
RESEND_VERIFIED_EMAIL=your_verified@email.com

# ── OTP ────────────────────────────────────
OTP_EXPIRY_MINUTES=5

# ── File Uploads ───────────────────────────
MAX_FILE_SIZE=10485760

# ── Third-party AI (optional) ──────────────
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=your_key
```

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/clipcrafters` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | Generate with `openssl rand -base64 32` |
| `ACCESS_TOKEN_SECRET` | Access token secret | Generate with `openssl rand -base64 32` |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | Generate with `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `RESEND_API_KEY` | Resend API key for emails | From Resend dashboard |

### Optional Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:5173` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `10` |
| `OTP_EXPIRY_MINUTES` | OTP expiration time | `5` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Generate Secure Secrets

```bash
# Generate JWT secrets (run 3 times for different secrets)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create user account |
| `POST` | `/login` | ❌ | Login, returns JWT |
| `GET` | `/me` | ✅ | Get current user profile |
| `POST` | `/send-otp` | ✅ | Send OTP to email |
| `POST` | `/verify-otp` | ✅ | Verify OTP code |
| `POST` | `/forgot-password` | ❌ | Request password reset |
| `POST` | `/reset-password` | ❌ | Reset password with token |

**Example: Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Fenil Chodvadiya",
  "email": "fenil@example.com",
  "password": "SecurePass@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Fenil Chodvadiya",
      "email": "fenil@example.com",
      "isVerified": false
    }
  }
}
```

---

### Projects — `/api/projects`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/create` | ✅ | Create new project |
| `GET` | `/` | ✅ | List user's projects |
| `GET` | `/:id` | ✅ | Get project details |
| `PUT` | `/:id` | ✅ | Update project |
| `DELETE` | `/:id` | ✅ | Delete project |

**Example: Create Project**
```bash
POST /api/projects/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Product Demo Video",
  "topic": "Explain our SaaS analytics platform",
  "style": "professional",
  "duration": 60
}
```

---

### Videos — `/api/videos`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/generate` | ✅ | Generate video from text |
| `POST` | `/upload` | ✅ | Upload video file |
| `GET` | `/:id` | ✅ | Get video details |
| `DELETE` | `/:id` | ✅ | Delete video |
| `GET` | `/:id/download` | ✅ | Download video |

**Example: Generate Video**
```bash
POST /api/videos/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "65f2b3c4d5e6f7a8b9c0d2e3"
}
```

---

### Scenes — `/api/scenes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/video/:videoId` | ✅ | Get all scenes for video |
| `PUT` | `/:sceneId` | ✅ | Update scene |
| `DELETE` | `/:sceneId` | ✅ | Delete scene |

---

### Edit History — `/api/edits`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/create` | ✅ | Log an edit action |
| `GET` | `/scene/:sceneId` | ✅ | Get scene edit history |

---

### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | ❌ | Health check |

---

## Authentication

### JWT Flow

1. User logs in with email/password
2. Server validates credentials
3. Server generates JWT access token
4. Client stores token in localStorage
5. Client includes token in `Authorization` header for protected routes

### Protected Routes

All routes except `/auth/login`, `/auth/register`, and `/health` require authentication:

```
Authorization: Bearer <JWT_TOKEN>
```

### Token Expiration

- Access tokens expire in 1 day (configurable)
- Refresh tokens expire in 7 days (configurable)
- Expired tokens return `401 Unauthorized`

---

## Security Features

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Plain-text passwords never stored or logged
- Password reset via OTP

### Rate Limiting
- Global: 100 requests / 15 minutes per IP
- Auth routes: 10 requests / 15 minutes per IP
- Prevents brute force attacks

### Security Headers
- Helmet middleware for HTTP security headers
- XSS protection
- Clickjacking prevention
- Content Security Policy

### CORS
- Configurable allowed origins
- Credentials support
- Preflight request handling

### Input Validation
- Request body validation with Joi
- SQL injection prevention
- XSS sanitization

---

## Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  isVerified: Boolean,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  topic: String,
  style: String,
  duration: Number,
  status: String (draft|processing|completed|failed),
  videoId: ObjectId (ref: Video),
  createdAt: Date,
  updatedAt: Date
}
```

### Video
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  userId: ObjectId (ref: User),
  status: String (pending|processing|completed|failed),
  cloudinaryUrl: String,
  duration: Number,
  scenes: [ObjectId] (ref: Scene),
  createdAt: Date,
  updatedAt: Date
}
```

### Scene
```javascript
{
  _id: ObjectId,
  videoId: ObjectId (ref: Video),
  order: Number,
  script: String,
  visualPrompt: String,
  audioUrl: String,
  clipUrl: String,
  status: String (pending|processing|completed|failed),
  createdAt: Date,
  updatedAt: Date
}
```

### EditHistory
```javascript
{
  _id: ObjectId,
  sceneId: ObjectId (ref: Scene),
  userId: ObjectId (ref: User),
  changeType: String,
  before: Object,
  after: Object,
  createdAt: Date
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": ["Optional array of validation errors"]
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request / validation error |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate email) |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

---

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### API Testing with curl

```bash
# Health check
curl http://localhost:5001/api/health

# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'

# Get projects (replace TOKEN)
curl http://localhost:5001/api/projects \
  -H "Authorization: Bearer TOKEN"
```

---

## Development Tips

### Hot Reload

The dev server uses nodemon for automatic restarts on file changes.

### Logging

Winston logger is configured for:
- Console output in development
- File output in production
- Error tracking

### Database Seeding

```bash
npm run seed
```

### Database Reset

```bash
npm run db:reset
```

---

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
