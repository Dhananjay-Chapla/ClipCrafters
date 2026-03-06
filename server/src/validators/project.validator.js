import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/apiResponse.js';

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

// ─── Create Project Validator ─────────────────────────────────────────────
export const validateCreateProject = runValidation([
    body('title')
        .trim()
        .notEmpty().withMessage('Project title is required')
        .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),

    body('topic')
        .trim()
        .notEmpty().withMessage('Topic is required')
        .isLength({ max: 500 }).withMessage('Topic must not exceed 500 characters'),

    body('style')
        .optional()
        .isIn(['professional', 'conversational', 'academic'])
        .withMessage('Style must be professional, conversational, or academic'),

    body('duration')
        .optional()
        .isInt({ min: 10, max: 600 })
        .withMessage('Duration must be between 10 and 600 seconds'),
]);

// ─── Update Project Validator ─────────────────────────────────────────────
export const validateUpdateProject = runValidation([
    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),

    body('topic')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Topic must not exceed 500 characters'),

    body('style')
        .optional()
        .isIn(['professional', 'conversational', 'academic'])
        .withMessage('Style must be professional, conversational, or academic'),

    body('status')
        .optional()
        .isIn(['draft', 'processing', 'completed', 'failed'])
        .withMessage('Status must be draft, processing, completed, or failed'),
]);
