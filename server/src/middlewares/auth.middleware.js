import { ApiError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { verifyAccessToken } from '../utils/token.js';

/**
 * protect — verifies JWT and attaches the decoded user to req.user
 * Supports both ACCESS_TOKEN_SECRET (new) and JWT_SECRET (legacy) tokens.
 * Usage: router.get('/me', protect, handler)
 */
export const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Not authorized — no token provided');
    }

    const token = authHeader.split(' ')[1];

    // verifyAccessToken throws ApiError(401) on failure
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
        throw new ApiError(401, 'Not authorized — user no longer exists');
    }

    req.user = user;
    next();
});

/**
 * restrictTo — role-based access control (RBAC)
 * Usage: router.delete('/:id', protect, restrictTo('admin'), handler)
 * @param {...string} roles - allowed roles
 */
export const restrictTo = (...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `Role "${req.user.role}" is not permitted to access this route`));
        }
        next();
    };


