import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

// ─── Ensure local uploads directory exists ─────────────────────────────────
const UPLOADS_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Allowed MIME Types ────────────────────────────────────────────────────
const ALLOWED_TYPES = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
];

// ─── Disk Storage (temp before Cloudinary upload) ─────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const safeOriginal = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${safeOriginal}`);
    },
});

const fileFilter = (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(415, `Unsupported file type: ${file.mimetype}`), false);
    }
};

// ─── Base multer instance ──────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: env.maxFileSize },
});

// ─── Multer Error Handler ──────────────────────────────────────────────────
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(413, `File too large. Max size: ${env.maxFileSize / 1024 / 1024} MB`));
        }
        return next(new ApiError(400, `File upload error: ${err.message}`));
    }
    next(err);
};

// ─── Cloudinary Upload Middleware ──────────────────────────────────────────
/**
 * uploadToCloud — after multer saves the file locally, this middleware
 * uploads it to Cloudinary (hackamined folder) and attaches the result
 * to req.cloudinary.  The local temp file is deleted afterwards.
 *
 * Sub-folder is determined by MIME type:
 *   image/*  → hackamined/images
 *   video/*  → hackamined/videos
 *   *        → hackamined/documents
 *
 * Usage:
 *   router.post('/upload', upload.single('file'), uploadToCloud, handler)
 *   // Access in handler: req.cloudinary.secureUrl
 */
export const uploadToCloud = async (req, res, next) => {
    if (!req.file) return next();

    const mime = req.file.mimetype;
    let subFolder = 'documents';
    let resourceType = 'raw';

    if (mime.startsWith('image/')) {
        subFolder = 'images';
        resourceType = 'image';
    } else if (mime.startsWith('video/')) {
        subFolder = 'videos';
        resourceType = 'video';
    }

    try {
        const result = await uploadToCloudinary(req.file.path, {
            subFolder,
            resource_type: resourceType,
        });

        req.cloudinary = result;

        // Clean up local temp file
        fs.unlink(req.file.path, (err) => {
            if (err) logger.warn(`Could not delete temp file ${req.file.path}: ${err.message}`);
        });

        next();
    } catch (error) {
        logger.error(`Cloudinary middleware upload failed: ${error.message}`);
        next(new ApiError(500, 'File upload to cloud storage failed'));
    }
};

export default upload;
