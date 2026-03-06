<div align="center">

# 🎬 ClipCrafters

### AI-Powered Agentic Video Editing Platform

**Generate, Edit & Publish stunning videos from plain text in minutes**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Frontend Docs](./client/README.md) · [Backend Docs](./server/README.md) · [API Docs](http://localhost:5001/api/docs) · [Live Demo](#) · [AI Service Docs](./ai-service/README.md)

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Application Workflow](#4-application-workflow)
5. [Tech Stack Explanation](#5-tech-stack-explanation)
6. [Environment Setup](#6-environment-setup)
7. [API Documentation](#7-api-documentation)
8. [Database Design](#8-database-design)
9. [Security Architecture](#9-security-architecture)
10. [DevOps & Deployment](#10-devops--deployment)
11. [Testing Strategy](#11-testing-strategy)
12. [Coding Standards](#12-coding-standards)
13. [Contribution Guidelines](#13-contribution-guidelines)
14. [Roadmap](#14-roadmap)
15. [Known Issues & Limitations](#15-known-issues--limitations)
16. [FAQ](#16-faq)
17. [License](#17-license)
18. [Maintainers](#18-maintainers)
19. [Appendix](#19-appendix)

---

## 1. Project Overview

### Executive Summary

ClipCrafters is a **production-grade, full-stack AI-powered video editing platform** that transforms plain text descriptions into professional videos. It leverages cutting-edge AI technologies to automate the entire video creation pipeline, from script generation to final rendering and delivery.

### Business Problem

Traditional video creation is time-consuming and requires specialized skills:

| Problem | Impact |
|---|---|
| Manual script writing | Time-intensive, requires writing expertise |
| Complex editing software | Steep learning curve, expensive tools |
| Visual content sourcing | Copyright issues, inconsistent quality |
| Voiceover production | Professional narration costs, scheduling delays |
| Multi-format delivery | Manual conversion for different platforms |

### Solution Approach

ClipCrafters provides an **AI-first, automated** solution with:

- **LLM-powered script generation** (GPT-4, Claude, or local models)
- **Scene-based video composition** with AI-generated visuals
- **Text-to-speech voiceover** with natural intonation
- **Automated video stitching** and post-processing
- **Cloud-based rendering** for scalability
- **Multi-platform publishing** with format optimization

### Key Features

| Module | Features |
|---|---|
| 🎭 **Script Generation** | AI-powered script creation from topics, tone adjustment, length control |
| 🎬 **Scene Management** | Visual prompt generation, scene sequencing, timing control |
| 🎤 **Voiceover** | Multiple AI voices, language support, emotion control |
| 🎨 **Visual Generation** | AI image/video generation, style consistency, resolution options |
| ✂️ **Video Editing** | Automated stitching, transitions, background music, text overlays |
| ☁️ **Cloud Storage** | Secure file storage, CDN delivery, access control |
| 📊 **Analytics** | Usage tracking, performance metrics, user engagement |
| 🔐 **Auth** | JWT authentication, user management, API rate limiting |

### High-Level Architecture

ClipCrafters follows a **microservices architecture**:

```
┌────────────────────────────────────────────────────────────────┐
│  PRESENTATION TIER  │  React 18 SPA · Vite · Tailwind CSS     │
│  (Browser Client)   │  Axios · Framer Motion · React Router    │
├────────────────────────────────────────────────────────────────┤
│  APPLICATION TIER   │  Express.js · Node.js · Mongoose ODM    │
│  (REST API)         │  JWT · Bcrypt · Cloudinary · Resend     │
├────────────────────────────────────────────────────────────────┤
│  AI SERVICES TIER   │  FastAPI · Python · LangChain · OpenAI  │
│  (ML Pipeline)      │  ElevenLabs TTS · Replicate/StabilityAI │
├────────────────────────────────────────────────────────────────┤
│  DATA TIER          │  MongoDB Atlas · Cloudinary CDN         │
│  (Persistence)      │  Redis (caching) · File Storage         │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

### Logical Architecture

```mermaid
graph TB
    subgraph Client["Browser Client"]
        UI[React 18 SPA]
        Router[React Router]
        Context[Auth + Theme Context]
        ApiClient[Axios API Client]
    end

    subgraph Gateway["API Gateway Layer"]
        Helmet[Helmet Security Headers]
        CORS[CORS Policy]
        RateLimit[Rate Limiter]
        Logger[Morgan Logger]
    end

    subgraph API["Business Modules - Express.js"]
        Auth["/api/auth"]
        Projects["/api/projects"]
        Videos["/api/videos"]
        Scenes["/api/scenes"]
        Edits["/api/edits"]
        Analytics["/api/analytics"]
    end

    subgraph Services["Service Layer"]
        AuthSvc[Auth Service]
        AiSvc[AI Generation Service]
        VideoSvc[Video Processing Service]
        CloudSvc[Cloud Storage Service]
        EmailSvc[Notification Service]
    end

    subgraph AI["AI Services - FastAPI"]
        ScriptGen[Script Generation]
        VoiceGen[Voiceover Generation]
        VisualGen[Visual Generation]
        VideoRender[Video Rendering]
    end

    subgraph Data["Data Layer"]
        Mongoose[Mongoose ODM]
        Mongo[(MongoDB Atlas)]
    end

    UI --> Gateway
    Gateway --> API
    API --> Services
    Services --> Mongoose
    Mongoose --> Mongo
    Services --> AI
```

### Component Interactions

```mermaid
graph LR
    subgraph Frontend
        Page[Page Component]
        Hook[Custom Hook]
        ApiClient[Axios API Client]
    end

    subgraph Backend
        Router[Express Router]
        Middleware[Auth + Validation Middleware]
        Service[Service Layer]
        AiClient[AI Service Client]
    end

    subgraph AI
        ScriptSvc[Script Generation Service]
        VoiceSvc[Voiceover Service]
        VisualSvc[Visual Generation Service]
    end

    DB[(MongoDB)]

    Page --> Hook --> ApiClient
    ApiClient -->|HTTP + JWT| Router
    Router --> Middleware --> Service --> AiClient
    AiClient -->|HTTP| ScriptSvc
    AiClient -->|HTTP| VoiceSvc
    AiClient -->|HTTP| VisualSvc
    Service --> DB
```

### Deployment Architecture

```mermaid
graph TB
    subgraph DockerCompose["docker-compose.yml"]
        subgraph Frontend["client:5173"]
            ViteApp[Vite Dev Server / Nginx]
        end
        subgraph Backend["server:5001"]
            ExpressApp[Express.js App]
        end
        subgraph AIService["ai-service:8000"]
            FastAPIApp[FastAPI App]
        end
        subgraph Database["mongodb:27017"]
            MongoContainer[MongoDB]
        end
    end

    Browser[Browser] -->|HTTP :5173| ViteApp
    ViteApp -->|Proxy /api/*| ExpressApp
    ExpressApp -->|TCP :27017| MongoContainer
    ExpressApp -->|HTTP :8000| FastAPIApp
```

---

## 3. Folder Structure

```
ClipCrafters/
│
├── 📁 client/                     # React 18 frontend
│   ├── 📁 src/
│   │   ├── main.tsx               # React entry point
│   │   ├── index.css              # Global Tailwind CSS
│   │   ├── 📁 components/
│   │   │   ├── Layout.tsx         # Root shell (sidebar + outlet)
│   │   │   ├── Navbar.tsx         # Top navigation bar
│   │   │   ├── ProtectedRoute.tsx # Auth guard wrapper
│   │   │   ├── 📁 ui/             # Reusable primitive components
│   │   │   ├── 📁 forms/          # Domain-specific form components
│   │   │   ├── 📁 editor/         # Video editor components
│   │   │   └── 📁 dashboard/      # Dashboard widgets
│   │   ├── 📁 context/            # React Context providers
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 pages/              # Route-level page components
│   │   ├── 📁 services/           # Axios API wrappers
│   │   └── 📁 utils/              # Helper functions
│   ├── vite.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── 📁 server/                     # Node.js backend
│   ├── 📁 src/
│   │   ├── app.js                 # Express app factory
│   │   ├── server.js              # HTTP server entry point
│   │   ├── 📁 config/
│   │   │   ├── env.js             # Environment config
│   │   │   └── db.js              # MongoDB connection
│   │   ├── 📁 middlewares/
│   │   │   ├── auth.middleware.js # JWT verification
│   │   │   ├── error.middleware.js# Global error handler
│   │   │   ├── rateLimit.middleware.js # Rate limiting
│   │   │   └── upload.middleware.js # File upload handler
│   │   ├── 📁 controllers/
│   │   │   ├── auth.controller.js  # Auth endpoints
│   │   │   ├── project.controller.js # Project management
│   │   │   ├── video.controller.js # Video operations
│   │   │   ├── scene.controller.js # Scene management
│   │   │   └── edit.controller.js  # Edit operations
│   │   ├── 📁 models/
│   │   │   ├── User.js             # User schema
│   │   │   ├── Project.js          # Project schema
│   │   │   ├── Video.js            # Video schema
│   │   │   ├── Scene.js            # Scene schema
│   │   │   └── EditHistory.js      # Edit history
│   │   ├── 📁 routes/
│   │   │   ├── auth.routes.js      # Auth routes
│   │   │   ├── project.routes.js   # Project routes
│   │   │   ├── video.routes.js     # Video routes
│   │   │   ├── scene.routes.js     # Scene routes
│   │   │   └── edit.routes.js      # Edit routes
│   │   ├── 📁 services/
│   │   │   ├── auth.service.js     # Auth business logic
│   │   │   ├── ai.service.js       # AI service integration
│   │   │   ├── cloudinary.service.js # Cloud storage
│   │   │   ├── project.service.js  # Project operations
│   │   │   ├── video.service.js    # Video processing
│   │   │   └── notification/       # Email/SMS services
│   │   ├── 📁 utils/
│   │   │   ├── apiResponse.js      # Response formatter
│   │   │   ├── asyncHandler.js     # Async error wrapper
│   │   │   ├── logger.js           # Logging utility
│   │   │   └── token.js            # JWT utilities
│   │   └── 📁 validators/
│       ├── auth.validator.js       # Auth validation
│       └── project.validator.js    # Project validation
│   ├── package.json
│   └── Dockerfile
│
├── 📁 ai-service/                  # Python AI services
│   ├── 📁 src/
│   │   ├── main.py                 # FastAPI app
│   │   ├── 📁 services/
│   │   │   ├── script_generator.py # Script generation
│   │   │   ├── voice_generator.py  # TTS service
│   │   │   └── visual_generator.py # Image/video gen
│   │   └── 📁 utils/
│   ├── requirements.txt
│   └── Dockerfile
│
├── 📁 uploads/                     # Temporary file storage
├── 📁 docs/                        # Documentation
├── docker-compose.yml              # Multi-service orchestration
├── .env.example                    # Environment template
├── .gitignore
└── README.md                       # ← This file
```

---

## 4. Application Workflow

### User Journey (Happy Path)

```mermaid
sequenceDiagram
    actor User
    participant Browser as React SPA
    participant API as Express API
    participant AI as FastAPI AI Service
    participant DB as MongoDB

    User->>Browser: Open ClipCrafters / Login
    Browser->>API: POST /api/auth/login
    API->>DB: Find user by email
    DB-->>API: User document
    API->>API: bcrypt.compare(password)
    API-->>Browser: { accessToken, user }

    User->>Browser: Create new Project
    Browser->>API: POST /api/projects
    API->>API: authenticate() — verify JWT
    API->>DB: INSERT project
    API-->>Browser: { project: { id, title } }

    User->>Browser: Generate Video from Text
    Browser->>API: POST /api/videos/generate
    API->>AI: POST /generate-script (topic)
    AI-->>API: { script, scenes[] }
    API->>DB: INSERT video, scenes
    API->>AI: POST /generate-voiceover (scenes)
    AI-->>API: Voiceover URLs
    API->>AI: POST /generate-visuals (scenes)
    AI-->>API: Visual URLs
    API->>AI: POST /render-video (scenes, assets)
    AI-->>API: Final video URL
    API->>DB: UPDATE video status=COMPLETED
    API-->>Browser: { video: { id, url } }
    Browser-->>User: Video ready for download
```

### Video Generation Flow

```mermaid
flowchart TD
    A[User inputs topic/description] --> B{Validate input}
    B -->|Invalid| C[Return validation error]
    B -->|Valid| D[Generate script via LLM]
    D --> E[Parse script into scenes]
    E --> F[Generate voiceover for each scene]
    F --> G[Generate visuals for each scene]
    G --> H[Render video clips]
    H --> I[Stitch clips with transitions]
    I --> J[Add background music]
    J --> K[Upload to cloud storage]
    K --> L[Update video status]
    L --> M[Send completion notification]
```

---

## 5. Tech Stack Explanation

### Frontend

| Technology | Version | Why Chosen | Alternatives |
|---|---|---|---|
| **React** | 18 | Latest features, concurrent rendering, large ecosystem | Vue 3, Svelte |
| **Vite** | 4.x | Lightning-fast HMR, ES modules, optimized builds | Create React App, Webpack |
| **Tailwind CSS** | 3.x | Utility-first, fast iteration, consistent design | CSS Modules, Styled Components |
| **Framer Motion** | 10.x | Declarative animations, performance optimized | CSS animations, GSAP |
| **React Router** | 6.x | Official routing solution for React | TanStack Router |
| **Axios** | 1.x | HTTP client with interceptors, better than fetch | Fetch API, SWR |
| **Lucide React** | Latest | Beautiful icons, tree-shakable | Heroicons, React Icons |

### Backend

| Technology | Version | Why Chosen | Alternatives |
|---|---|---|---|
| **Node.js** | 18 LTS | Stable LTS, good performance, npm ecosystem | Deno, Bun |
| **Express.js** | 4.x | Minimal, flexible, middleware ecosystem | Fastify, Koa |
| **MongoDB** | Atlas | Flexible schema, cloud-native, easy scaling | PostgreSQL, MySQL |
| **Mongoose** | 7.x | ODM for MongoDB, schema validation, middleware | Native MongoDB driver |
| **JWT** | 9.x | Stateless authentication, industry standard | Session-based auth |
| **Bcrypt** | 5.x | Secure password hashing | Argon2, Scrypt |
| **Cloudinary** | Latest | Media management, CDN, transformations | AWS S3, Firebase Storage |

### AI Services

| Technology | Why Chosen | Alternatives |
|---|---|---|
| **FastAPI** | Async support, auto docs, type safety | Flask, Django REST |
| **LangChain** | LLM orchestration, prompt management | Custom OpenAI wrapper |
| **OpenAI API** | GPT-4 access, reliable, high quality | Claude, Local models |
| **ElevenLabs** | Natural TTS, multiple voices | Google TTS, Azure Speech |
| **Replicate** | AI model hosting, various models | Hugging Face, Custom GPU |

### DevOps

| Technology | Why Chosen |
|---|---|
| **Docker** | Containerization, consistent environments | Podman, LXC |
| **Docker Compose** | Multi-service orchestration | Kubernetes (overkill for dev) |
| **Nodemon** | Auto-restart on file changes | PM2, Forever |

---

## 6. Environment Setup

### Prerequisites

| Tool | Minimum Version | Install |
|---|---|---|
| Node.js | 18 LTS | [nodejs.org](https://nodejs.org) |
| Python | 3.9+ | [python.org](https://python.org) |
| MongoDB | Atlas account | [mongodb.com/atlas](https://mongodb.com/atlas) |
| Docker | 20+ | [docker.com](https://docker.com) |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

### Clone the Repository

```bash
git clone https://github.com/<your-org>/ClipCrafters.git
cd ClipCrafters
```

### Environment Variables

Copy the template and configure all values:

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# ── Database ─────────────────────────────────────────
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clipcrafters

# ── Backend ──────────────────────────────────────────
PORT=5001
NODE_ENV=development
JWT_SECRET=your-minimum-32-char-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ── AI Services ──────────────────────────────────────
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=sk-your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
REPLICATE_API_TOKEN=your-replicate-token

# ── Cloud Storage ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ── Email ────────────────────────────────────────────
RESEND_API_KEY=your-resend-key
FROM_EMAIL=noreply@clipcrafters.com
```

> **⚠️ Security:** Never commit `.env` to version control. The `.gitignore` excludes it by default. Use environment-specific configs for production.

### Option 1: Docker (Recommended)

```bash
# Start all services (MongoDB, Backend, Frontend, AI Service)
docker compose up --build

# Stop all services
docker compose down

# Wipe volumes (full reset)
docker compose down -v
```

Services will be available at:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| AI Service | http://localhost:8000 |
| API Docs | http://localhost:5001/api/docs |

### Option 2: Local Development

**Step 1 — Start MongoDB**
```bash
# Using Docker
docker run -d --name clipcrafters-db \
  -p 27017:27017 \
  mongo:latest
```

**Step 2 — Backend**
```bash
cd server
npm install
npm run dev                  # Start on :5001
```

**Step 3 — AI Service**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Step 4 — Frontend**
```bash
cd client
npm install
npm run dev                  # Start on :5173
```

### Production Build

```bash
# Backend
cd server && npm run build && npm start

# Frontend
cd client && npm run build
# Serve ./dist with nginx or any static host

# AI Service
cd ai-service && uvicorn src.main:app --host 0.0.0.0 --port 8000
```

---

## 7. API Documentation

Interactive docs are at **[http://localhost:5001/api/docs](http://localhost:5001/api/docs)** (Swagger UI).

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <access_token>
```

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Log in, returns JWT | — |
| `POST` | `/auth/register` | Create new user account | — |
| `POST` | `/auth/forgot-password` | Send reset email | — |
| `POST` | `/auth/reset-password` | Reset with token | — |

**POST /auth/login — Request**
```json
{ "email": "user@clipcrafters.com", "password": "Secure@123" }
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "1", "email": "user@clipcrafters.com" }
  }
}
```

### Projects

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/projects` | List user projects | Required |
| `POST` | `/projects` | Create new project | Required |
| `GET` | `/projects/:id` | Get project details | Required |
| `PUT` | `/projects/:id` | Update project | Required |
| `DELETE` | `/projects/:id` | Delete project | Required |

### Videos

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/videos` | List project videos | Required |
| `POST` | `/videos/generate` | Generate video from text | Required |
| `GET` | `/videos/:id` | Get video details | Required |
| `DELETE` | `/videos/:id` | Delete video | Required |
| `GET` | `/videos/:id/download` | Download video | Required |

### Scenes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/scenes` | List video scenes | Required |
| `POST` | `/scenes` | Create scene | Required |
| `PUT` | `/scenes/:id` | Update scene | Required |
| `DELETE` | `/scenes/:id` | Delete scene | Required |

### Error Response Format

All errors follow a consistent envelope:

```json
{
  "success": false,
  "message": "Video generation failed",
  "errors": [
    { "field": "topic", "message": "Topic is required" }
  ]
}
```

| HTTP Code | Meaning |
|---|---|
| `400` | Validation error |
| `401` | Missing or invalid JWT |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 8. Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    users {
        ObjectId id PK
        string email UK
        string password_hash
        string fullName
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    projects {
        ObjectId id PK
        ObjectId userId FK
        string title
        string description
        string status
        timestamp createdAt
        timestamp updatedAt
    }
    videos {
        ObjectId id PK
        ObjectId projectId FK
        string title
        string status
        string videoUrl
        number duration
        timestamp createdAt
        timestamp updatedAt
    }
    scenes {
        ObjectId id PK
        ObjectId videoId FK
        number sequence
        string script
        string visualPrompt
        string voiceoverUrl
        string visualUrl
        number duration
        timestamp createdAt
        timestamp updatedAt
    }
    edit_history {
        ObjectId id PK
        ObjectId videoId FK
        ObjectId userId FK
        string action
        json changes
        timestamp createdAt
    }
    otp {
        ObjectId id PK
        string email
        string otp
        timestamp expiresAt
        timestamp createdAt
    }
    refresh_tokens {
        ObjectId id PK
        ObjectId userId FK
        string token
        timestamp expiresAt
        timestamp createdAt
    }
    ai_generations {
        ObjectId id PK
        ObjectId userId FK
        string type
        json input
        json output
        timestamp createdAt
    }
    audit_logs {
        ObjectId id PK
        ObjectId userId FK
        string entity
        string action
        json oldValues
        json newValues
        timestamp createdAt
    }

    users ||--o{ projects : "owns"
    projects ||--o{ videos : "contains"
    videos ||--o{ scenes : "composed of"
    videos ||--o{ edit_history : "has"
    users ||--o{ edit_history : "performs"
    users ||--o{ otp : "receives"
    users ||--o{ refresh_tokens : "has"
    users ||--o{ ai_generations : "triggers"
    users ||--o{ audit_logs : "creates"
```

---

## 9. Security Architecture

### Authentication

- **JWT (JSON Web Tokens)** are issued on login and verified on every protected request.
- Tokens are **long-lived** (`JWT_EXPIRES_IN=7d` by default) with refresh token support.
- Tokens are verified using `jsonwebtoken.verify()` with the `JWT_SECRET` environment variable.

### Authorization

Role-based access control with user ownership:
- Users can only access their own projects, videos, and scenes
- Admin role for system management (future)

### Password Security

- Passwords are hashed with **bcryptjs** (10 salt rounds).
- Plain-text passwords are **never stored** or logged.
- Password reset via OTP sent to email.

### Input Validation

Request bodies are validated using **Joi schemas** before processing. Invalid payloads return structured `400` errors.

### Rate Limiting

Global rate limiter via **express-rate-limit**:
- Window: 15 minutes
- Max requests: 100 per window per IP
- Stricter limits on AI generation endpoints.

### Security Headers

**Helmet** is applied globally, setting security headers for XSS protection, clickjacking prevention, etc.

---

## 10. DevOps & Deployment

### Docker Configuration

Multi-service setup with:
- **Frontend**: Nginx serving static files
- **Backend**: Node.js production build
- **AI Service**: Python with Gunicorn
- **Database**: MongoDB with persistent volumes

### Environment Management

- **Development**: Hot reload, debug logging
- **Production**: Optimized builds, error logging to external service
- **Staging**: Mirror of production for testing

### Monitoring

- **Health checks** on all services
- **Error logging** with Morgan
- **Performance monitoring** (future)

---

## 11. Testing Strategy

### Unit Tests

- **Backend**: Jest for service layer testing
- **Frontend**: Vitest for component testing
- **AI Service**: Pytest for ML pipeline testing

### Integration Tests

- API endpoint testing with Supertest
- Database integration tests
- AI service integration tests

### E2E Tests

- Playwright for critical user flows
- Video generation workflow testing

---

## 12. Coding Standards

### Backend (Node.js)

- **ES6+** syntax with async/await
- **Consistent error handling** with custom error classes
- **Input validation** with Joi
- **Logging** with Winston/Morgan
- **File structure** following MVC pattern

### Frontend (React)

- **Functional components** with hooks
- **TypeScript** for type safety
- **Custom hooks** for reusable logic
- **Consistent naming** (PascalCase for components)
- **Tailwind CSS** for styling

### AI Service (Python)

- **Type hints** throughout
- **Async functions** for I/O operations
- **Error handling** with custom exceptions
- **Logging** with Python logging module

---

## 13. Contribution Guidelines

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request
5. Code review and merge

### Commit Standards

- Use conventional commits
- Include issue references
- Keep commits atomic

### Code Review

- All PRs require review
- CI/CD must pass
- Tests must be included

---

## 14. Roadmap

### Phase 1 (Current)

- [x] Basic video generation from text
- [x] User authentication
- [x] Project management
- [x] Scene-based editing

### Phase 2 (Next)

- [ ] Advanced AI models integration
- [ ] Real-time collaboration
- [ ] Video templates
- [ ] Social media publishing

### Phase 3 (Future)

- [ ] Mobile app
- [ ] Enterprise features
- [ ] API marketplace
- [ ] White-label solutions

---

## 15. Known Issues & Limitations

### Current Limitations

- Video generation time: 2-5 minutes
- Maximum video length: 5 minutes
- Supported languages: English only
- AI model dependency on external APIs

### Known Issues

- Occasional AI service timeouts
- Large file upload limitations
- Browser compatibility (Chrome recommended)

---

## 16. FAQ

**Q: How long does video generation take?**
A: Typically 2-5 minutes depending on complexity.

**Q: What formats are supported?**
A: MP4 videos with 1080p resolution.

**Q: Can I edit generated videos?**
A: Yes, scene-by-scene editing is supported.

**Q: Is my data secure?**
A: All data is encrypted and stored securely.

---

## 17. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 18. Maintainers

- **Your Name** - *Lead Developer* - [your.email@example.com](mailto:your.email@example.com)

---

## 19. Appendix

### API Rate Limits

- Free tier: 5 videos/month
- Pro tier: 100 videos/month
- Enterprise: Unlimited

### Supported AI Models

- Script generation: GPT-4, Claude
- Voiceover: ElevenLabs
- Visuals: Stable Diffusion, DALL-E

### File Storage

- Videos: Cloudinary CDN
- Temporary files: Local storage (cleaned up)
- User uploads: Cloud storage with access control
