import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/apiResponse.js';

// ─── Helper: Run validation and throw if errors ───────────────────────────
const runValidation = (rules) => [
    ...rules,
    (req, _res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation failed', errors.array().map(e => e.msg)));
        }
        next();
    },
];

// ─── Register Validator ───────────────────────────────────────────────────
export const validateRegister = runValidation([
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
]);

// ─── Login Validator ──────────────────────────────────────────────────────
export const validateLogin = runValidation([
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
]);

// ─── Verify OTP Validator ─────────────────────────────────────────────────
export const validateVerifyOtp = runValidation([
    body('otp')
        .notEmpty().withMessage('OTP is required')
        .matches(/^\d{6}$/).withMessage('OTP must be a 6-digit number'),
]);
