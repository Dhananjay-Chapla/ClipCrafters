// Full auth controller — register, login, getMe, sendOtp, verifyOtp, refresh, logout
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';
import { sendOTPviaSMS, sendOTPviaEmail, verifyOTP } from '../services/notification/otp.service.js';
import { createRefreshToken, rotateRefreshToken, revokeAllUserTokens, writeAuditLog } from '../services/refreshToken.service.js';
import { signAccessToken } from '../utils/token.js';

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    const user = result.user;
    const uid = user._id || user.id;

    const accessToken = signAccessToken(uid);
    const refreshToken = await createRefreshToken(uid);

    await writeAuditLog({ userId: uid, action: 'auth.register', resourceType: 'user', resourceId: uid, req });

    sendSuccess(res, 201, 'Account created successfully', { token: accessToken, refreshToken, user });
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    const user = result.user;
    const uid = user._id || user.id;

    const accessToken = signAccessToken(uid);
    const refreshToken = await createRefreshToken(uid);

    await writeAuditLog({ userId: uid, action: 'auth.login', resourceType: 'user', resourceId: uid, req });

    sendSuccess(res, 200, 'Login successful', { token: accessToken, refreshToken, user });
});

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.user._id);
    sendSuccess(res, 200, 'User profile retrieved', { user });
});

// ─── Send OTP ─────────────────────────────────────────────────────────────────
export const sendOtp = asyncHandler(async (req, res) => {
    const { method, phone, email: emailAddr } = req.body;
    const userId = req.user._id;

    if (!method || !['sms', 'email'].includes(method)) {
        throw new ApiError(400, '"method" must be "sms" or "email"');
    }

    if (method === 'sms') {
        if (!phone) throw new ApiError(400, '"phone" is required for SMS delivery');
        const result = await sendOTPviaSMS(userId, phone);
        return sendSuccess(res, 200, `OTP sent via SMS to ${phone}`, { sid: result.sid });
    }

    const recipient = emailAddr || req.user.email;
    if (!recipient) throw new ApiError(400, '"email" is required for email delivery');
    const result = await sendOTPviaEmail(userId, recipient);
    sendSuccess(res, 200, `OTP sent via email to ${recipient}`, { id: result.id });
});

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = asyncHandler(async (req, res) => {
    const { otp, method } = req.body;
    const userId = req.user._id;

    if (!otp || !method) throw new ApiError(400, '"otp" and "method" are required');
    if (!['sms', 'email'].includes(method)) throw new ApiError(400, '"method" must be "sms" or "email"');
    if (!/^\d{6}$/.test(String(otp))) throw new ApiError(400, '"otp" must be a 6-digit number');

    const isValid = await verifyOTP(userId, otp, method);
    if (!isValid) throw new ApiError(401, 'Invalid or expired OTP');

    await writeAuditLog({ userId, action: 'auth.verify-otp', resourceType: 'user', resourceId: userId, req });

    sendSuccess(res, 200, 'OTP verified successfully — account is now verified', { verified: true });
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshTokenHandler = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(400, '"refreshToken" is required');

    const { accessToken, refreshToken: newRefresh } = await rotateRefreshToken(refreshToken);

    sendSuccess(res, 200, 'Token refreshed', { token: accessToken, refreshToken: newRefresh });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
    await revokeAllUserTokens(req.user._id);
    await writeAuditLog({ userId: req.user._id, action: 'auth.logout', resourceType: 'user', resourceId: req.user._id, req });
    sendSuccess(res, 200, 'Logged out successfully');
});
