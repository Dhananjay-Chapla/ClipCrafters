import RefreshToken from '../models/RefreshToken.js';
import AuditLog from '../models/AuditLog.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { ApiError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Create and persist a new refresh token for a user.
 * Old refresh tokens for the same user are NOT deleted here —
 * they either expire via TTL or are deleted on logout.
 */
export const createRefreshToken = async (userId) => {
    const token = signRefreshToken(userId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({ userId, token, expiresAt });
    return token;
};

/**
 * Rotate refresh token — verify old, delete it, issue new access + refresh pair.
 */
export const rotateRefreshToken = async (oldToken) => {
    // Verify signature first
    const decoded = verifyRefreshToken(oldToken);

    // Find in DB — prevents reuse of stolen tokens
    const stored = await RefreshToken.findOne({ token: oldToken });
    if (!stored) {
        // Potential token reuse detected
        logger.warn(`Refresh token not found in DB — possible reuse attack for userId: ${decoded.id}`);
        throw new ApiError(401, 'Refresh token has already been used or revoked');
    }

    // Delete old token (rotation)
    await RefreshToken.deleteOne({ _id: stored._id });

    // Issue new pair
    const newAccessToken = signAccessToken(decoded.id);
    const newRefreshToken = await createRefreshToken(decoded.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Revoke all refresh tokens for a user (logout).
 */
export const revokeAllUserTokens = async (userId) => {
    const result = await RefreshToken.deleteMany({ userId });
    logger.info(`Revoked ${result.deletedCount} refresh token(s) for user ${userId}`);
    return result.deletedCount;
};

/**
 * Write an entry to the AuditLog collection.
 */
export const writeAuditLog = async ({ userId, action, resourceType, resourceId, metadata, req }) => {
    try {
        await AuditLog.create({
            userId,
            action,
            resourceType,
            resourceId: resourceId ? String(resourceId) : null,
            metadata: metadata || {},
            ipAddress: req?.ip || req?.connection?.remoteAddress || null,
            userAgent: req?.headers?.['user-agent'] || null,
        });
    } catch (err) {
        // Non-critical — log but don't throw
        logger.warn(`AuditLog write failed: ${err.message}`);
    }
};
