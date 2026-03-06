import Scene from '../models/Scene.js';
import Video from '../models/Video.js';
import Project from '../models/Project.js';
import EditHistory from '../models/EditHistory.js';
import { ApiError } from '../utils/apiResponse.js';
import { generateVisual, generateVoice, factCheckContent } from './ai.service.js';
import { uploadBase64 } from './cloudinary.service.js';
import { logger } from '../utils/logger.js';

// ─── Helper: verify user owns the scene via project chain ───────────────────
const assertSceneAccess = async (sceneId, userId) => {
    const scene = await Scene.findById(sceneId);
    if (!scene) throw new ApiError(404, 'Scene not found');

    const video = await Video.findById(scene.videoId).lean();
    if (!video) throw new ApiError(404, 'Associated video not found');

    const project = await Project.findOne({
        _id: video.projectId,
        $or: [{ owner: userId }, { collaborators: userId }],
    }).lean();
    if (!project) throw new ApiError(403, 'Access denied');

    return { scene, video, project };
};

// ─── Get All Scenes for a Video ─────────────────────────────────────────────
export const getScenesByVideoId = async (videoId, userId) => {
    const video = await Video.findById(videoId).lean();
    if (!video) throw new ApiError(404, 'Video not found');

    const project = await Project.findOne({
        _id: video.projectId,
        $or: [{ owner: userId }, { collaborators: userId }],
    }).lean();
    if (!project) throw new ApiError(403, 'Access denied');

    return Scene.find({ videoId }).sort({ sceneNumber: 1 }).lean();
};

// ─── Get Single Scene ────────────────────────────────────────────────────────
export const getSceneById = async (sceneId, userId) => {
    const { scene } = await assertSceneAccess(sceneId, userId);
    return scene;
};

// ─── Update Scene (with optional AI edit) ────────────────────────────────────
export const updateScene = async (sceneId, userId, updates) => {
    const { scene, video, project } = await assertSceneAccess(sceneId, userId);
    const { script, visualPrompt, editInstructions } = updates;

    let newScript = script !== undefined ? script : scene.scriptText;
    let newVisual = visualPrompt !== undefined ? visualPrompt : scene.visualPrompt;

    // If editInstructions provided — call FastAPI AI edit agent
    if (editInstructions) {
        try {
            const { generateScript } = await import('./ai.service.js');
            // Re-use script agent with edit context
            const aiResult = await generateScript(
                `EDIT INSTRUCTIONS: ${editInstructions}\n\nCURRENT SCRIPT: ${scene.scriptText}\n\nCURRENT VISUAL PROMPT: ${scene.visualPrompt}`,
                video.projectId
            );
            if (aiResult.script) newScript = aiResult.script;
            if (aiResult.visualPrompt || aiResult.visual_prompt) {
                newVisual = aiResult.visualPrompt || aiResult.visual_prompt;
            }
        } catch (err) {
            logger.warn(`AI edit failed for scene ${sceneId}: ${err.message} — using manual edits`);
        }
    }

    // Snapshot before values
    const previousScript = scene.scriptText;
    const previousVisual = scene.visualPrompt;

    scene.scriptText = newScript;
    scene.visualPrompt = newVisual;
    scene.version = (scene.version || 0) + 1;
    await scene.save();

    // Auto-record edit history
    if (newScript !== previousScript || newVisual !== previousVisual) {
        await EditHistory.create({
            sceneId,
            videoId: scene.videoId,
            userId,
            editType: editInstructions ? 'ai-edit' : 'script',
            previousValue: { scriptText: previousScript, visualPrompt: previousVisual },
            newValue: { scriptText: newScript, visualPrompt: newVisual },
            aiSuggested: Boolean(editInstructions),
            version: scene.version,
        });
    }

    return scene;
};

// ─── Regenerate Scene (visuals / audio / both) ───────────────────────────────
export const regenerateScene = async (sceneId, userId, regenerateType) => {
    const { scene, video } = await assertSceneAccess(sceneId, userId);

    const updates = {};

    if (regenerateType === 'visuals' || regenerateType === 'both') {
        try {
            const result = await generateVisual(scene.visualPrompt, video.projectId, video._id);
            if (result.image_base64 || result.video_base64) {
                const base64 = result.video_base64 || result.image_base64;
                const uploaded = await uploadBase64(base64, 'scenes/visuals');
                updates.clipUrl = uploaded.url;
            }
        } catch (err) {
            logger.error(`Visual regeneration failed for scene ${sceneId}: ${err.message}`);
            throw new ApiError(502, `Visual regeneration failed: ${err.message}`);
        }
    }

    if (regenerateType === 'audio' || regenerateType === 'both') {
        try {
            const result = await generateVoice(scene.scriptText, video.projectId, video._id);
            if (result.audio_base64) {
                const uploaded = await uploadBase64(result.audio_base64, 'scenes/audio');
                updates.voiceoverUrl = uploaded.url;
            }
        } catch (err) {
            logger.error(`Audio regeneration failed for scene ${sceneId}: ${err.message}`);
            throw new ApiError(502, `Audio regeneration failed: ${err.message}`);
        }
    }

    if (Object.keys(updates).length > 0) {
        Object.assign(scene, updates);
        scene.version = (scene.version || 0) + 1;
        await scene.save();
    }

    return scene;
};

// ─── Fact-Check Scene ────────────────────────────────────────────────────────
export const factCheckScene = async (sceneId, userId, sourceText) => {
    const { scene } = await assertSceneAccess(sceneId, userId);

    const content = sourceText
        ? `SCRIPT: ${scene.scriptText}\n\nSOURCE TEXT: ${sourceText}`
        : scene.scriptText;

    let result;
    try {
        result = await factCheckContent(content, scene.videoId?.toString() || sceneId);
    } catch (err) {
        throw new ApiError(502, `Fact-check service error: ${err.message}`);
    }

    // Save confidence score back to scene
    const confidence = result.confidence_score ?? result.confidenceScore ?? null;
    if (confidence !== null) {
        scene.confidenceScore = confidence;
        await scene.save();
    }

    return {
        sceneId,
        confidenceScore: confidence,
        issues: result.issues || result.errors || [],
        summary: result.summary || null,
        verified: (confidence !== null && confidence >= 0.7),
    };
};
