import { Router } from 'express';
import {
    register, login, getMe,
    sendOtp, verifyOtp,
    refreshTokenHandler, logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateRegister, validateLogin, validateVerifyOtp } from '../validators/auth.validator.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refreshTokenHandler);

// ── Protected ──────────────────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.post('/send-otp', protect, authLimiter, sendOtp);
router.post('/verify-otp', protect, authLimiter, validateVerifyOtp, verifyOtp);
router.post('/logout', protect, logout);

export default router;
