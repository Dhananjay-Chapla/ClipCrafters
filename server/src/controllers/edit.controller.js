import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import EditHistory from '../models/EditHistory.js';
import Scene from '../models/Scene.js';
import Video from '../models/Video.js';
import Project from '../models/Project.js';
import { writeAuditLog } from '../services/refreshToken.service.js';

// Helper — verify user has read/write access via scene→video→project chain
const verifySceneAccess = async (sceneId, userId) => {
    const scene = await Scene.findById(sceneId).lean();
    if (!scene) throw new ApiError(404, 'Scene not found');

    const video = await Video.findById(scene.videoId).lean();
    if (!video) throw new ApiError(404, 'Associated video not found');

    const project = await Project.findOne({
        _id: video.projectId,
        $or: [{ owner: userId }, { collaborators: userId }],
    });
    if (!project) throw new ApiError(403, 'Access denied');

    return { scene, video, project };
};

// ─── POST /api/edits/create ───────────────────────────────────────────────────
export const createEditHistory = asyncHandler(async (req, res) => {
    const { sceneId, videoId, changeType, before, after, aiSuggested, version } = req.body;

    if (!sceneId || !changeType || !videoId) {
        throw new ApiError(400, '"sceneId", "videoId", and "changeType" are required');
    }

    await verifySceneAccess(sceneId, req.user._id);

    const record = await EditHistory.create({
        sceneId,
        videoId,
        userId: req.user._id,
        editType: changeType,
        previousValue: before ?? null,
        newValue: after ?? null,
        aiSuggested: Boolean(aiSuggested),
        version: version ?? 1,
    });

    await writeAuditLog({
        userId: req.user._id,
        action: 'scene.edit',
        resourceType: 'editHistory',
        resourceId: record._id,
        metadata: { sceneId, changeType },
    });

    sendSuccess(res, 201, 'Edit history record created', { edit: record });
});

// ─── GET /api/edits/scene/:sceneId ───────────────────────────────────────────
export const getEditsByScene = asyncHandler(async (req, res) => {
    await verifySceneAccess(req.params.sceneId, req.user._id);

    const edits = await EditHistory.find({ sceneId: req.params.sceneId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

    sendSuccess(res, 200, 'Edit history retrieved', { edits, total: edits.length });
});

// ─── POST /api/edits/undo/:editId ─────────────────────────────────────────────
export const undoEdit = asyncHandler(async (req, res) => {
    const editRecord = await EditHistory.findById(req.params.editId).lean();
    if (!editRecord) throw new ApiError(404, 'Edit record not found');

    // Verify access
    await verifySceneAccess(editRecord.sceneId, req.user._id);

    // Map editType back to scene field
    const FIELD_MAP = {
        script: 'scriptText',
        visual: 'visualPrompt',
        voice: 'voiceoverUrl',
        'scene-order': 'sceneNumber',
    };

    const targetField = FIELD_MAP[editRecord.editType];
    if (!targetField) throw new ApiError(400, `Cannot undo edits of type "${editRecord.editType}"`);

    // Revert the scene field to "before" value
    const scene = await Scene.findById(editRecord.sceneId);
    if (!scene) throw new ApiError(404, 'Scene not found');

    const restoredValue = editRecord.previousValue;
    scene[targetField] = restoredValue;
    scene.version += 1;
    await scene.save();

    // Create a new edit record for the undo action itself
    await EditHistory.create({
        sceneId: editRecord.sceneId,
        videoId: editRecord.videoId,
        userId: req.user._id,
        editType: editRecord.editType,
        previousValue: editRecord.newValue,
        newValue: restoredValue,
        aiSuggested: false,
        version: scene.version,
    });

    sendSuccess(res, 200, 'Undo successful — scene reverted to previous state', { scene });
});
