import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * globalErrorHandler — centralized Express error handler
 * - Converts Mongoose/JWT errors to ApiError shapes
 * - Hides stack traces in production
 */
const globalErrorHandler = (err, req, res, next) => {
    let error = err;

    // ── Mongoose: CastError (bad ObjectId) ─────────────────────────────────
    if (error.name === 'CastError') {
        error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
    }

    // ── Mongoose: Duplicate key ─────────────────────────────────────────────
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        error = new ApiError(409, `Duplicate value for field: "${field}"`);
    }

    // ── Mongoose: Validation errors ─────────────────────────────────────────
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        error = new ApiError(422, 'Validation failed', messages);
    }

    // ── JWT: Invalid signature ───────────────────────────────────────────────
    if (error.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token');
    }

    // ── JWT: Expired ────────────────────────────────────────────────────────
    if (error.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);

    res.status(statusCode).json({
        success: false,
        message,
        ...(error.errors?.length && { errors: error.errors }),
        ...(env.nodeEnv !== 'production' && { stack: error.stack }),
    });
};

/**
 * notFound — catches routes that don't match any handler
 */
export const notFound = (req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default globalErrorHandler;
