import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import * as sceneService from '../services/scene.service.js';

// ─── GET /api/scenes/video/:videoId ──────────────────────────────────────────
export const getScenesByVideo = asyncHandler(async (req, res) => {
    const scenes = await sceneService.getScenesByVideoId(req.params.videoId, req.user._id);
    sendSuccess(res, 200, 'Scenes retrieved', { scenes });
});

// ─── GET /api/scenes/:sceneId ──────────────────────────────────────────────
export const getScene = asyncHandler(async (req, res) => {
    const scene = await sceneService.getSceneById(req.params.sceneId, req.user._id);
    sendSuccess(res, 200, 'Scene retrieved', { scene });
});

// ─── PUT /api/scenes/:sceneId ─────────────────────────────────────────────
// Supports: script, visualPrompt, editInstructions (triggers FastAPI AI edit)
export const updateScene = asyncHandler(async (req, res) => {
    const scene = await sceneService.updateScene(req.params.sceneId, req.user._id, req.body);
    sendSuccess(res, 200, 'Scene updated and edit history recorded', { scene });
});

// ─── POST /api/scenes/:sceneId/regenerate ────────────────────────────────
// Body: { regenerateType: 'visuals' | 'audio' | 'both' }
export const regenerateScene = asyncHandler(async (req, res) => {
    const { regenerateType } = req.body;
    const VALID_TYPES = ['visuals', 'audio', 'both'];

    if (!regenerateType || !VALID_TYPES.includes(regenerateType)) {
        throw new ApiError(400, `"regenerateType" must be one of: ${VALID_TYPES.join(', ')}`);
    }

    const scene = await sceneService.regenerateScene(req.params.sceneId, req.user._id, regenerateType);
    sendSuccess(res, 200, `Scene ${regenerateType} regenerated successfully`, { scene });
});

// ─── POST /api/scenes/:sceneId/fact-check ─────────────────────────────────
// Body: { sourceText? }
export const factCheckScene = asyncHandler(async (req, res) => {
    const result = await sceneService.factCheckScene(
        req.params.sceneId,
        req.user._id,
        req.body.sourceText || null
    );
    sendSuccess(res, 200, 'Fact-check complete', result);
});
