import twilio from 'twilio';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// ─── Lazy-initialise Twilio client ─────────────────────────────────────────
// Client is created on first use so startup doesn't fail if Twilio isn't configured
let twilioClient = null;

const getClient = () => {
    if (!twilioClient) {
        if (!env.twilioAccountSid || !env.twilioAuthToken) {
            throw new Error('Twilio credentials are not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)');
        }
        twilioClient = twilio(env.twilioAccountSid, env.twilioAuthToken);
    }
    return twilioClient;
};

/**
 * sendSMS — send an SMS via Twilio
 *
 * @param {string} to      - E.164 format phone number e.g. "+919876543210"
 * @param {string} message - Text body to send
 * @returns {Promise<{ sid: string, status: string }>}
 *
 * @example
 *   await sendSMS('+919876543210', 'Your OTP is 482193');
 */
export const sendSMS = async (to, message) => {
    try {
        const client = getClient();

        if (!env.twilioPhoneNumber) {
            throw new Error('TWILIO_PHONE_NUMBER is not configured');
        }

        const result = await client.messages.create({
            body: message,
            from: env.twilioPhoneNumber,
            to,
        });

        logger.info(`📱 SMS sent to ${to} | SID: ${result.sid} | Status: ${result.status}`);

        return {
            sid: result.sid,
            status: result.status,
        };
    } catch (error) {
        logger.error(`❌ SMS delivery failed to ${to}: ${error.message}`);
        throw error;
    }
};
