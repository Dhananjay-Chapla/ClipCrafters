import { Router } from 'express';
import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
    validateCreateProject,
    validateUpdateProject,
} from '../validators/project.validator.js';

const router = Router();

// All project routes require authentication
router.use(protect);

router.post('/create', validateCreateProject, createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', validateUpdateProject, updateProject);
router.delete('/:id', deleteProject);

export default router;
