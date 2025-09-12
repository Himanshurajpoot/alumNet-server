import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getMyProfile, updateMyProfile, getPublicProfileById, uploadAvatar } from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', requireAuth, getMyProfile);
router.put('/me', requireAuth, updateMyProfile);
router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.get('/:id', getPublicProfileById);


export default router;


