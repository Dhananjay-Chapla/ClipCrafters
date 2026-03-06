import { Router } from 'express';
import { createEditHistory, getEditsByScene, undoEdit } from '../controllers/edit.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(protect);

router.post('/create', createEditHistory);
router.get('/scene/:sceneId', getEditsByScene);
router.post('/undo/:editId', undoEdit);

export default router;
