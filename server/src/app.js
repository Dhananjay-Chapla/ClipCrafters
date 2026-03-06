import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import globalErrorHandler, { notFound } from './middlewares/error.middleware.js';

// ─── Route Imports ─────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import videoRoutes from './routes/video.routes.js';
import sceneRoutes from './routes/scene.routes.js';
import editRoutes from './routes/edit.routes.js';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());

// Accept any localhost origin (any port) in development, production origin from env otherwise
const allowedOrigins = env.corsOrigin === '*'
    ? null   // null = wildcard mode below
    : env.corsOrigin.split(',').map((o) => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, mobile apps, Postman)
        if (!origin) return callback(null, true);
        // Dev: allow any localhost / 127.0.0.1 port
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        // Production: check against explicit allow-list
        if (allowedOrigins && allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Wildcard mode (CORS_ORIGIN not set)
        if (!allowedOrigins) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Performance Middleware ────────────────────────────────────────────────
app.use(compression());

// ─── Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ───────────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// ─── Global Rate Limiter ───────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '🎬 ClipCrafters API is running',
        version: '1.0.0',
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/scenes', sceneRoutes);
app.use('/api/edits', editRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
