import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// ─── Resend Client ─────────────────────────────────────────────────────────
let resendClient = null;

const getClient = () => {
    if (!resendClient) {
        const apiKey = env.emailApiKey || env.resendApiKey;
        if (!apiKey) {
            throw new Error('Resend API key is not configured (EMAIL_API_KEY / RESEND_API_KEY)');
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
};

/**
 * sendEmail — send a transactional email via Resend
 *
 * In development, if RESEND_VERIFIED_EMAIL is set, all recipients are
 * redirected to that verified address (Resend free tier limitation).
 *
 * @param {{ to: string|string[], subject: string, html: string, text?: string }} options
 * @returns {Promise<{ id: string }>}
 *
 * @example
 *   await sendEmail({
 *     to: 'user@example.com',
 *     subject: 'Welcome to ClipCrafters',
 *     html: '<h1>Welcome!</h1>',
 *   });
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const client = getClient();

        // Development redirect — Resend only sends to verified addresses on free tier
        const recipient =
            env.nodeEnv !== 'production' && env.resendVerifiedEmail
                ? env.resendVerifiedEmail
                : to;

        if (env.nodeEnv !== 'production' && env.resendVerifiedEmail) {
            logger.warn(`📧 [DEV] Email redirected from ${Array.isArray(to) ? to.join(', ') : to} → ${env.resendVerifiedEmail}`);
        }

        const payload = {
            from: env.emailFrom,
            to: recipient,
            subject,
            html,
            ...(text && { text }),
        };

        const { data, error } = await client.emails.send(payload);

        if (error) {
            throw new Error(error.message);
        }

        logger.info(`📧 Email sent to ${recipient} | Subject: "${subject}" | ID: ${data.id}`);

        return { id: data.id };
    } catch (error) {
        logger.error(`❌ Email delivery failed — Subject: "${subject}" | Error: ${error.message}`);
        throw error;
    }
};
