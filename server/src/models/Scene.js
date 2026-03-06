import mongoose from 'mongoose';

const { Schema } = mongoose;

const sceneSchema = new Schema(
    {
        videoId: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
            required: [true, 'Video reference is required'],
            index: true,
        },

        sceneNumber: {
            type: Number,
            required: [true, 'Scene number is required'],
            min: [1, 'Scene number must be at least 1'],
            index: true,
        },

        scriptText: {
            type: String,
            default: '',
            trim: true,
        },

        visualPrompt: {
            type: String,
            default: '',
            trim: true,
        },

        visualUrl: {
            type: String,
            default: null,
        },

        voiceoverUrl: {
            type: String,
            default: null,
        },

        duration: {
            type: Number,
            min: [0, 'Duration cannot be negative'],
            default: 0,
            comment: 'Duration in seconds',
        },

        aiGenerated: {
            type: Boolean,
            default: true,
        },

        sourceReference: {
            type: String,
            default: null,
            trim: true,
            example: 'Paper Section 3.2',
        },

        confidenceScore: {
            type: Number,
            min: [0, 'Confidence score must be between 0 and 1'],
            max: [1, 'Confidence score must be between 0 and 1'],
            default: null,
        },

        version: {
            type: Number,
            default: 1,
            min: [1, 'Version must be at least 1'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Compound Index: videoId + sceneNumber for ordered scene queries ───────
sceneSchema.index({ videoId: 1, sceneNumber: 1 }, { unique: true });

export default mongoose.model('Scene', sceneSchema);
