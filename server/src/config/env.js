// Centralized environment variable validation
// Fails fast at startup if critical env vars are missing

const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

export const env = {
    // ── Server ─────────────────────────────────────
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // ── Database ───────────────────────────────────
    mongoUri: process.env.MONGO_URI,

    // ── FastAPI ────────────────────────────────────
    fastApiUrl: process.env.FASTAPI_URL || 'http://localhost:8000',

    // ── JWT / Tokens ───────────────────────────────
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '1d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    verificationSecret: process.env.VERIFICATION_TOKEN_SECRET || '',

    // ── Bcrypt & Password Policy ───────────────────
    bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    passwordExpiryDays: parseInt(process.env.PASSWORD_EXPIRY_DAYS) || 30,
    passwordReminderDaysBefore: parseInt(process.env.PASSWORD_REMINDER_DAYS_BEFORE) || 5,

    // ── CORS ───────────────────────────────────────
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // ── File Uploads ───────────────────────────────
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,

    // ── Cloudinary ─────────────────────────────────
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'hackamined',

    // ── Third-party AI ─────────────────────────────
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    elevenLabsKey: process.env.ELEVENLABS_API_KEY || '',

    // ── Twilio SMS ─────────────────────────────────
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',

    // ── Resend Email ───────────────────────────────
    resendApiKey: process.env.RESEND_API_KEY || '',
    emailApiKey: process.env.EMAIL_API_KEY || '',
    emailApiUrl: process.env.EMAIL_API_URL || 'https://api.resend.com/emails',
    emailFrom: process.env.EMAIL_FROM || 'ClipCrafters <no-reply@clipcrafters.app>',
    resendVerifiedEmail: process.env.RESEND_VERIFIED_EMAIL || '',

    // ── OTP ────────────────────────────────────────
    otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,
};
