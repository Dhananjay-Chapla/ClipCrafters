import Project from '../models/Project.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiResponse.js';

// ─── Create Project ────────────────────────────────────────────────────────
export const createProject = async (ownerId, projectData) => {
    const project = await Project.create({
        ...projectData,
        owner: ownerId,
    });

    // Add project reference to user's projects array
    await User.findByIdAndUpdate(ownerId, {
        $push: { projects: project._id },
    });

    return project;
};

// ─── Get All Projects by User ──────────────────────────────────────────────
export const getProjectsByUser = async (userId, { status, page = 1, limit = 10 } = {}) => {
    const filter = { owner: userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
        Project.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v')
            .lean(),
        Project.countDocuments(filter),
    ]);

    return {
        projects,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ─── Get Single Project ────────────────────────────────────────────────────
export const getProjectById = async (projectId, userId) => {
    const project = await Project.findById(projectId)
        .populate('owner', 'name email avatar')
        .populate('collaborators', 'name email avatar')
        .populate('videos', 'title generationStatus createdAt');

    if (!project) throw new ApiError(404, 'Project not found');

    // Ownership / collaborator check
    const isOwner = project.owner._id.toString() === userId.toString();
    const isCollaborator = project.collaborators.some(
        (c) => c._id.toString() === userId.toString()
    );

    if (!isOwner && !isCollaborator) {
        throw new ApiError(403, 'Access denied — you do not belong to this project');
    }

    return project;
};

// ─── Update Project ────────────────────────────────────────────────────────
export const updateProject = async (projectId, userId, updates) => {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');

    if (project.owner.toString() !== userId.toString()) {
        throw new ApiError(403, 'Only the project owner can update it');
    }

    const ALLOWED = ['title', 'description', 'status', 'sourceType', 'sourceFile'];
    ALLOWED.forEach((key) => {
        if (updates[key] !== undefined) project[key] = updates[key];
    });

    await project.save();
    return project;
};

// ─── Delete Project ────────────────────────────────────────────────────────
export const deleteProject = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');

    if (project.owner.toString() !== userId.toString()) {
        throw new ApiError(403, 'Only the project owner can delete it');
    }

    await project.deleteOne();

    // Remove from user's projects array
    await User.findByIdAndUpdate(userId, {
        $pull: { projects: projectId },
    });

    return { deleted: true };
};
