import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Otp from '../../models/Otp.js';
import { env } from '../../config/env.js';
import { sendSMS } from './sms.service.js';
import { sendEmail } from './email.service.js';
import { logger } from '../../utils/logger.js';

// ─── Generate a secure 6-digit OTP ────────────────────────────────────────
/**
 * generateOTP — produces a cryptographically random 6-digit number
 * Uses crypto.randomInt instead of Math.random for uniform distribution
 * @returns {string} 6-digit OTP string (zero-padded)
 */
export const generateOTP = () => {
    const otp = crypto.randomInt(100_000, 999_999);
    return String(otp);
};

// ─── Internal: store hashed OTP ───────────────────────────────────────────
const storeOTP = async (userId, rawOtp, deliveryMethod, deliveredTo) => {
    // Invalidate any existing OTPs for this user + method
    await Otp.deleteMany({ userId, deliveryMethod });

    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

    return Otp.create({ userId, otpHash, deliveryMethod, deliveredTo, expiresAt });
};

// ─── Send OTP via SMS ──────────────────────────────────────────────────────
/**
 * sendOTPviaSMS
 * @param {string} userId   - MongoDB User _id
 * @param {string} phone    - E.164 phone number
 * @returns {Promise<{ sid: string }>}
 *
 * @example
 *   await sendOTPviaSMS(user._id, '+919876543210');
 */
export const sendOTPviaSMS = async (userId, phone) => {
    const otp = generateOTP();
    const message = `Your ClipCrafters verification code is ${otp}. It expires in ${env.otpExpiryMinutes} minutes. Do not share it with anyone.`;

    await storeOTP(userId, otp, 'sms', phone);

    const result = await sendSMS(phone, message);

    logger.info(`OTP sent via SMS to ${phone} for user ${userId}`);
    return { sid: result.sid };
};

// ─── Send OTP via Email ────────────────────────────────────────────────────
/**
 * sendOTPviaEmail
 * @param {string} userId  - MongoDB User _id
 * @param {string} email   - Recipient email
 * @returns {Promise<{ id: string }>}
 *
 * @example
 *   await sendOTPviaEmail(user._id, 'user@example.com');
 */
export const sendOTPviaEmail = async (userId, email) => {
    const otp = generateOTP();

    await storeOTP(userId, otp, 'email', email);

    const result = await sendEmail({
        to: email,
        subject: 'Your ClipCrafters Verification Code',
        html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f0f;color:#fff;border-radius:12px">
        <h2 style="color:#a855f7;margin:0 0 8px">ClipCrafters 🎬</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:14px">Verification Code</p>
        <div style="background:#1a1a1a;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;color:#fff">
          ${otp}
        </div>
        <p style="color:#aaa;font-size:13px;margin:20px 0 0;text-align:center">
          Expires in <strong style="color:#fff">${env.otpExpiryMinutes} minutes</strong>.
          Never share this code with anyone.
        </p>
      </div>
    `,
        text: `Your ClipCrafters verification code is: ${otp}\nExpires in ${env.otpExpiryMinutes} minutes.`,
    });

    logger.info(`OTP sent via email to ${email} for user ${userId}`);
    return { id: result.id };
};

// ─── Verify OTP ────────────────────────────────────────────────────────────
/**
 * verifyOTP — find the active OTP record and validate the raw input
 * @param {string} userId
 * @param {string} rawOtp
 * @param {'sms'|'email'} deliveryMethod
 * @returns {Promise<boolean>}
 */
export const verifyOTP = async (userId, rawOtp, deliveryMethod) => {
    const record = await Otp.findOne({
        userId,
        deliveryMethod,
        isUsed: false,
        expiresAt: { $gt: new Date() },
    }).select('+otpHash');

    if (!record) return false;

    const isValid = await bcrypt.compare(String(rawOtp), record.otpHash);

    if (isValid) {
        record.isUsed = true;
        await record.save();
        logger.info(`✅ OTP verified for user ${userId} via ${deliveryMethod}`);
    }

    return isValid;
};
