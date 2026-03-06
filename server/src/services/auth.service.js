import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

// ─── Generate JWT ──────────────────────────────────────────────────────────
export const generateJWT = (userId) =>
    jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// ─── Register User ─────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password }) => {
    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new ApiError(409, 'An account with this email already exists');
    }

    // Password hashing is handled by the User pre-save hook
    const user = await User.create({ name, email, password });

    const token = generateJWT(user._id);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

// ─── Login User ────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
    // Include password for comparison (select: false hides it by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateJWT(user._id);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
    };
};

// ─── Get User Profile ──────────────────────────────────────────────────────
export const getUserProfile = async (userId) => {
    const user = await User.findById(userId).populate('projects', 'title status createdAt');
    if (!user) throw new ApiError(404, 'User not found');
    return user;
};
