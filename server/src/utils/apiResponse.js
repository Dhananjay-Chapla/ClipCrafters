/**
 * ApiResponse — standardised JSON response shape
 * Keeps all responses consistent across the API
 */
export class ApiResponse {
    constructor(statusCode, message, data = null) {
        this.success = statusCode >= 200 && statusCode < 300;
        this.message = message;
        if (data !== null) this.data = data;
    }
}

/**
 * ApiError — custom error class that carries an HTTP status code
 * Works together with the global error middleware
 */
export class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = 'ApiError';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Convenience helpers — send standardised responses directly from controllers
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) =>
    res.status(statusCode).json(new ApiResponse(statusCode, message, data));

export const sendError = (res, statusCode = 500, message = 'Internal Server Error') =>
    res.status(statusCode).json(new ApiResponse(statusCode, message));
