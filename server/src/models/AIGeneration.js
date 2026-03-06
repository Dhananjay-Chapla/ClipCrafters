import mongoose from 'mongoose';

const { Schema } = mongoose;

const aiGenerationSchema = new Schema(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project reference is required'],
            index: true,
        },

        videoId: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
            default: null,
        },

        agentType: {
            type: String,
            enum: {
                values: ['script-agent', 'visual-agent', 'voice-agent', 'factcheck-agent'],
                message: 'agentType must be one of: script-agent, visual-agent, voice-agent, factcheck-agent',
            },
            required: [true, 'Agent type is required'],
            index: true,
        },

        inputData: {
            type: Schema.Types.Mixed,
            default: null,
        },

        outputData: {
            type: Schema.Types.Mixed,
            default: null,
        },

        modelUsed: {
            type: String,
            trim: true,
            default: null,
        },

        tokensUsed: {
            type: Number,
            min: [0, 'Tokens used cannot be negative'],
            default: 0,
        },

        latencyMs: {
            type: Number,
            min: [0, 'Latency cannot be negative'],
            default: 0,
            comment: 'Request-to-response latency in milliseconds',
        },

        status: {
            type: String,
            enum: {
                values: ['success', 'failed'],
                message: 'Status must be either "success" or "failed"',
            },
            required: [true, 'Status is required'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Compound Index: projectId + agentType for AI cost analytics ──────────
aiGenerationSchema.index({ projectId: 1, agentType: 1 });
// ─── Index: status + createdAt for failure monitoring dashboards ──────────
aiGenerationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('AIGeneration', aiGenerationSchema);
