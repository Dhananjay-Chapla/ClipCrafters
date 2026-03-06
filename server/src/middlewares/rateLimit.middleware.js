import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

/**
 * General API rate limiter — 100 req/15 min per IP
 * Skipped in development mode so local testing never hits 429.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 0 : 100,          // 0 = unlimited in dev
    skip: () => isDev,             // bypass entirely in dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
});

/**
 * Auth-specific limiter — 10 attempts per 15 min (brute-force protection)
 * Skipped in development mode so repeated test runs don't get blocked.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 0 : 10,           // 0 = unlimited in dev
    skip: () => isDev,             // bypass entirely in dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    },
});
