import mongoose from 'mongoose';

const { Schema } = mongoose;

const editHistorySchema = new Schema(
    {
        sceneId: {
            type: Schema.Types.ObjectId,
            ref: 'Scene',
            required: [true, 'Scene reference is required'],
            index: true,
        },

        videoId: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
            required: [true, 'Video reference is required'],
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true,
        },

        editType: {
            type: String,
            enum: {
                values: ['script', 'visual', 'voice', 'scene-order'],
                message: 'editType must be one of: script, visual, voice, scene-order',
            },
            required: [true, 'Edit type is required'],
        },

        previousValue: {
            type: Schema.Types.Mixed,
            default: null,
        },

        newValue: {
            type: Schema.Types.Mixed,
            default: null,
        },

        aiSuggested: {
            type: Boolean,
            default: false,
        },

        version: {
            type: Number,
            required: [true, 'Version number is required'],
            min: [1, 'Version must be at least 1'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Compound Index: sceneId + videoId for efficient edit log queries ──────
editHistorySchema.index({ sceneId: 1, videoId: 1 });
// ─── Compound Index: userId + createdAt for user activity timeline ─────────
editHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('EditHistory', editHistorySchema);
