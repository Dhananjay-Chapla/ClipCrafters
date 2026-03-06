import { Router } from 'express';
import {
    getScenesByVideo,
    getScene,
    updateScene,
    regenerateScene,
    factCheckScene,
} from '../controllers/scene.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(protect);

router.get('/video/:videoId', getScenesByVideo);
router.get('/:sceneId', getScene);
router.put('/:sceneId', updateScene);
router.post('/:sceneId/regenerate', regenerateScene);
router.post('/:sceneId/fact-check', factCheckScene);

export default router;
