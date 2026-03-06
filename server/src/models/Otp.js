import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const otpSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true,
        },

        otpHash: {
            type: String,
            required: [true, 'OTP hash is required'],
            select: false, // never expose hash in API responses
        },

        deliveryMethod: {
            type: String,
            enum: {
                values: ['sms', 'email'],
                message: 'deliveryMethod must be "sms" or "email"',
            },
            required: [true, 'Delivery method is required'],
        },

        // The recipient (phone or email) for audit/debugging
        deliveredTo: {
            type: String,
            required: [true, 'Delivery target is required'],
        },

        isUsed: {
            type: Boolean,
            default: false,
        },

        // TTL field — MongoDB will auto-delete the document after expiry
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, // TTL index
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Instance Method: Verify raw OTP against stored hash ─────────────────
otpSchema.methods.verifyOtp = async function (rawOtp) {
    return bcrypt.compare(String(rawOtp), this.otpHash);
};

export default mongoose.model('Otp', otpSchema);
