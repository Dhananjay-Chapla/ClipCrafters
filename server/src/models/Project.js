import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [200, 'Title must not exceed 200 characters'],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description must not exceed 2000 characters'],
            default: '',
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Project owner is required'],
            index: true,
        },

        collaborators: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        status: {
            type: String,
            enum: {
                values: ['draft', 'processing', 'completed'],
                message: 'Status must be one of: draft, processing, completed',
            },
            default: 'draft',
            index: true,
        },

        sourceType: {
            type: String,
            enum: {
                values: ['research-paper', 'lecture-notes', 'report', 'text'],
                message: 'sourceType must be one of: research-paper, lecture-notes, report, text',
            },
            default: null,
        },

        sourceFile: {
            type: String,
            default: null,
            trim: true,
        },

        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Compound Index: owner + status for dashboard queries ─────────────────
projectSchema.index({ owner: 1, status: 1 });

export default mongoose.model('Project', projectSchema);
