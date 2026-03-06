import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name must not exceed 100 characters'],
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
            index: true,
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Exclude password from default queries
        },

        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: 'Role must be either "user" or "admin"',
            },
            default: 'user',
        },

        avatar: {
            type: String,
            default: null,
        },

        projects: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Project',
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Pre-Save Middleware: Hash Password ────────────────────────────────────
userSchema.pre('save', async function (next) {
    // Only hash when password is new or modified
    if (!this.isModified('password')) return next();

    try {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ─── Instance Method: Compare Password ────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: Full Profile (without password) ─────────────────────────────
userSchema.virtual('profile').get(function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        avatar: this.avatar,
        projectCount: this.projects.length,
    };
});

export default mongoose.model('User', userSchema);
