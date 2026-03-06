import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/apiResponse.js';

// Configure Cloudinary once on import
cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
});

/**
 * Upload a file buffer (from Multer memoryStorage) to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'video' | 'image' | 'audio' | 'auto'
 * @returns {{ url: string, publicId: string, duration?: number }}
 */
export const uploadBuffer = async (buffer, folder, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `clipcrafters/${folder}`,
                resource_type: resourceType,
                // Auto-generate a unique public_id
                use_filename: false,
                unique_filename: true,
            },
            (error, result) => {
                if (error) {
                    logger.error(`Cloudinary upload failed: ${error.message}`);
                    return reject(new ApiError(502, `Cloudinary upload failed: ${error.message}`));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    duration: result.duration || null,
                    width: result.width || null,
                    height: result.height || null,
                    format: result.format,
                    bytes: result.bytes,
                });
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Upload a base64-encoded string (returned from FastAPI) to Cloudinary.
 * Detects resource type automatically from the data URI prefix.
 * @param {string} base64String - Raw base64 OR data URI (data:video/mp4;base64,...)
 * @param {string} folder - Cloudinary folder name
 * @returns {{ url: string, publicId: string }}
 */
export const uploadBase64 = async (base64String, folder) => {
    // Detect resource type from data URI prefix
    let resourceType = 'auto';
    if (base64String.startsWith('data:video/')) resourceType = 'video';
    else if (base64String.startsWith('data:audio/')) resourceType = 'video'; // Cloudinary treats audio as video
    else if (base64String.startsWith('data:image/')) resourceType = 'image';

    // Ensure it's a valid data URI
    const dataUri = base64String.startsWith('data:')
        ? base64String
        : `data:application/octet-stream;base64,${base64String}`;

    try {
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: `clipcrafters/${folder}`,
            resource_type: resourceType,
            use_filename: false,
            unique_filename: true,
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration || null,
            format: result.format,
        };
    } catch (error) {
        logger.error(`Cloudinary base64 upload failed: ${error.message}`);
        throw new ApiError(502, `Cloudinary upload failed: ${error.message}`);
    }
};

/**
 * Delete a file from Cloudinary by its public ID.
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        logger.warn(`Cloudinary delete failed for ${publicId}: ${error.message}`);
    }
};
