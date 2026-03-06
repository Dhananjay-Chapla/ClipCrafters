import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import * as videoService from '../services/video.service.js';
import { uploadBuffer } from '../services/cloudinary.service.js';
import Video from '../models/Video.js';
import Project from '../models/Project.js';

// ─── POST /api/videos/generate ───────────────────────────────────────────────
export const generateVideo = asyncHandler(async (req, res) => {
    const { projectId, sourceText } = req.body;

    if (!projectId) throw new ApiError(400, '"projectId" is required');

    // Find project and verify ownership
    const project = await Project.findOne({ _id: projectId, owner: req.user._id });
    if (!project) throw new ApiError(404, 'Project not found or access denied');

    const video = await videoService.createVideoFromText({
        text: sourceText || project.topic,
        projectId,
        userId: req.user._id,
        title: `${project.title} — Video`,
    });

    sendSuccess(res, 202, 'Video generation started — poll GET /api/videos/:id for status', { video });
});

// ─── POST /api/videos/upload ─────────────────────────────────────────────────
export const uploadVideo = asyncHandler(async (req, res) => {
    const { projectId, title } = req.body;

    if (!req.file) throw new ApiError(400, 'No file uploaded — send a file in the "sourceFile" field');
    if (!projectId) throw new ApiError(400, '"projectId" is required');

    const project = await Project.findOne({ _id: projectId, owner: req.user._id });
    if (!project) throw new ApiError(404, 'Project not found or access denied');

    // Upload buffer to Cloudinary
    const uploaded = await uploadBuffer(req.file.buffer, 'uploads', 'video');

    const video = await Video.create({
        projectId,
        title: title || req.file.originalname,
        cloudinaryUrl: uploaded.url,
        cloudinaryPublicId: uploaded.publicId,
        duration: uploaded.duration || 0,
        generationStatus: 'uploaded',
        createdBy: req.user._id,
    });

    await Project.findByIdAndUpdate(projectId, { $push: { videos: video._id } });

    sendSuccess(res, 201, 'Video uploaded successfully', {
        video,
        file: {
            originalName: req.file.originalname,
            size: req.file.size,
            url: uploaded.url,
        },
    });
});

// ─── GET /api/videos/:id ─────────────────────────────────────────────────────
export const getVideo = asyncHandler(async (req, res) => {
    const video = await videoService.getVideo(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Video retrieved', { video });
});

// ─── GET /api/videos/:id/status ──────────────────────────────────────────────
export const getVideoStatus = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id).select('generationStatus scenes').lean();
    if (!video) throw new ApiError(404, 'Video not found');

    sendSuccess(res, 200, 'Video status retrieved', {
        status: video.generationStatus,
        sceneCount: video.scenes?.length || 0,
    });
});
