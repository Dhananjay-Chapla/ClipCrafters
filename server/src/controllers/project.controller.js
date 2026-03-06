import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as projectService from '../services/project.service.js';

// POST /api/projects/create
export const createProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject(req.user._id, req.body);
    sendSuccess(res, 201, 'Project created successfully', project);
});

// GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await projectService.getProjectsByUser(req.user._id, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
    });
    sendSuccess(res, 200, 'Projects retrieved', result);
});

// GET /api/projects/:id
export const getProject = asyncHandler(async (req, res) => {
    const project = await projectService.getProjectById(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Project retrieved', project);
});

// PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.params.id, req.user._id, req.body);
    sendSuccess(res, 200, 'Project updated successfully', project);
});

// DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
    await projectService.deleteProject(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Project deleted successfully');
});
