import Video from '../models/Video.js';
import Scene from '../models/Scene.js';
import Project from '../models/Project.js';
import { generateScript, generateScenes } from './ai.service.js';
import { ApiError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

// ─── Create Video from Text ─────────────────────────────────────────────────
export const createVideoFromText = async ({ text, projectId, userId, title }) => {
    // 1. Verify project exists and belongs to user
    const project = await Project.findOne({ _id: projectId, owner: userId });
    if (!project) throw new ApiError(404, 'Project not found or access denied');

    // 2. Create video stub with pending status
    const video = await Video.create({
        projectId,
        title: title || `Video — ${new Date().toLocaleDateString()}`,
        generationStatus: 'processing',
        createdBy: userId,
    });

    // 3. Mark project as processing
    await Project.findByIdAndUpdate(projectId, {
        status: 'processing',
        $push: { videos: video._id },
    });

    // 4. Generate script via AI agent (async — runs after response)
    generateScriptAndScenes(video._id, projectId, text).catch((err) =>
        logger.error(`Background generation failed for video ${video._id}: ${err.message}`)
    );

    return video;
};

// ─── Background: Generate Script → Scenes ──────────────────────────────────
const generateScriptAndScenes = async (videoId, projectId, text) => {
    try {
        // Step 1 — script
        const scriptResult = await generateScript(text, projectId);
        const script = scriptResult.script || scriptResult.text || '';

        await Video.findByIdAndUpdate(videoId, { script });

        // Step 2 — scenes
        const scenesResult = await generateScenes(script, projectId, videoId);
        const rawScenes = scenesResult.scenes || [];

        // Bulk insert scenes
        const sceneDocs = rawScenes.map((s, idx) => ({
            videoId,
            sceneNumber: idx + 1,
            scriptText: s.scriptText || s.text || '',
            visualPrompt: s.visualPrompt || s.prompt || '',
            duration: s.duration || 0,
            aiGenerated: true,
            sourceReference: s.sourceReference || null,
            confidenceScore: s.confidenceScore ?? null,
        }));

        const savedScenes = await Scene.insertMany(sceneDocs);
        const sceneIds = savedScenes.map((s) => s._id);

        // Update video with scenes & completed status
        await Video.findByIdAndUpdate(videoId, {
            scenes: sceneIds,
            generationStatus: 'completed',
        });

        await Project.findByIdAndUpdate(projectId, { status: 'completed' });

        logger.info(`✅ Video ${videoId} generation complete — ${sceneIds.length} scenes created`);
    } catch (error) {
        await Video.findByIdAndUpdate(videoId, { generationStatus: 'failed' });
        logger.error(`Video ${videoId} generation failed: ${error.message}`);
        throw error;
    }
};

// ─── Get Video ──────────────────────────────────────────────────────────────
export const getVideo = async (videoId, userId) => {
    const video = await Video.findById(videoId)
        .populate('scenes')
        .populate('createdBy', 'name email');

    if (!video) throw new ApiError(404, 'Video not found');

    // Verify access via project ownership
    const project = await Project.findOne({
        _id: video.projectId,
        $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!project) throw new ApiError(403, 'Access denied');

    return video;
};

// ─── Get Scenes for Video ────────────────────────────────────────────────────
export const getScenesByVideo = async (videoId, userId) => {
    // Ensure user has access to the video's project
    const video = await Video.findById(videoId).lean();
    if (!video) throw new ApiError(404, 'Video not found');

    const project = await Project.findOne({
        _id: video.projectId,
        $or: [{ owner: userId }, { collaborators: userId }],
    });
    if (!project) throw new ApiError(403, 'Access denied');

    const scenes = await Scene.find({ videoId })
        .sort({ sceneNumber: 1 })
        .lean();

    return scenes;
};
