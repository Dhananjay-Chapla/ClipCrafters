import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * Sign a short-lived access token (1d by default).
 */
export const signAccessToken = (userId) =>
    jwt.sign({ id: userId, type: 'access', jti: randomUUID() }, env.accessTokenSecret, {
        expiresIn: env.accessTokenExpiry,
    });

/**
 * Sign a long-lived refresh token (7d by default).
 * jti ensures each token is unique even if called twice in the same millisecond.
 */
export const signRefreshToken = (userId) =>
    jwt.sign({ id: userId, type: 'refresh', jti: randomUUID() }, env.refreshTokenSecret, {
        expiresIn: env.refreshTokenExpiry,
    });

/**
 * Verify an access token. Throws ApiError if invalid or expired.
 * @returns {Object} decoded payload { id, type, iat, exp }
 */
export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, env.accessTokenSecret);
        if (decoded.type !== 'access') throw new Error('Wrong token type');
        return decoded;
    } catch (err) {
        if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Access token expired');
        throw new ApiError(401, 'Invalid access token');
    }
};

/**
 * Verify a refresh token. Throws ApiError if invalid or expired.
 * @returns {Object} decoded payload
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, env.refreshTokenSecret);
        if (decoded.type !== 'refresh') throw new Error('Wrong token type');
        return decoded;
    } catch (err) {
        if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Refresh token expired');
        throw new ApiError(401, 'Invalid refresh token');
    }
};
