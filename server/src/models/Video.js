import mongoose from 'mongoose';

const { Schema } = mongoose;

const videoSchema = new Schema(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project reference is required'],
            index: true,
        },

        title: {
            type: String,
            required: [true, 'Video title is required'],
            trim: true,
            maxlength: [300, 'Title must not exceed 300 characters'],
        },

        duration: {
            type: Number,
            min: [0, 'Duration cannot be negative'],
            default: 0,
            comment: 'Duration in seconds',
        },

        script: {
            type: String,
            default: '',
        },

        voiceoverUrl: {
            type: String,
            default: null,
        },

        finalVideoUrl: {
            type: String,
            default: null,
        },

        generationStatus: {
            type: String,
            enum: {
                values: ['pending', 'processing', 'completed', 'failed'],
                message: 'generationStatus must be one of: pending, processing, completed, failed',
            },
            default: 'pending',
            index: true,
        },

        aiAgentVersion: {
            type: String,
            default: null,
            trim: true,
        },

        scenes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Scene',
            },
        ],

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator user reference is required'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Compound Index: projectId + generationStatus for status polls ─────────
videoSchema.index({ projectId: 1, generationStatus: 1 });

export default mongoose.model('Video', videoSchema);
