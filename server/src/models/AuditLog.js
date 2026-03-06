import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
            // e.g. 'project.create', 'scene.update', 'video.generate'
        },
        resourceType: {
            type: String,
            required: true,
            enum: ['user', 'project', 'video', 'scene', 'editHistory', 'otp'],
        },
        resourceId: {
            type: String,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
            default: null,
        },
        userAgent: {
            type: String,
            default: null,
        },
    },
    { timestamps: true, versionKey: false }
);

// Index for quick user audit trail retrieval
auditLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
