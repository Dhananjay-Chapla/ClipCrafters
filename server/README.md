🎬 ClipCrafters Backend Server
REST API for AI-Powered Video Editing Platform
Express.js backend providing authentication, project management, and AI service integration

Node.js Express.js MongoDB JWT License: MIT

Main Docs · API Docs · Frontend Docs · AI Service Docs

Table of Contents
Overview
Tech Stack
Project Structure
Environment Setup
API Endpoints
Database Models
Authentication
Middleware
Services
Testing
Deployment
1. Overview
The ClipCrafters backend server is a RESTful API built with Express.js that serves as the application tier for the video editing platform. It handles user authentication, project management, scene orchestration, and integrates with AI services for content generation.

Key Responsibilities
User Management: Registration, authentication, profile management
Project Management: CRUD operations for video projects
Scene Management: Handling video scenes and editing operations
AI Integration: Communication with AI services for content generation
File Management: Upload/download handling via Cloudinary
Security: JWT authentication, rate limiting, input validation
Architecture
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Express API    │    │   AI Services   │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Database)    │
                       └─────────────────┘
2. Tech Stack
Category	Technologies
Runtime	Node.js 18+
Framework	Express.js 4.18
Database	MongoDB Atlas, Mongoose ODM
Authentication	JWT, bcrypt
File Storage	Cloudinary
Email/SMS	Resend, Twilio
Validation	express-validator
Security	Helmet, CORS, Rate Limiting
Logging	Winston, Morgan
Development	Nodemon, ESLint
3. Project Structure
server/
├── package.json          # Dependencies and scripts
├── server.js            # Application entry point
├── test-apis.mjs        # API testing utilities
├── src/
│   ├── app.js           # Express app configuration
│   ├── index.js         # Database connection
│   ├── config/          # Configuration files
│   │   ├── cloudinary.js
│   │   ├── database.js
│   │   ├── db.js
│   │   └── env.js
│   ├── constants/       # Application constants
│   │   └── roles.js
│   ├── controllers/     # Route handlers
│   │   ├── auth.controller.js
│   │   ├── edit.controller.js
│   │   ├── project.controller.js
│   │   ├── scene.controller.js
│   │   └── video.controller.js
│   ├── middlewares/     # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── upload.middleware.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Scene.js
│   │   ├── Video.js
│   │   └── ...
│   ├── routes/          # API route definitions
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── scene.routes.js
│   │   └── ...
│   ├── services/        # Business logic
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   ├── ai.service.js
│   │   └── notification/
│   ├── utils/           # Utility functions
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── logger.js
│   │   └── token.js
│   └── validators/      # Input validation
│       ├── auth.validator.js
│       └── project.validator.js
└── uploads/             # Temporary file storage
4. Environment Setup
Prerequisites
Node.js 18+
MongoDB Atlas account
Cloudinary account
Resend/Twilio accounts (for notifications)
Installation
Clone and navigate:

cd server
Install dependencies:

npm install
Environment configuration:

cp .env.example .env
# Edit .env with your configuration
Start development server:

npm run dev
Start production server:

npm start
Environment Variables
Variable	Description	Required
PORT	Server port	No (default: 5001)
MONGODB_URI	MongoDB connection string	Yes
JWT_SECRET	JWT signing secret	Yes
CLOUDINARY_*	Cloudinary credentials	Yes
RESEND_API_KEY	Email service key	Yes
TWILIO_*	SMS service credentials	Yes
5. API Endpoints
Authentication Routes (/api/auth)
Method	Endpoint	Description
POST	/register	User registration
POST	/login	User login
POST	/refresh	Refresh access token
POST	/logout	User logout
POST	/verify-email	Email verification
Project Routes (/api/projects)
Method	Endpoint	Description
GET	/	Get user projects
POST	/	Create new project
GET	/:id	Get project details
PUT	/:id	Update project
DELETE	/:id	Delete project
Scene Routes (/api/scenes)
Method	Endpoint	Description
GET	/project/:projectId	Get project scenes
POST	/	Create new scene
PUT	/:id	Update scene
DELETE	/:id	Delete scene
Video Routes (/api/videos)
Method	Endpoint	Description
POST	/upload	Upload video file
GET	/:id	Get video details
POST	/:id/process	Process video
Edit Routes (/api/edit)
Method	Endpoint	Description
POST	/generate-script	Generate AI script
POST	/generate-scenes	Generate scene visuals
POST	/stitch-video	Combine scenes into video
6. Database Models
User Model
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (enum),
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Project Model
{
  _id: ObjectId,
  title: String,
  description: String,
  userId: ObjectId (ref: User),
  scenes: [ObjectId] (ref: Scene),
  status: String (enum),
  createdAt: Date,
  updatedAt: Date
}
Scene Model
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  prompt: String,
  duration: Number,
  order: Number,
  mediaUrl: String,
  createdAt: Date
}
7. Authentication
The API uses JWT (JSON Web Tokens) for authentication:

Access Token: Short-lived (15min), used for API requests
Refresh Token: Long-lived (7 days), used to renew access tokens
Bearer Token: Include in Authorization header: Bearer <token>
Authentication Flow
User logs in → receives access + refresh tokens
Client stores tokens (localStorage/cookies)
API requests include access token in headers
On expiration, use refresh token to get new access token
On logout, invalidate refresh token
8. Middleware
Custom Middleware
auth.middleware.js: JWT verification, user extraction
error.middleware.js: Global error handling
rateLimit.middleware.js: API rate limiting
upload.middleware.js: File upload handling (multer + Cloudinary)
Security Middleware
Helmet: Security headers
CORS: Cross-origin resource sharing
Morgan: HTTP request logging
Compression: Response compression
9. Services
Core Services
auth.service.js: Authentication logic, token management
project.service.js: Project CRUD operations
scene.service.js: Scene management
video.service.js: Video processing
ai.service.js: AI service integration
Notification Services
email.service.js: Email sending via Resend
sms.service.js: SMS sending via Twilio
otp.service.js: OTP generation and verification
10. Testing
Running Tests
# Run API tests
npm test

# Run with coverage
npm run test:coverage
Test Structure
tests/
├── unit/           # Unit tests
├── integration/    # API integration tests
└── e2e/           # End-to-end tests
11. Deployment
Production Checklist
 Environment variables configured
 Database connection tested
 Cloudinary credentials verified
 SSL certificates installed
 Rate limiting configured
 Logging enabled
 Monitoring setup
Docker Deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
Contributing
Follow the main contribution guidelines
Use ESLint for code linting
Write tests for new features
Update API documentation
License
This project is licensed under the MIT License - see the LICENSE file for details.