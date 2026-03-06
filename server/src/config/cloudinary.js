import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// ─── Configure Cloudinary once ─────────────────────────────────────────────
cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
});

// ─── Default Upload Options ────────────────────────────────────────────────
// All uploads go into the "hackamined" folder; sub-folders are added per upload type
const BASE_FOLDER = env.cloudinaryFolder; // "hackamined"

/**
 * uploadToCloudinary — upload a local file path or data URL to Cloudinary
 *
 * @param {string} filePath       - Local file path or data URI
 * @param {object} [options]      - Cloudinary upload options overrides
 * @param {string} [options.subFolder] - Sub-folder inside hackamined (e.g., "avatars", "videos")
 * @param {string} [options.resource_type] - "image" | "video" | "raw" | "auto"
 * @param {string} [options.public_id]     - Custom public_id (optional)
 * @returns {Promise<{ url: string, secureUrl: string, publicId: string, format: string, bytes: number }>}
 *
 * @example
 *   const result = await uploadToCloudinary('/uploads/photo.jpg', { subFolder: 'avatars' });
 *   console.log(result.secureUrl);
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
    const { subFolder = '', resource_type = 'auto', public_id, ...rest } = options;

    const folder = subFolder
        ? `${BASE_FOLDER}/${subFolder}`
        : BASE_FOLDER;

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type,
            ...(public_id && { public_id }),
            overwrite: false,
            use_filename: true,
            unique_filename: true,
            ...rest,
        });

        logger.info(`☁️  Uploaded to Cloudinary: ${result.public_id} (${result.bytes} bytes) → ${folder}`);

        return {
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width || null,
            height: result.height || null,
            duration: result.duration || null,
        };
    } catch (error) {
        logger.error(`❌ Cloudinary upload failed: ${error.message}`);
        throw error;
    }
};

/**
 * deleteFromCloudinary — remove an asset by public_id
 *
 * @param {string} publicId        - Cloudinary public_id
 * @param {string} [resource_type] - "image" | "video" | "raw"
 * @returns {Promise<{ result: string }>}
 */
export const deleteFromCloudinary = async (publicId, resource_type = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type });
        logger.info(`🗑️  Deleted from Cloudinary: ${publicId} → ${result.result}`);
        return { result: result.result };
    } catch (error) {
        logger.error(`❌ Cloudinary delete failed for ${publicId}: ${error.message}`);
        throw error;
    }
};

/**
 * getCloudinaryUrl — build an optimised delivery URL without uploading
 *
 * @param {string} publicId
 * @param {object} [transforms] - Cloudinary transformation options
 * @returns {string}
 */
export const getCloudinaryUrl = (publicId, transforms = {}) =>
    cloudinary.url(publicId, { secure: true, ...transforms });

export default cloudinary;
